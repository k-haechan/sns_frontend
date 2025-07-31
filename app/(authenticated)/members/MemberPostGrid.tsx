import React from 'react';

type Post = {
  post_id: number;
  title: string;
  images?: { url?: string | null }[];
};

type MemberPostGridProps = {
  posts: Post[];
  onPostClick?: (post: Post) => void;
};

function chunkArray<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

export default function MemberPostGrid({ posts, onPostClick }: MemberPostGridProps) {
  if (!posts || posts.length === 0) {
    return <div style={{ color: '#888', textAlign: 'center', padding: 16 }}>게시물이 없습니다.</div>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 8 }}>
      {chunkArray(posts, 4).map((row, rowIdx) => (
        <div key={rowIdx} style={{ display: 'flex', gap: 12 }}>
          {row.map((post) => (
            <div
              key={post.post_id}
              style={{ minWidth: 80, maxWidth: 100, textAlign: 'center', cursor: 'pointer' }}
              onClick={() => onPostClick?.(post)}
            >
              <div style={{ width: 80, height: 80, borderRadius: 8, overflow: 'hidden', background: '#f3f3f3', margin: '0 auto 6px auto', border: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {post.images && post.images.length > 0 ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.images[0].url!}
                      alt={post.title || '게시물 이미지'}
                      width={80}
                      height={80}
                      style={{ objectFit: 'cover' }}
                      crossOrigin="use-credentials"
                    />
                  </>
                ) : (
                  <span style={{ color: '#bbb', fontSize: 32 }}>🖼️</span>
                )}
              </div>
              <div style={{ fontSize: 13, color: '#222', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{post.title}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
} 