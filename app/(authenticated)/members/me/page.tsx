'use client';

import { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { useAuthStore } from '../../../store/useAuthStore';
import { MyPageRequest } from './schema/myPageRequest';
import { components } from "@/schema";
import MemberProfile from '../MemberProfile';
import MemberPostGrid from '../MemberPostGrid';

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
    const memberApiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/members/${memberId}`;
    fetch(memberApiUrl, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then((data: components["schemas"]["CustomResponseBodyMemberDetailResponse"]) => setMember(data.data || null))
      .finally(() => setLoading(false));

    setPostsLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/members/${memberId}/posts?page=0&size=5`, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then((data: components["schemas"]["CustomResponseBodySlicePostResponse"]) => setPosts(data.data?.content ? data.data.content : []))
      .finally(() => setPostsLoading(false));
  }, [memberId, setLoading, setMember, setPosts, setPostsLoading]);

  if (!memberId) return <div style={{ padding: 40, textAlign: 'center' }}>로그인이 필요합니다.</div>;
  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>로딩 중...</div>;
  if (!member) return <div style={{ padding: 40, textAlign: 'center' }}>내 정보를 불러올 수 없습니다.</div>;

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: 32 }}>
      <MemberProfile
        member={{
          member_id: member.member_id ?? 0,
          profile_image_url: member.profile_image_url ?? null,
          username: member.username ?? '',
          real_name: member.real_name ?? null,
          introduction: member.introduction ?? null,
          follower_count: member.follower_count ?? 0,
          following_count: member.following_count ?? 0,
        }}
      />
      <div style={{ marginTop: 36 }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: '#222', marginBottom: 12 }}>내 게시물</div>
        {postsLoading ? (
          <div style={{ color: '#888', textAlign: 'center', padding: 16 }}>게시물 불러오는 중...</div>
        ) : (
          <MemberPostGrid
            posts={posts.map(post => ({
              post_id: post.post_id ?? 0,
              title: post.title ?? '',
              images: post.images ?? [],
            }))}
            onPostClick={post => router.push(`/posts/${post.post_id}`)}
          />
        )}
      </div>
    </div>
  );
}
 