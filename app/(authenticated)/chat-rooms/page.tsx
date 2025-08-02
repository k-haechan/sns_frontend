"use client";
import Image from "next/image";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from '../../store/useAuthStore';

interface Member {
  member_id: number;
  username: string;
  real_name: string;
  profile_image_url: string | null;
}

interface ChatRoom {
  chat_room_id: number;
  last_chat?: string;
  members: Member[];
}

export default function ChatRoomListPage() {
  const { memberId } = useAuthStore();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // 채팅방 목록 불러오기
  const fetchChatRooms = async (pageNum: number) => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/chat-rooms?page=${pageNum}&size=20`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      const newRooms = Array.isArray(data.data.content) ? data.data.content : [];
      setChatRooms(prev => {
        const existingIds = new Set(prev.map((room: ChatRoom) => room.chat_room_id));
        const filtered = newRooms.filter((room: ChatRoom) => !existingIds.has(room.chat_room_id));
        return [...prev, ...filtered];
      });
      setHasMore(!data.data.last && newRooms.length > 0);
      setPage(pageNum + 1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setChatRooms([]);
    setPage(0);
    setHasMore(true);
    // fetchChatRooms(0) 호출 제거
  }, []);

  useEffect(() => {
    if (page === 0 && chatRooms.length === 0 && hasMore && !loading) {
      fetchChatRooms(0);
    }
    // eslint-disable-next-line
  }, [page]);

  // 무한 스크롤 처리
  const handleScroll = () => {
    const el = listRef.current;
    if (!el || loading || !hasMore) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 50) {
      fetchChatRooms(page);
    }
  };

  // 상대방 정보 추출
  const getOpponent = (members: Member[]) => {
    return members.find(m => String(m.member_id) !== String(memberId));
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4 text-center text-xl font-bold">
        내 채팅방 목록
      </header>
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto p-4"
        onScroll={handleScroll}
      >
        {chatRooms.length === 0 && !loading && (
          <div className="text-center text-gray-400 mt-10">채팅방이 없습니다.</div>
        )}
        {chatRooms.map((room) => {
          const opponent = getOpponent(room.members);
          return (
            <div
              key={room.chat_room_id}
              className="flex items-center gap-4 p-4 mb-2 bg-white rounded-lg shadow cursor-pointer hover:bg-blue-50"
              onClick={() => {
                const membersParam = encodeURIComponent(JSON.stringify(room.members));
                router.push(`/chat-rooms/${room.chat_room_id}?members=${membersParam}`);
              }}
            >
              <Image
                src={opponent?.profile_image_url || "/window.svg"}
                alt="프로필"
                width={48}
                height={48}
                className="rounded-full object-cover border border-gray-200 bg-gray-100"
              />
              <div className="flex flex-col flex-1 min-w-0">
                <div className="font-bold text-lg text-gray-800 truncate">{opponent?.username} <span className="text-gray-500 text-sm">({opponent?.real_name})</span></div>
                {room.last_chat && (
                  <div className="text-gray-500 text-sm truncate mt-1">{room.last_chat}</div>
                )}
              </div>
            </div>
          );
        })}
        {loading && <div className="text-center text-gray-400 my-4">불러오는 중...</div>}
        {!hasMore && chatRooms.length > 0 && (
          <div className="text-center text-gray-400 my-4">모든 채팅방을 불러왔습니다.</div>
        )}
      </div>
    </div>
  );
}