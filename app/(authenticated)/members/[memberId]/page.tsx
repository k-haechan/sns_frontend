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
  const [followLoading, setFollowLoading] = useState(false);
  const [followError, setFollowError] = useState<string | null>(null);
  const [followSuccess, setFollowSuccess] = useState(false);
  const [followStatus, setFollowStatus] = useState<string | null>(null);
  const [checkingFollow, setCheckingFollow] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [showFollowerModal, setShowFollowerModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followers, setFollowers] = useState<components["schemas"]["MemberBriefResponse"][]>([]);
  const [following, setFollowing] = useState<components["schemas"]["MemberBriefResponse"][]>([]);
  const [followersLoading, setFollowersLoading] = useState(false);
  const [followingLoading, setFollowingLoading] = useState(false);

  const isMyPage = myId && String(myId) === String(memberId);

  const handleFollowerClick = async () => {
    setShowFollowerModal(true);
    setFollowersLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/follows/members/${memberId}/followers?page=0&size=10`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setFollowers(data.data?.content?.map((follow: components["schemas"]["FollowResponse"]) => follow.following) || []);
      }
    } catch (error) {
    } finally {
      setFollowersLoading(false);
    }
  };

  const handleFollowingClick = async () => {
    setShowFollowingModal(true);
    setFollowingLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/follows/members/${memberId}/followings?page=0&size=10`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        console.log('팔로잉 API 응답:', data);
        setFollowing(data.data?.content?.map((follow: components["schemas"]["FollowResponse"]) => follow.follower) || []);
      }
    } catch (error) {
      console.error('팔로잉 목록 조회 실패:', error);
    } finally {
      setFollowingLoading(false);
    }
  };

  useEffect(() => {
    if (!memberId) return;
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/members/${memberId}`, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then((data: components["schemas"]["CustomResponseBodyMemberDetailResponse"]) => {
        setMember(data.data || null);
        setFollowerCount(data.data?.follower_count ?? 0);
      })
      .finally(() => setLoading(false));

    setPostsLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/members/${memberId}/posts?page=0&size=100`, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then((data: components["schemas"]["CustomResponseBodySlicePostResponse"]) => setPosts(data.data?.content ? data.data.content : []))
      .finally(() => setPostsLoading(false));
  }, [memberId]);

  useEffect(() => {
    if (!memberId || isMyPage) return;
    setCheckingFollow(true);
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/follows/members/${memberId}`, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then((data: components["schemas"]["CustomResponseBodyString"]) => {
        setFollowStatus(data.data || null);
      })
      .catch(() => {
        setFollowStatus(null);
      })
      .finally(() => setCheckingFollow(false));
  }, [memberId, isMyPage]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>로딩 중...</div>;
  if (!member) return <div style={{ padding: 40, textAlign: 'center' }}>회원 정보를 불러올 수 없습니다.</div>;

  const handleFollow = async () => {
    setFollowLoading(true);
    setFollowError(null);
    setFollowSuccess(false);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/follows/members/${memberId}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json();
        setFollowError(data.message || '팔로우 요청 실패');
        setFollowLoading(false);
        return;
      }
      const responseData = await res.json();
      if (responseData.data?.status === 'ACCEPTED') {
        setFollowStatus('ACCEPTED');
        setFollowerCount(prev => prev + 1);
      } else if (responseData.data?.status === 'REQUESTED') {
        setFollowStatus('REQUESTED');
      } else {
        setFollowStatus('NONE');
      }
      setFollowSuccess(true);
    } catch {
      setFollowError('알 수 없는 오류가 발생했습니다.');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleUnfollow = async () => {
    setFollowLoading(true);
    setFollowError(null);
    try {
      const cancelRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/follows/members/${memberId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!cancelRes.ok) {
        const data = await cancelRes.json();
        setFollowError(data.message || '언팔로우 실패');
        setFollowLoading(false);
        return;
      }
      setFollowStatus('NONE');
      setFollowerCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      if (error instanceof Error) {
        setFollowError(`언팔로우 중 오류 발생: ${error.message}`);
      } else {
        setFollowError('알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setFollowLoading(false);
    }
  };

  const getFollowButtonText = () => {
    if (checkingFollow) return '확인 중...';
    if (followLoading) return '요청 중...';
    if (followStatus === 'ACCEPTED') return '언팔로우';
    if (followStatus === 'REQUESTED') return '팔로우 요청 중';
    if (followStatus === 'NONE') return '팔로우 요청';
    return '팔로우 요청';
  };

  const isFollowing = followStatus === 'ACCEPTED';
  const isPending = followStatus === 'REQUESTED';

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
          member_id: member.member_id ?? 0,
          profile_image_url: member.profile_image_url ?? null,
          username: member.username ?? '',
          real_name: member.real_name ?? null,
          introduction: member.introduction ?? null,
          follower_count: followerCount,
          following_count: member.following_count ?? 0,
        }}
      >
        {!isMyPage && (
          <div style={{ marginTop: 32, textAlign: 'center' }}>
            <button
              onClick={isFollowing ? handleUnfollow : handleFollow}
              style={{ 
                padding: '12px 32px', 
                background: isFollowing ? '#e00' : '#fff', 
                color: isFollowing ? '#fff' : '#0070f3', 
                border: '1px solid #0070f3', 
                borderRadius: 8, 
                fontWeight: 700, 
                fontSize: 18, 
                cursor: (followLoading || checkingFollow) ? 'not-allowed' : 'pointer', 
                opacity: (followLoading || checkingFollow) ? 0.6 : 1, 
                marginRight: 12 
              }}
              disabled={followLoading || checkingFollow || isPending}
            >
              {getFollowButtonText()}
            </button>
            {followError && <div style={{ color: 'red', marginTop: 8 }}>{followError}</div>}
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
 