
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { components } from "@/schema";

type FollowListModalProps = {
  memberId: number;
  type: 'followers' | 'followings';
  onClose: () => void;
};

type MemberBrief = components["schemas"]["MemberBriefResponse"];

export default function FollowListModal({ memberId, type, onClose }: FollowListModalProps) {
  const router = useRouter();
  const [list, setList] = useState<MemberBrief[]>([]);
  const [loading, setLoading] = useState(true);
  const title = type === 'followers' ? '팔로워' : '팔로잉';

  useEffect(() => {
    setLoading(true);
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/follows/members/${memberId}/${type}?page=0&size=10`;
    fetch(url, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (type === 'followers') {
          setList(data.data?.content?.map((follow: components["schemas"]["FollowResponse"]) => follow.following) || []);
        } else {
          setList(data.data?.content?.map((follow: components["schemas"]["FollowResponse"]) => follow.follower) || []);
        }
      })
      .catch(error => console.error(`${title} 목록 조회 실패:`, error))
      .finally(() => setLoading(false));
  }, [memberId, type, title]);

  const handleUserClick = (userId: number) => {
    router.push(`/members/${userId}`);
    onClose();
  };

  return (
    <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.3)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:'#fff',padding:32,borderRadius:12,minWidth:320,maxWidth:400,boxShadow:'0 2px 8px rgba(0,0,0,0.15)',position:'relative',maxHeight:'80vh',overflow:'auto'}}>
        <h2 style={{marginBottom:16, color:'#222'}}>{title}</h2>
        {loading ? (
          <div style={{textAlign:'center', padding:20}}>로딩 중...</div>
        ) : list.length > 0 ? (
          <div>
            {list.map((item) => (
              <div 
                key={item.member_id} 
                style={{display:'flex',alignItems:'center',padding:'12px 0',borderBottom:'1px solid #eee', cursor: 'pointer'}}
                onClick={() => item.member_id && handleUserClick(item.member_id)}
              >
                <div style={{width:40,height:40,borderRadius:'50%',background:'#f0f0f0',marginRight:12,display:'flex',alignItems:'center',justifyContent:'center'}}>
                  {item.profile_image_url ? (
                    <img src={item.profile_image_url} alt="프로필" style={{width:40,height:40,borderRadius:'50%',objectFit:'cover'}} />
                  ) : (
                    <span style={{fontSize:20}}>👤</span>
                  )}
                </div>
                <div>
                  <div style={{fontWeight:600,color:'#222'}}>{item.real_name || item.username}</div>
                  <div style={{fontSize:14,color:'#666'}}>@{item.username}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{textAlign:'center', padding:20, color:'#666'}}>{title} 목록이 없습니다.</div>
        )}
        <button onClick={onClose} style={{position:'absolute',top:16,right:16,background:'none',border:'none',fontSize:20,cursor:'pointer',color:'#666'}}>×</button>
      </div>
    </div>
  );
}
