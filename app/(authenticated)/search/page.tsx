'use client'

import React, { useState } from "react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MemberSearchRequest } from './schema/memberSearchRequest';
import Image from "next/image";
import { components } from "@/schema";

type MemberBriefResponse = components["schemas"]["MemberBriefResponse"];
type CustomResponseBodyMemberBriefResponse = components["schemas"]["CustomResponseBodyMemberBriefResponse"];

function MemberSearchList({ results }: { results: MemberBriefResponse[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const handleChat = async (member_id: number) => {
    setLoadingId(member_id);
    try {
      // 1. 채팅방 생성/조회
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/chat-rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ recipient_id: member_id }),
      });
      const data: components["schemas"]["CustomResponseBodyChatRoomResponse"] = await res.json();
      if (res.ok && data.data && data.data.chat_room_id) {
        const membersParam = encodeURIComponent(JSON.stringify(data.data.members || []));
        router.push(`/chat-rooms/${data.data.chat_room_id}?members=${membersParam}`);
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
      setLoadingId(null);
    }
  };

  return (
    <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
      {results.length === 0 ? (
        <li style={{ color: '#444', padding: '12px 0' }}>검색 결과가 없습니다.</li>
      ) : results.map((member) => (
        <li key={member.member_id} style={{ padding: "12px 0", borderBottom: "1px solid #eee", display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href={`/members/${member.member_id}`} style={{ display: 'flex', alignItems: 'center', gap: 16, textDecoration: 'none', color: 'inherit', flex: 1 }}>
            <Image
              src={member.profile_image_url || '/window.svg'}
              alt="프로필"
              width={40}
              height={40}
              className="rounded-full object-cover border border-gray-200 bg-gray-100"
            />
            <span style={{ fontWeight: 600, fontSize: 18 }}>{member.username}</span>
          </Link>
          <button
            onClick={() => handleChat(member.member_id!)}
            style={{ padding: '6px 16px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 15, cursor: loadingId === member.member_id ? 'not-allowed' : 'pointer', opacity: loadingId === member.member_id ? 0.6 : 1 }}
            disabled={loadingId === member.member_id}
          >
            {loadingId === member.member_id ? '연결 중...' : '채팅 보내기'}
          </button>
        </li>
      ))}
    </ul>
  );
}

function PostSearchList({ results }: { results: string[] }) {
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
      {results.map((title, idx) => (
        <li key={idx} style={{ padding: "12px 0", borderBottom: "1px solid #eee" }}>{title}</li>
      ))}
    </ul>
  );
}

export default function SearchPage() {
  const [tab, setTab] = useState<'member' | 'post'>('member');
  const [memberQuery, setMemberQuery] = useState("");
  const [memberResult, setMemberResult] = useState<MemberBriefResponse[]>([]);
  const [memberLoading, setMemberLoading] = useState(false);
  const [memberError, setMemberError] = useState("");
  const [postQuery, setPostQuery] = useState("");

  // 더미 데이터
  const dummyPosts = ["첫 번째 게시물", "두 번째 게시물", "세 번째 게시물"];

  const handleMemberSearch = async () => {
    if (!memberQuery) return;
    setMemberLoading(true);
    setMemberError("");
    setMemberResult([]);
    try {
      // 회원 검색 요청 시
      const req: MemberSearchRequest = { username: memberQuery };
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/members?username=${encodeURIComponent(req.username)}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('회원 정보를 찾을 수 없습니다.');
      const data: CustomResponseBodyMemberBriefResponse = await res.json();
      // data.data만 파싱해서 배열로 저장
      setMemberResult(data.data ? [data.data] : []);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMemberError(error.message || '검색 중 오류 발생');
      } else {
        setMemberError('알 수 없는 오류 발생');
      }
    } finally {
      setMemberLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", padding: 32 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <button
          onClick={() => setTab('member')}
          style={{ flex: 1, padding: 12, borderRadius: 8, border: tab === 'member' ? '2px solid #0070f3' : '1px solid #eee', background: tab === 'member' ? '#f0f8ff' : '#fafafa', fontWeight: tab === 'member' ? 700 : 400, color: tab === 'member' ? '#0070f3' : '#222', cursor: 'pointer' }}
        >
          회원 검색
        </button>
        <button
          onClick={() => setTab('post')}
          style={{ flex: 1, padding: 12, borderRadius: 8, border: tab === 'post' ? '2px solid #0070f3' : '1px solid #eee', background: tab === 'post' ? '#f0f8ff' : '#fafafa', fontWeight: tab === 'post' ? 700 : 400, color: tab === 'post' ? '#0070f3' : '#222', cursor: 'pointer' }}
        >
          게시물 검색
        </button>
      </div>
      {tab === 'member' ? (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <input
              type="text"
              placeholder="회원 이름을 입력하세요"
              value={memberQuery}
              onChange={e => setMemberQuery(e.target.value)}
              style={{ flex: 1, padding: 12, borderRadius: 6, border: '1px solid #ccc', color: '#222' }}
              onKeyDown={e => { if (e.key === 'Enter') handleMemberSearch(); }}
            />
            <button
              onClick={handleMemberSearch}
              style={{ padding: '0 18px', borderRadius: 6, background: '#0070f3', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}
              disabled={!memberQuery || memberLoading}
            >
              검색
            </button>
          </div>
          {memberLoading && <div style={{ color: '#0070f3', marginBottom: 10 }}>검색 중...</div>}
          {memberError && <div style={{ color: 'red', marginBottom: 10 }}>{memberError}</div>}
          <MemberSearchList results={memberResult} />
        </>
      ) : (
        <>
          <input
            type="text"
            placeholder="게시물 제목을 입력하세요"
            value={postQuery}
            onChange={e => setPostQuery(e.target.value)}
            style={{ width: '100%', padding: 12, borderRadius: 6, border: '1px solid #ccc', marginBottom: 20, color: '#222' }}
          />
          <PostSearchList results={dummyPosts.filter(title => title.includes(postQuery))} />
        </>
      )}
    </div>
  );
} 