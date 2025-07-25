'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../../../store/useAuthStore';
import { components } from "@/schema";
import Image from "next/image";

type MemberDetailResponse = components["schemas"]["MemberDetailResponse"];
type ChatRoomRequest = components["schemas"]["ChatRoomRequest"];

export default function MemberDetailPage() {
  const { memberId } = useParams();
  const { memberId: myId } = useAuthStore();
  const [member, setMember] = useState<MemberDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
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
    </div>
  );
} 