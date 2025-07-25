'use client';

import { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { useAuthStore } from '../../../store/useAuthStore';
import { MyPageRequest } from './schema/myPageRequest';
import { components } from "@/schema";
import Image from "next/image";

type PostResponse = components["schemas"]["PostResponse"];

export default function MyPage() {
  const router = useRouter();
  const memberId = useAuthStore(state => state.memberId);
  const [member, setMember] = useState<MyPageRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  useEffect(() => {
    if (!memberId) return;
    setLoading(true);
    // 내 정보 요청 시
    const memberApiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/members/${memberId}`;
    console.log("Fetching member data from:", memberApiUrl); // <-- Add this line
    fetch(memberApiUrl, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then((data: components["schemas"]["CustomResponseBodyMemberDetailResponse"]) => setMember(data.data || null))
      .finally(() => setLoading(false));
    // 내 게시물 목록 요청
    setPostsLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/members/${memberId}/posts?page=0&size=5`, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then((data: components["schemas"]["CustomResponseBodySlicePostResponse"]) => setPosts(data.data?.content ? data.data.content : []))
      .finally(() => setPostsLoading(false));
  }, [memberId]);

  if (!memberId) return <div style={{ padding: 40, textAlign: 'center' }}>로그인이 필요합니다.</div>;
  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>로딩 중...</div>;
  if (!member) return <div style={{ padding: 40, textAlign: 'center' }}>내 정보를 불러올 수 없습니다.</div>;

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24 }}>
        <Image
          src={member.profile_image_url || '/window.svg'}
          alt="프로필"
          width={80}
          height={80}
          style={{ borderRadius: '50%', objectFit: 'cover', background: '#f3f3f3', border: '1px solid #eee' }}
        />
        <div>
          <div style={{ fontWeight: 700, fontSize: 24, color: '#222' }}>
            {member.username}
            {member.real_name && <span style={{ color: '#888', fontWeight: 400, fontSize: 18 }}> ({member.real_name})</span>}
          </div>
          <div style={{ color: '#888', marginTop: 4 }}>{member.introduction || '자기소개가 없습니다.'}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 32, justifyContent: 'center', marginTop: 16 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 600, fontSize: 18, color: '#222' }}>{member.follower_count}</div>
          <div style={{ color: '#888', fontSize: 14 }}>팔로워</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 600, fontSize: 18, color: '#222' }}>{member.following_count}</div>
          <div style={{ color: '#888', fontSize: 14 }}>팔로잉</div>
        </div>
      </div>
      {/* 내 게시물 썸네일 리스트 */}
      <div style={{ marginTop: 36 }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: '#222', marginBottom: 12 }}>내 게시물</div>
        {postsLoading ? (
          <div style={{ color: '#888', textAlign: 'center', padding: 16 }}>게시물 불러오는 중...</div>
        ) : posts.length === 0 ? (
          <div style={{ color: '#888', textAlign: 'center', padding: 16 }}>게시물이 없습니다.</div>
        ) : (
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
            {posts.map((post) => (
              <div
                key={post.post_id}
                style={{ minWidth: 80, maxWidth: 100, textAlign: 'center', cursor: 'pointer' }}
                onClick={() => router.push(`/post/${post.post_id}`)}
              >
                <div style={{ width: 80, height: 80, borderRadius: 8, overflow: 'hidden', background: '#f3f3f3', margin: '0 auto 6px auto', border: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {post.images && post.images.length > 0 ? (
                    <Image
                      src={post.images[0].url!.startsWith('http') ? post.images[0].url! : `${process.env.NEXT_PUBLIC_STORAGE_BASE_URL}/${post.images[0].url}`}
                      alt={post.title || '게시물 이미지'}
                      width={80}
                      height={80}
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{ color: '#bbb', fontSize: 32 }}>🖼️</span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: '#222', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{post.title}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 