"use client";

import React, { useEffect, useState } from "react";
import { components } from "@/schema";

type ChatRoom = components["schemas"]["ChatRoomResponse"];

export default function ChatRoomList({
  onSelectChatRoom,
}: {
  onSelectChatRoom: (chatRoomId: number) => void;
}) {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/chat-rooms?page=0&size=20`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: components["schemas"]["CustomResponseBodySliceChatRoomResponse"] =
          await response.json();
        setChatRooms(data.data?.content || []);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
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
      {chatRooms.length === 0 ? (
        <p>No chat rooms found.</p>
      ) : (
        <ul>
          {chatRooms.map((room) => (
            <li
              key={room.chat_room_id}
              className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
              onClick={() => onSelectChatRoom(room.chat_room_id!)}
            >
              Chat Room {room.chat_room_id}{" "}
              {/* Display more meaningful info here */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}