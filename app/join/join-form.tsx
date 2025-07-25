'use client';
import React, { useState } from "react";
import { joinFormSchema } from "./validation/joinFormSchema";

export default function JoinForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [real_name, setRealName] = useState("");
  const [email, setEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailCode, setEmailCode] = useState("");
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [emailCodeLoading, setEmailCodeLoading] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    const result = joinFormSchema.safeParse({ username, password, "real-name": real_name, email });
    if (!result.success) {
      alert(result.error.errors[0].message);
      return;
    }
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const res = await fetch(`${baseUrl}/api/v1/members/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, "real-name": real_name, email })
      });
      if (res.ok) {
        alert("회원가입 성공!");
        window.location.href = "/login";
      } else {
        const data = await res.json();
        alert(data.message || "회원가입 실패");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(`네트워크 오류: 회원가입 실패 - ${error.message}`);
      } else {
        alert("알 수 없는 네트워크 오류 발생");
      }
    }
  };

  const handleSendEmailCode = async () => {
    if (!email) {
      alert("이메일을 입력하세요.");
      return;
    }
    // 이메일 형식 검사
    const emailRegex = /^[\S]+@[\S]+\.[\S]+$/;
    if (!emailRegex.test(email)) {
      alert("올바른 이메일 형식이 아닙니다.");
      return;
    }
    setEmailCodeLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const res = await fetch(`${baseUrl}/api/v1/auth/email/code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        setEmailCodeSent(true);
        alert("인증코드가 이메일로 발송되었습니다.");
      } else {
        const data = await res.json();
        alert(data.message || "인증코드 발송 실패");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(`네트워크 오류: 인증코드 발송 실패 - ${error.message}`);
      }
    } finally {
      setEmailCodeLoading(false);
    }
  };

  const handleVerifyEmailCode = async () => {
    if (!emailCode) {
      alert("인증코드를 입력하세요.");
      return;
    }
    setEmailCodeLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const res = await fetch(`${baseUrl}/api/v1/auth/email/code/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: emailCode })
      });
      if (res.ok) {
        setEmailVerified(true);
        alert("이메일 인증 성공!");
      } else {
        const data = await res.json();
        alert(data.message || "이메일 인증 실패");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(`네트워크 오류: 이메일 인증 실패 - ${error.message}`);
      } else {
        alert("알 수 없는 네트워크 오류 발생");
      }
    } finally {
      setEmailCodeLoading(false);
    }
  };

  return (
    <form onSubmit={handleJoin} style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        style={{ padding: 12, borderRadius: 4, border: "1px solid #ccc", color: "#222", width: "100%" }}
        minLength={3}
        maxLength={50}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ padding: 12, borderRadius: 4, border: "1px solid #ccc", color: "#222", width: "100%" }}
        minLength={8}
        maxLength={30}
      />
      <input
        type="password"
        placeholder="Password 확인"
        value={confirmPassword}
        onChange={e => setConfirmPassword(e.target.value)}
        style={{ padding: 12, borderRadius: 4, border: "1px solid #ccc", color: "#222", width: "100%" }}
      />
      <input
        type="text"
        placeholder="이름"
        value={real_name}
        onChange={e => setRealName(e.target.value)}
        style={{ padding: 12, borderRadius: 4, border: "1px solid #ccc", color: "#222", width: "100%" }}
        maxLength={50}
      />
      <input
        type="email"
        placeholder="이메일"
        value={email}
        onChange={e => {
          setEmail(e.target.value);
          setEmailVerified(false);
          setEmailCodeSent(false);
        }}
        style={{ padding: 12, borderRadius: 4, border: "1px solid #ccc", color: "#222", width: "100%" }}
        maxLength={100}
        disabled={emailVerified}
      />
      <button
        type="button"
        onClick={handleSendEmailCode}
        style={{
          padding: 8,
          borderRadius: 4,
          background: email && !emailVerified ? "#0070f3" : "#C0C0C0",
          color: email && !emailVerified ? "#fff" : "#222",
          border: "none",
          fontWeight: "bold",
          cursor: email && !emailVerified ? "pointer" : "not-allowed",
          marginBottom: 8,
          width: "100%"
        }}
        disabled={!email || emailVerified || emailCodeLoading}
      >
        인증코드 발송
      </button>
      {emailCodeSent && !emailVerified && (
        <div style={{ display: "flex", gap: 8, alignItems: "stretch", width: "100%" }}>
          <input
            type="text"
            placeholder="인증코드 입력"
            value={emailCode}
            onChange={e => setEmailCode(e.target.value)}
            style={{ padding: 12, borderRadius: 4, border: "1px solid #ccc", color: "#222", flex: 1, height: 48, width: "100%" }}
            maxLength={10}
          />
          <button
            type="button"
            onClick={handleVerifyEmailCode}
            style={{
              padding: 0,
              borderRadius: 4,
              background: emailCode ? "#0070f3" : "#C0C0C0",
              color: emailCode ? "#fff" : "#222",
              border: "none",
              fontWeight: "bold",
              cursor: emailCode ? "pointer" : "not-allowed",
              width: 140,
              height: 48,
              whiteSpace: "nowrap"
            }}
            disabled={!emailCode || emailCodeLoading}
          >
            인증코드 확인
          </button>
        </div>
      )}
      <button
        type="submit"
        style={{
          padding: 12,
          borderRadius: 4,
          background: username && password && confirmPassword && real_name && email && emailVerified ? "#0070f3" : "#C0C0C0",
          color: username && password && confirmPassword && real_name && email && emailVerified ? "#fff" : "#222",
          border: "none",
          fontWeight: "bold",
          cursor: username && password && confirmPassword && real_name && email && emailVerified ? "pointer" : "not-allowed",
          transition: "background 0.2s, color 0.2s",
          width: "100%"
        }}
        disabled={!(username && password && confirmPassword && real_name && email && emailVerified)}
      >
        회원가입
      </button>
    </form>
  );
}