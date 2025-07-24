"use client";
import React, { useState } from "react";

async function uploadImage(file: File, presignedUrl: string) {
  const response = await fetch(presignedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'image/webp',
    },
    body: file,
  });
  if (!response.ok) throw new Error('업로드 실패');
  return response;
}

// 이미지 webp 변환 함수
async function convertToWebp(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('canvas 2d context 생성 실패'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('webp 변환 실패'));
        },
        'image/webp'
      );
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export default function ImageUploadTestPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  // 파일 미리보기 생성
  React.useEffect(() => {
    if (files.length === 0) {
      setPreviewUrls([]);
      setCurrentIdx(0);
      return;
    }
    let isMounted = true;
    Promise.all(
      files.map(file => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = e => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      })
    ).then(urls => {
      if (isMounted) setPreviewUrls(urls);
    });
    return () => { isMounted = false; };
  }, [files]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      setFiles(prev => {
        const newFiles = [...prev, ...Array.from(fileList)];
        return newFiles;
      });
      setFileInputKey(k => k + 1); // input 리렌더링
    }
  };

  const handleAddFile = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
    setPreviewUrls(prev => prev.filter((_, i) => i !== idx));
    setCurrentIdx(idx === 0 ? 0 : idx - 1);
  };

  const handlePrev = () => {
    setCurrentIdx(idx => (idx === 0 ? previewUrls.length - 1 : idx - 1));
  };
  const handleNext = () => {
    setCurrentIdx(idx => (idx === previewUrls.length - 1 ? 0 : idx + 1));
  };

  const handleCreateAndUpload = async () => {
    setError(null);
    setResults([]);
    setSuccess(null);
    if (!title || !content || files.length === 0) {
      setError('제목, 내용, 이미지를 모두 입력하세요.');
      return;
    }
    setUploading(true);
    try {
      // 1. 게시물 생성
      const createRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          "images-length": files.length
        }),
        credentials: 'include',
      });
      const createData = await createRes.json();
      if (!createRes.ok || !createData?.data?.post_id) {
        setError(createData?.message || '게시물 생성 실패');
        setUploading(false);
        return;
      }
      const postId = createData.data.post_id;
      const presignedUrls = createData.data.images?.map((img: { url: string }) => img.url);
      if (!presignedUrls || presignedUrls.length !== files.length) {
        setError('presignedUrl 개수 불일치 또는 응답 오류');
        setUploading(false);
        return;
      }
      // 2. presignedUrl로 이미지 업로드
      const uploadResults: string[] = [];
      for (let i = 0; i < files.length; i++) {
        try {
          const webpBlob = await convertToWebp(files[i]);
          const webpFile = new File([webpBlob], `${i}.webp`, { type: 'image/webp' });
          await uploadImage(webpFile, presignedUrls[i]);
          uploadResults.push(presignedUrls[i].split('?')[0]);
        } catch {
          uploadResults.push('업로드 실패');
        }
      }
      setResults(uploadResults);
      setSuccess('게시물 생성 및 이미지 업로드가 완료되었습니다!');
      setTitle('');
      setContent('');
      setFiles([]);
      setFileInputKey(k => k + 1);
    } catch (e: any) {
      setError(e.message || '오류 발생');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: 32 }}>
      <h2 style={{ fontWeight: 700, fontSize: 24, marginBottom: 24, color: '#222' }}>게시물 생성 및 이미지 업로드</h2>
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="제목 입력"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #bbb', marginBottom: 10, color: '#222', background: '#f9f9f9' }}
        />
        <textarea
          placeholder="내용 입력"
          value={content}
          onChange={e => setContent(e.target.value)}
          style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #bbb', marginBottom: 10, color: '#222', background: '#f9f9f9', minHeight: 80, resize: 'vertical' }}
        />
        <input
          key={fileInputKey}
          type="file"
          multiple
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <button
          type="button"
          onClick={handleAddFile}
          style={{ width: '100%', padding: 10, borderRadius: 6, background: '#eee', color: '#222', fontWeight: 600, fontSize: 15, border: '1px solid #bbb', marginBottom: 10, cursor: 'pointer' }}
        >
          파일 추가
        </button>
        {/* 이미지 미리보기 캐러셀 */}
        {previewUrls.length > 0 && (
          <div style={{ position: 'relative', width: '100%', height: 220, marginBottom: 16, background: '#f7f7f7', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <button onClick={handlePrev} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.1)', border: 'none', borderRadius: '50%', width: 32, height: 32, fontSize: 20, cursor: 'pointer', zIndex: 1 }}>&lt;</button>
            <img
              src={previewUrls[currentIdx]}
              alt={`미리보기 ${currentIdx + 1}`}
              style={{ maxWidth: '90%', maxHeight: 200, borderRadius: 6, objectFit: 'contain', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
            />
            <button onClick={handleNext} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.1)', border: 'none', borderRadius: '50%', width: 32, height: 32, fontSize: 20, cursor: 'pointer', zIndex: 1 }}>&gt;</button>
            <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.3)', color: '#fff', borderRadius: 12, padding: '2px 12px', fontSize: 13 }}>{currentIdx + 1} / {previewUrls.length}</div>
          </div>
        )}
        {files.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0 16px 0' }}>
            {files.map((file, idx) => (
              <li key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 6, background: '#f7f7f7', borderRadius: 4, padding: '4px 8px' }}>
                <span style={{ flex: 1, color: '#222', fontSize: 15 }}>{file.name} <span style={{ color: '#888', fontSize: 13 }}>({(file.size/1024).toFixed(1)}KB)</span></span>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(idx)}
                  style={{ marginLeft: 8, background: 'none', border: 'none', color: '#b00020', fontWeight: 700, cursor: 'pointer', fontSize: 15 }}
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
        )}
        <button
          onClick={handleCreateAndUpload}
          disabled={uploading || !title || !content || files.length === 0}
          style={{ width: '100%', padding: 12, borderRadius: 6, background: '#0070f3', color: '#fff', fontWeight: 700, fontSize: 16, border: 'none', cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.6 : 1, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
        >
          {uploading ? '업로드 중...' : '게시물 생성 및 이미지 업로드'}
        </button>
      </div>
      {error && <div style={{ color: '#b00020', marginBottom: 10, fontWeight: 600 }}>{error}</div>}
      {success && <div style={{ color: '#0070f3', marginBottom: 10, fontWeight: 600 }}>{success}</div>}
      {results.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h4 style={{ color: '#222', fontWeight: 700 }}>업로드 결과</h4>
          <ul style={{ padding: 0, listStyle: 'none' }}>
            {results.map((url, idx) => (
              <li key={idx} style={{ marginBottom: 8 }}>
                {url.startsWith('http') ? (
                  <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#0056b3', textDecoration: 'underline', fontWeight: 500 }}>{url}</a>
                ) : (
                  <span style={{ color: '#b00020', fontWeight: 600 }}>{url}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 