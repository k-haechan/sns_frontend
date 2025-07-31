"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import React from "react";
import { components } from "@/schema";
import { useAuthStore } from '../../../store/useAuthStore';
import MemberInfo from "../../common/MemberInfo";

type PostResponse = components["schemas"]["PostResponse"];
type CommentResponse = components["schemas"]["CommentResponse"] & { member?: components["schemas"]["MemberBriefResponse"] };

export default function PostDetailPage() {
  const { postId } = useParams();
  const [post, setPost] = useState<PostResponse | null>(null);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [commentPage, setCommentPage] = useState(0);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState<CommentResponse | null>(null);

  const { memberId } = useAuthStore();
  

  const isMyPost = post?.author?.member_id && memberId && post.author.member_id === memberId;

  const fetchComments = async (page: number) => {
    if (commentsLoading) return;
    setCommentsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/posts/${postId}/comments?page=${page}&size=10`, { credentials: "include" });
      if (!res.ok) throw new Error("댓글을 불러오는데 실패했습니다.");
      const data: components["schemas"]["CustomResponseBodySliceCommentResponse"] = await res.json();
      if (page === 0) {
        setComments(data.data?.content || []);
      } else {
        setComments(prev => {
          const newComments = data.data?.content || [];
          const existingIds = new Set(prev.map(c => c.id));
          const uniqueNewComments = newComments.filter(c => !existingIds.has(c.id));
          return [...prev, ...uniqueNewComments];
        });
      }
      setHasMoreComments(!(data.data?.last ?? true));
    } catch (err) {
      console.error(err);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleLoadMoreComments = () => {
    const nextPage = commentPage + 1;
    setCommentPage(nextPage);
    fetchComments(nextPage);
  };

  const handleEditClick = () => {
    setEditTitle(post?.title || "");
    setEditContent(post?.content || "");
    setShowEditModal(true);
    setEditError(null);
  };

  const handleEditSubmit = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      setEditError("제목과 내용을 모두 입력하세요.");
      return;
    }
    setEditLoading(true);
    setEditError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: editTitle, content: editContent, "images-length": post?.images?.length ?? 0 })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "수정 실패");
      }
      setShowEditModal(false);
      fetchPostAndComments();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setEditError(err.message || "알 수 없는 오류가 발생했습니다.");
      } else {
        setEditError("알 수 없는 오류가 발생했습니다.");
      }
    } finally {
      setEditLoading(false);
    }
  };

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const handleDelete = async () => {
    if (!window.confirm("정말로 이 게시물을 삭제하시겠습니까?")) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/posts/${postId}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "삭제 실패");
      }
      location.reload();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setDeleteError(err.message || "알 수 없는 오류가 발생했습니다.");
      } else {
        setDeleteError("알 수 없는 오류가 발생했습니다.");
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: newComment })
      });
      if (!res.ok) throw new Error("댓글 작성 실패");
      setNewComment("");
      setCommentPage(0);
      fetchComments(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentDelete = async (commentId: number) => {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/posts/comments/${commentId}`, { method: "DELETE", credentials: "include" });
      setCommentPage(0);
      fetchComments(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentUpdate = async (commentId: number, content: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/posts/comments/${commentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content })
      });
      setEditingComment(null);
      setCommentPage(0);
      fetchComments(0);
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    if (diffInMinutes < 1) return "방금 전";
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}일 전`;
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const fetchPostAndComments = async () => {
    if (!postId) {
      setError("게시물 ID가 없습니다.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const postRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/posts/${postId}`, { credentials: "include" });
      if (!postRes.ok) {
        const errorData = await postRes.json();
        throw new Error(errorData.message || "게시물 정보를 불러오는데 실패했습니다.");
      }
      const postData: components["schemas"]["CustomResponseBodyPostResponse"] = await postRes.json();
      setPost(postData.data || null);
      await fetchComments(0);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "알 수 없는 오류가 발생했습니다.");
      } else {
        setError("알 수 없는 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostAndComments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>게시물 로딩 중...</div>;
  if (error) return <div style={{ padding: 40, textAlign: "center", color: "red" }}>오류: {error}</div>;
  if (!post) return <div style={{ padding: 40, textAlign: "center" }}>게시물을 찾을 수 없습니다.</div>;

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", padding: 32 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16, color: "#222" }}>{post.title}</h1>
      <p style={{ fontSize: 16, lineHeight: 1.6, color: "#444", marginBottom: 24 }}>{post.content}</p>
      
      <div style={{ fontSize: 14, color: "#888", marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <MemberInfo member={post.author} size="medium" />
        <div>{formatDate(post.create_at)}</div>
      </div>

      {isMyPost && (
        <div style={{display:'flex', gap:8, marginBottom:24}}>
          <button onClick={handleEditClick} style={{padding: '8px 16px', borderRadius: 6, border: '1px solid #aaa', background: '#f7f7f7', cursor: 'pointer', fontWeight: 500, color: '#222'}}>게시물 수정</button>
          <button onClick={handleDelete} disabled={deleteLoading} style={{padding: '8px 16px', borderRadius: 6, border: '1px solid #e00', background: '#fff0f0', color: '#e00', cursor: 'pointer', fontWeight: 500}}>{deleteLoading ? '삭제 중...' : '게시물 삭제'}</button>
        </div>
      )}
      {deleteError && <div style={{color:'red', marginBottom:12}}>{deleteError}</div>}

      {post.images && post.images.length > 0 && (
        <div style={{ marginBottom: 24, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <button onClick={() => setCurrentImage((prev) => (prev === 0 ? (post.images?.length ?? 1) - 1 : prev - 1))} style={{ position: "absolute", left: 0, zIndex: 2, background: "rgba(255,255,255,0.7)", border: "none", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", fontSize: 20 }} aria-label="이전 이미지" disabled={post.images?.length === 1}>◀</button>
          <div style={{ width: 600, height: 400, borderRadius: 8, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            {post.images?.[currentImage]?.url ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.images[currentImage]!.url!} alt={post.title || `게시물 이미지 ${currentImage + 1}`} width={600} height={400} style={{ objectFit: "cover", width: "100%", height: "100%" }} crossOrigin="use-credentials"/>
              </>
            ) : (
              <div style={{width:600, height:400, display:'flex', alignItems:'center', justifyContent:'center', background:'#eee', color:'#888'}}>이미지 없음</div>
            )}
          </div>
          <button onClick={() => setCurrentImage((prev) => (prev === (post.images?.length ?? 1) - 1 ? 0 : prev + 1))} style={{ position: "absolute", right: 0, zIndex: 2, background: "rgba(255,255,255,0.7)", border: "none", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", fontSize: 20 }} aria-label="다음 이미지" disabled={post.images?.length === 1}>▶</button>
          <div style={{ position: "absolute", bottom: 8, left: 0, right: 0, textAlign: "center", fontSize: 14, color: "#666" }}>{currentImage + 1} / {post.images?.length}</div>
        </div>
      )}

      {showEditModal && (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.3)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#fff',padding:32,borderRadius:12,minWidth:320,boxShadow:'0 2px 8px rgba(0,0,0,0.15)',position:'relative', color:'#222'}}>
            <h2 style={{marginBottom:16, color:'#222'}}>게시물 수정</h2>
            <div style={{marginBottom:12}}>
              <input type="text" value={editTitle} onChange={e=>setEditTitle(e.target.value)} placeholder="제목" style={{width:'100%',padding:8,borderRadius:4,border:'1px solid #ccc',marginBottom:8, color:'#222'}} />
              <textarea value={editContent} onChange={e=>setEditContent(e.target.value)} placeholder="내용" rows={5} style={{width:'100%',padding:8,borderRadius:4,border:'1px solid #ccc', color:'#222'}} />
            </div>
            {editError && <div style={{color:'red',marginBottom:8}}>{editError}</div>}
            <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
              <button onClick={()=>setShowEditModal(false)} disabled={editLoading} style={{padding:'8px 16px',borderRadius:4,border:'1px solid #aaa',background:'#eee',cursor:'pointer', color:'#222'}}>취소</button>
              <button onClick={handleEditSubmit} disabled={editLoading} style={{padding:'8px 16px',borderRadius:4,border:'1px solid #0070f3',background:'#0070f3',color:'#fff',cursor:'pointer',fontWeight:500}}>{editLoading ? '수정 중...' : '수정하기'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Comment Section */}
      <div style={{ marginTop: 40, borderTop: '1px solid #eee', paddingTop: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, color: '#333' }}>댓글</h2>
        <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글을 입력하세요..."
            style={{ flex: 1, padding: '10px 12px', borderRadius: 6, border: '1px solid #ccc', fontSize: 14, color: '#222' }}
          />
          <button type="submit" style={{ padding: '10px 16px', borderRadius: 6, border: 'none', background: '#0070f3', color: '#fff', fontWeight: 500, cursor: 'pointer' }}>등록</button>
        </form>

        <div>
          {comments.map(comment => (
            <div key={comment.id} style={{ marginBottom: 16, padding: 12, background: '#f9f9f9', borderRadius: 8 }}>
              {editingComment?.id === comment.id ? (
                <div>
                  <textarea 
                    defaultValue={comment.content}
                    onChange={(e) => setEditingComment({...editingComment, content: e.target.value})}
                    rows={3}
                    style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', marginBottom: 8 }}
                  />
                  <div style={{ textAlign: 'right' }}>
                    <button onClick={() => editingComment && editingComment.content && handleCommentUpdate(comment.id!, editingComment.content)} style={{ marginRight: 8 }}>저장</button>
                    <button onClick={() => setEditingComment(null)}>취소</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, gap: 8 }}>
                    <MemberInfo member={comment.member} />
                    <div style={{ fontSize: 12, color: '#888' }}>{formatDate(comment.createdAt)}</div>
                  </div>
                  <p style={{ color: '#555' }}>{comment.content}</p>
                  {memberId === comment.member?.member_id && (
                    <div style={{ textAlign: 'right', marginTop: 8 }}>
                      <button onClick={() => setEditingComment(comment)} style={{ fontSize: 12, color: '#555', background: 'none', border: 'none', cursor: 'pointer', marginRight: 8 }}>수정</button>
                      <button onClick={() => handleCommentDelete(comment.id!)} style={{ fontSize: 12, color: '#e00', background: 'none', border: 'none', cursor: 'pointer' }}>삭제</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {hasMoreComments && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button onClick={handleLoadMoreComments} disabled={commentsLoading} style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #ccc', background: '#f0f0f0', cursor: 'pointer', color: '#333' }}>
                {commentsLoading ? '불러오는 중...' : '더보기'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}