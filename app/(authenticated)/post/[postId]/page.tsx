"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { components } from "@/schema";

type PostResponse = components["schemas"]["PostResponse"];

export default function PostDetailPage() {
  const { postId } = useParams();
  const [post, setPost] = useState<PostResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState(0);

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
    </div>
  );
}