"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { components } from "@/schema";

type PostResponse = components["schemas"]["PostResponse"];

export default function PostDetailPage() {
  const { postId } = useParams();
  const [post, setPost] = useState<PostResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        <div style={{ marginBottom: 24 }}>
          {post.images.map((image, index) => (
            <div key={index} style={{ marginBottom: 16, borderRadius: 8, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
              <img
                src={image.url!}
                alt={post.title || `게시물 이미지 ${index + 1}`}
                width={600}
                height={400}
                style={{ objectFit: "cover", width: "100%", height: "auto" }}
                crossOrigin="use-credentials"
              />
            </div>
          ))}
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