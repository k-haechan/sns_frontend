"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import React from "react";
import { components } from "@/schema";

type PostResponse = components["schemas"]["PostResponse"];

export default function PostDetailPage() {
  const { postId } = useParams();
  const [post, setPost] = useState<PostResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);

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
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
          "images-length": post?.images?.length ?? 0
        })
      });
      if (!res.ok) {
        const data = await res.json();
        setEditError(data.message || "수정 실패");
        setEditLoading(false);
        return;
      }
      // 성공 시 새로고침 또는 post 정보 갱신
      setShowEditModal(false);
      location.reload();
    } catch (e) {
      setEditError("알 수 없는 오류가 발생했습니다.");
    } finally {
      setEditLoading(false);
    }
  };

  useEffect(() => {
    if (!postId) {
      setLoading(false);
      setError("게시물 ID가 없습니다.");
      return;
    }

    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/posts/${postId}`,
          {
            credentials: "include",
          }
        );

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "게시물 정보를 불러오는데 실패했습니다.");
        }

        const data: components["schemas"]["CustomResponseBodyPostResponse"] = await res.json();
        setPost(data.data || null);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("알 수 없는 오류가 발생했습니다.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  if (loading) {
    return <div style={{ padding: 40, textAlign: "center" }}>게시물 로딩 중...</div>;
  }

  if (error) {
    return <div style={{ padding: 40, textAlign: "center", color: "red" }}>오류: {error}</div>;
  }

  if (!post) {
    return <div style={{ padding: 40, textAlign: "center" }}>게시물을 찾을 수 없습니다.</div>;
  }

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", padding: 32 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16, color: "#222" }}>{post.title}</h1>
      <p style={{ fontSize: 16, lineHeight: 1.6, color: "#444", marginBottom: 24 }}>{post.content}</p>
      <button onClick={handleEditClick} style={{marginBottom: 24, padding: '8px 16px', borderRadius: 6, border: '1px solid #aaa', background: '#f7f7f7', cursor: 'pointer', fontWeight: 500}}>게시물 수정</button>

      {post.images && post.images.length > 0 && (
        <div style={{ marginBottom: 24, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <button
            onClick={() => setCurrentImage((prev) => (prev === 0 ? (post.images?.length ?? 1) - 1 : prev - 1))}
            style={{ position: "absolute", left: 0, zIndex: 2, background: "rgba(255,255,255,0.7)", border: "none", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", fontSize: 20 }}
            aria-label="이전 이미지"
            disabled={post.images?.length === 1}
          >
            ◀
          </button>
          <div style={{ width: 600, height: 400, borderRadius: 8, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {post.images?.[currentImage]?.url ? (
              <img
                src={post.images[currentImage]!.url!}
                alt={post.title || `게시물 이미지 ${currentImage + 1}`}
                width={600}
                height={400}
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
                crossOrigin="use-credentials"
              />
            ) : (
              <div style={{width:600, height:400, display:'flex', alignItems:'center', justifyContent:'center', background:'#eee', color:'#888'}}>
                이미지 없음
              </div>
            )}
          </div>
          <button
            onClick={() => setCurrentImage((prev) => (prev === (post.images?.length ?? 1) - 1 ? 0 : prev + 1))}
            style={{ position: "absolute", right: 0, zIndex: 2, background: "rgba(255,255,255,0.7)", border: "none", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", fontSize: 20 }}
            aria-label="다음 이미지"
            disabled={post.images?.length === 1}
          >
            ▶
          </button>
          <div style={{ position: "absolute", bottom: 8, left: 0, right: 0, textAlign: "center", fontSize: 14, color: "#666" }}>
            {currentImage + 1} / {post.images?.length}
          </div>
        </div>
      )}

      {/* 추가 정보 (예: 작성자, 작성일 등) */}
      {/* <div style={{ fontSize: 14, color: "#888", borderTop: "1px solid #eee", paddingTop: 16 }}>
        <p>작성자: {post.author?.username}</p>
        <p>작성일: {new Date(post.createdAt).toLocaleDateString()}</p>
      </div> */}
      {showEditModal && (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.3)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#fff',padding:32,borderRadius:12,minWidth:320,boxShadow:'0 2px 8px rgba(0,0,0,0.15)',position:'relative'}}>
            <h2 style={{marginBottom:16}}>게시물 수정</h2>
            <div style={{marginBottom:12}}>
              <input type="text" value={editTitle} onChange={e=>setEditTitle(e.target.value)} placeholder="제목" style={{width:'100%',padding:8,borderRadius:4,border:'1px solid #ccc',marginBottom:8}} />
              <textarea value={editContent} onChange={e=>setEditContent(e.target.value)} placeholder="내용" rows={5} style={{width:'100%',padding:8,borderRadius:4,border:'1px solid #ccc'}} />
            </div>
            {editError && <div style={{color:'red',marginBottom:8}}>{editError}</div>}
            <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
              <button onClick={()=>setShowEditModal(false)} disabled={editLoading} style={{padding:'8px 16px',borderRadius:4,border:'1px solid #aaa',background:'#eee',cursor:'pointer'}}>취소</button>
              <button onClick={handleEditSubmit} disabled={editLoading} style={{padding:'8px 16px',borderRadius:4,border:'1px solid #0070f3',background:'#0070f3',color:'#fff',cursor:'pointer',fontWeight:500}}>
                {editLoading ? '수정 중...' : '수정하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}