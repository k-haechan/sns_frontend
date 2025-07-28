'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../../../store/useAuthStore';
import { components } from "@/schema";
import MemberProfile from '../MemberProfile';
import MemberPostGrid from '../MemberPostGrid';

type MemberDetailResponse = components["schemas"]["MemberDetailResponse"];
type ChatRoomRequest = components["schemas"]["ChatRoomRequest"];

export default function MemberDetailPage() {
  const { memberId } = useParams();
  const { memberId: myId } = useAuthStore();
  const [member, setMember] = useState<MemberDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [posts, setPosts] = useState<components["schemas"]["PostResponse"][]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!memberId) return;
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/members/${memberId}`, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then((data: components["schemas"]["CustomResponseBodyMemberDetailResponse"]) => setMember(data.data || null))
      .finally(() => setLoading(false));
    // 게시글 목록도 불러오기
    setPostsLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/members/${memberId}/posts?page=0&size=100`, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then((data: components["schemas"]["CustomResponseBodySlicePostResponse"]) => setPosts(data.data?.content ? data.data.content : []))
      .finally(() => setPostsLoading(false));
  }, [memberId]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>로딩 중...</div>;
  if (!member) return <div style={{ padding: 40, textAlign: 'center' }}>회원 정보를 불러올 수 없습니다.</div>;

  const isMyPage = myId && String(myId) === String(memberId);

  const handleChat = async () => {
    setChatLoading(true);
    try {
      const req: ChatRoomRequest = { recipient_id: Number(memberId) };
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/chat-rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(req),
      });
      const data: components["schemas"]["CustomResponseBodyChatRoomResponse"] = await res.json();
      if (res.ok && data.data && data.data.chat_room_id) {
        const membersParam = encodeURIComponent(JSON.stringify(data.data.members || []));
        router.push(`/chat/chatRoom/${data.data.chat_room_id}?members=${membersParam}`);
      } else {
        alert(data.message || '채팅방 생성에 실패했습니다.');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(`채팅방 생성 중 오류 발생: ${error.message}`);
      } else {
        alert('알 수 없는 오류 발생');
      }
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: 32 }}>
      <MemberProfile
        member={{
          profile_image_url: member.profile_image_url ?? null,
          username: member.username ?? '',
          real_name: member.real_name ?? null,
          introduction: member.introduction ?? null,
          follower_count: member.follower_count ?? 0,
          following_count: member.following_count ?? 0,
        }}
      >
        {!isMyPage && (
          <div style={{ marginTop: 32, textAlign: 'center' }}>
            <button
              onClick={handleChat}
              style={{ padding: '12px 32px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 18, cursor: chatLoading ? 'not-allowed' : 'pointer', opacity: chatLoading ? 0.6 : 1 }}
              disabled={chatLoading}
            >
              {chatLoading ? '채팅방 연결 중...' : '채팅 보내기'}
            </button>
          </div>
        )}
      </MemberProfile>
      {/* 회원 게시물 썸네일 리스트 */}
      <div style={{ marginTop: 36 }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: '#222', marginBottom: 12 }}>게시물</div>
        {postsLoading ? (
          <div style={{ color: '#888', textAlign: 'center', padding: 16 }}>게시물 불러오는 중...</div>
        ) : (
          <MemberPostGrid
            posts={posts.map(post => ({
              post_id: post.post_id ?? 0,
              title: post.title ?? '',
              images: post.images ?? [],
            }))}
            onPostClick={post => router.push(`/post/${post.post_id}`)}
          />
        )}
      </div>
    </div>
  );
} 