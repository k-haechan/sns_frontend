"use client";
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useAuthStore } from '../../../../store/useAuthStore';
import { components } from "@/schema";

type ChatMessage = components["schemas"]["ChatResponse"];
type MemberBriefResponse = components["schemas"]["MemberBriefResponse"];

function formatTime(dateString?: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export default function ChatRoomPage() {
  const { chatRoomId } = useParams();
  const searchParams = useSearchParams();
  const { memberId, realName, username, _hasHydrated } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const chatListRef = useRef<HTMLDivElement>(null);
  const [showNewMessageAlert, setShowNewMessageAlert] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const isAtBottomRef = useRef(true);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // members 정보 파싱
  const membersRaw = searchParams.get('members');
  const members: MemberBriefResponse[] = membersRaw ? JSON.parse(decodeURIComponent(membersRaw)) : [];
  // 상대방 정보 추출
  const opponent = members.find((m: MemberBriefResponse) => String(m.member_id) !== String(memberId));

  // 채팅방 ID가 바뀔 때마다 채팅 목록 불러오기
  useEffect(() => {
    if (!chatRoomId) return;
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/chat-rooms/${chatRoomId}/messages`, {
      method: 'GET',
      credentials: 'include',
    })
      .then(res => res.json())
      .then((data: components["schemas"]["CustomResponseBodySliceChatResponse"]) => {
        setMessages(Array.isArray(data.data?.content) ? data.data.content : []);
      })
      .finally(() => setLoading(false));
  }, [chatRoomId]);

  // WebSocket 연결 및 구독 (chatRoomId 기반)
  useEffect(() => {
    if (!memberId || !chatRoomId) return;
    const socket = new SockJS(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ws`);
    const client = new Client({ webSocketFactory: () => socket });

    client.onConnect = () => {
      setStompClient(client);
      // 채팅방 구독 경로 (백엔드에서 convertAndSend("/topic/chat-room/{chatRoomId}") 사용 중)
      client.subscribe(`/topic/chat-room/${chatRoomId}`, (message) => {
        const receivedMessage: ChatMessage = JSON.parse(message.body);
        setMessages((prevMessages) => {
          if (prevMessages.some(msg => msg.chat_id === receivedMessage.chat_id)) {
            return prevMessages;
          }
          return [...prevMessages, receivedMessage];
        });
        // 웹소켓으로 새 메시지 도착 시에만 알림 표시 (최신값 보장)
        if (!isAtBottomRef.current) setShowNewMessageAlert(true);
      });
    };

    client.onStompError = (frame) => {
      console.error('Broker reported error:' + frame.headers['message']);
      console.error('Additional details:' + frame.body);
    };

    client.activate();

    return () => {
      if (client && client.connected) {
        client.deactivate();
      }
    };
  }, [memberId, chatRoomId]);

  // 메시지 전송
  const sendMessage = () => {
    if (
      !stompClient ||
      !messageInput.trim() ||
      !chatRoomId ||
      !memberId ||
      !username ||
      !realName ||
      !_hasHydrated
    ) {
      alert('로그인 정보가 완전히 준비된 후에 메시지를 보낼 수 있습니다.');
      return;
    }
    const chatMessage = {
      chat_room_id: Number(chatRoomId),
      sender_id: memberId,
      sender_real_name: realName,
      sender_username: username,
      content: messageInput,
    };
    stompClient.publish({ destination: '/app/chat.send', body: JSON.stringify(chatMessage) });
    setMessageInput('');
  };

  // onKeyUp 핸들러 제거, onKeyDown 복원
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (e.nativeEvent.isComposing) {
        // 한글 조합 중에는 전송하지 않음
        return;
      }
      sendMessage();
    }
  };

  // 이전 채팅 불러오기 (무한 스크롤)
  const loadMoreMessages = async () => {
    if (!chatRoomId || loadingMore || !hasMore || messages.length === 0) return;
    setLoadingMore(true);
    const lastChat = messages[messages.length - 1];
    const lastChatId = lastChat.chat_id;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/chat-rooms/${chatRoomId}/messages?last_chat_id=${encodeURIComponent(lastChatId!)}`, {
        method: 'GET',
        credentials: 'include',
      });
      const data: components["schemas"]["CustomResponseBodySliceChatResponse"] = await res.json();
      const newMessages = Array.isArray(data.data?.content) ? data.data.content : [];
      setMessages(prev => [...prev, ...newMessages]);
      if (data.data?.last || newMessages.length === 0) setHasMore(false);
      // 스크롤 위치 보정
      setTimeout(() => {
        const el = chatListRef.current;
        if (el) {
          el.scrollTop = el.scrollHeight / (newMessages.length + 1);
        }
      }, 0);
    } finally {
      setLoadingMore(false);
    }
  };

  // 스크롤 위치 추적 (최상단 감지)
  const handleScroll = () => {
    const el = chatListRef.current;
    if (!el) return;
    const isBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 10;
    setIsAtBottom(isBottom);
    isAtBottomRef.current = isBottom;
    if (isBottom) setShowNewMessageAlert(false);
    // 최상단 도달 시 이전 메시지 불러오기
    if (el.scrollTop < 10 && hasMore && !loadingMore) {
      loadMoreMessages();
    }
  };

  // 메시지 추가 시 스크롤 처리
  useEffect(() => {
    const el = chatListRef.current;
    if (!el) return;
    if (isAtBottom) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, isAtBottom]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4 text-center text-xl font-bold">
        {opponent
          ? `${opponent.real_name}(${opponent.username})`
          : chatRoomId ? `Chat Room ${chatRoomId}` : '채팅방 선택'}
      </header>
      <div
        ref={chatListRef}
        className="flex-1 overflow-y-auto p-4 space-y-2"
        onScroll={handleScroll}
      >
        {loading ? (
          <div className="text-gray-500">채팅 목록 불러오는 중...</div>
        ) : chatRoomId ? (
          <>
            {loadingMore && (
              <div className="text-center text-gray-400 text-xs mb-2">이전 메시지 불러오는 중...</div>
            )}
            {[...messages].sort((a, b) => {
              const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
              const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
              return aTime - bTime;
            }).map((msg) => {
              const isMine = String(msg.sender_id) === String(memberId);
              return (
                <div key={msg.chat_id} className={`mb-2 flex ${isMine ? 'flex-row' : 'flex-row-reverse'} items-end`}>
                  <div className={`inline-block ${isMine ? 'bg-blue-200' : 'bg-white'} rounded-lg px-3 py-2 shadow-md max-w-[70%]`}>
                    <span className="ml-1" style={{ color: '#222' }}>{msg.content}</span>
                  </div>
                  <span className={`text-xs text-gray-400 mx-2 mb-1 whitespace-nowrap ${isMine ? 'order-2' : 'order-1'}`}>{formatTime(msg.created_at)}</span>
                </div>
              );
            })}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>채팅방을 선택해주세요.</p>
          </div>
        )}
        {/* 새 메시지 알림 버튼 (fixed) */}
        {showNewMessageAlert && (
          <div className="fixed left-1/2 bottom-8 z-50 transform -translate-x-1/2">
            <button
              className="bg-yellow-400 text-black px-4 py-2 rounded shadow-lg border border-yellow-500 animate-bounce"
              onClick={() => {
                const el = chatListRef.current;
                if (el) {
                  el.scrollTop = el.scrollHeight;
                }
                setShowNewMessageAlert(false);
              }}
            >
              새 메시지 도착! 아래로 이동
            </button>
          </div>
        )}
      </div>
      <footer className="p-4 bg-white border-t flex items-center">
        <input
          type="text"
          className="flex-1 border rounded-lg p-2 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="메시지를 입력하세요..."
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!chatRoomId || !_hasHydrated}
          style={{ color: '#222' }}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={sendMessage}
          disabled={!chatRoomId || !_hasHydrated}
        >
          전송
        </button>
      </footer>
    </div>
  );
}