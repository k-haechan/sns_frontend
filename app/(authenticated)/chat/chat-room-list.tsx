'use client';

import React, { useEffect, useState } from 'react';

interface ChatRoom {
  id: number;
  // Add other chat room properties as needed, e.g., lastMessage, participantNames
}

export default function ChatRoomList({
  onSelectChatRoom,
}: { onSelectChatRoom: (chatRoomId: number) => void }) {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        // In a real application, you would get the token from localStorage, sessionStorage, or a global state.
        // For now, assuming the token is available or handled by a higher-order component/context.
        // 쿠키 인증만 사용하므로 별도 헤더 불필요

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/chat-room/list`, {
          credentials: "include"
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // chat_room_id를 id로 매핑
        const chatRooms = (data.data || []).map((room: any) => ({
          id: room.chat_room_id,
          // ...필요시 다른 필드도 매핑
        }));
        setChatRooms(chatRooms);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChatRooms();
  }, []);

  if (loading) {
    return <div className="p-4">Loading chat rooms...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="w-1/4 bg-white border-r p-4 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Chat Rooms</h2>
      {
        chatRooms.length === 0 ? (
          <p>No chat rooms found.</p>
        ) : (
          <ul>
            {chatRooms.map((room) => (
              <li
                key={room.id}
                className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                onClick={() => onSelectChatRoom(room.id)}
              >
                Chat Room {room.id} {/* Display more meaningful info here */}
              </li>
            ))}
          </ul>
        )
      }
    </div>
  );
}
