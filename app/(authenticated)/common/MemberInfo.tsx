'use client';

import { useRouter } from 'next/navigation';
import { components } from '@/schema';

type MemberBrief = components['schemas']['MemberBriefResponse'];

type MemberInfoProps = {
  member: MemberBrief | null | undefined;
  size?: 'small' | 'medium';
};

export default function MemberInfo({ member, size = 'small' }: MemberInfoProps) {
  const router = useRouter();

  if (!member) {
    return null;
  }

  const handleUserClick = () => {
    if (member.member_id) {
      router.push(`/members/${member.member_id}`);
    }
  };

  const imageSize = size === 'small' ? 24 : 32;

  return (
    <div 
      style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
      onClick={handleUserClick}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img 
        src={member.profile_image_url || '/window.svg'} 
        alt={member.real_name || member.username || '프로필'} 
        style={{ width: imageSize, height: imageSize, borderRadius: '50%', objectFit: 'cover' }}
      />
      <div style={{ fontWeight: 600, color: '#333' }}>
        {member.real_name || member.username}
      </div>
    </div>
  );
}
