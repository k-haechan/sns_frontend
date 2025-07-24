'use client';
import React, { useState, useEffect } from "react";
import { loginFormSchema } from "./validation/loginFormSchema";
import { useAuthStore } from "../store/useAuthStore";
import { redirect } from "next/navigation";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const setAuth = useAuthStore((state) => state.setAuth);
  const { memberId } = useAuthStore();

  // 이미 로그인된 상태라면 피드로 리다이렉트
  useEffect(() => {
    if (memberId) {
      window.location.href = "/feed";
    }
  }, [memberId]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      loginFormSchema.parse({ username, password });
    } catch (err: any) {
      if (err.errors && err.errors.length > 0) {
        alert(err.errors[0].message);
      } else {
        alert("입력값을 확인해주세요.");
      }
      return;
    }
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include"
      });
      if (res.ok) {
        const result = await res.json();
        const data = result.data;
        setAuth({
          memberId: data.member_id,
          username: data.username,
          realName: data.real_name,
          profileImageUrl: data.profile_image_url,
        });
        alert("로그인 성공!");
        window.location.href = "/feed";
      } else {
        const data = await res.json();
        alert(data.message || "로그인 실패");
      }
    } catch (err) {
      alert("네트워크 오류: 로그인 실패");
      console.log(err);
    }
  };

  return (
    <>
      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16, width: 300, background: "#fff", padding: 32, borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          style={{ padding: 12, borderRadius: 4, border: "1px solid #ccc", color: "#222" }}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ padding: 12, borderRadius: 4, border: "1px solid #ccc", color: "#222" }}
          required
        />
        <button
          type="submit"
          style={{
            padding: 12,
            borderRadius: 4,
            background: username && password ? "#0070f3" : "#C0C0C0",
            color: username && password ? "#fff" : "#222",
            border: "none",
            fontWeight: "bold",
            cursor: username && password ? "pointer" : "not-allowed",
            transition: "background 0.2s, color 0.2s"
          }}
          disabled={!(username && password)}
        >
          로그인
        </button>
        <button
          type="button"
          style={{ marginTop: 16, background: "none", border: "none", color: "#0070f3", textDecoration: "underline", cursor: "pointer", fontSize: 16 }}
          onClick={() => window.location.href = "/join"}
        >
          회원가입하기
        </button>
      </form>
    </>
  );
} 