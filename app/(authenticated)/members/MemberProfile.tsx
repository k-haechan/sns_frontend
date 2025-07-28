import React from 'react';

type MemberProfileProps = {
  member: {
    profile_image_url?: string | null;
    username: string;
    real_name?: string | null;
    introduction?: string | null;
    follower_count: number;
    following_count: number;
  };
  children?: React.ReactNode;
};

export default function MemberProfile({ member, children }: MemberProfileProps) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
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
      {children}
    </>
  );
} 