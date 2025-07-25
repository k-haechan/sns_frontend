"use client";

import Link from "next/link";
import { useAuthStore } from "../store/useAuthStore";
import { FaHome, FaSearch, FaComments, FaBell, FaUser, FaEdit } from 'react-icons/fa';

import { useState, useEffect } from "react";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { memberId, resetAuth, _hasHydrated } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsCollapsed(window.innerWidth <= 768);
    };

    // 초기 설정
    handleResize();

    // 리사이즈 이벤트 리스너
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      await fetch(`${baseUrl}/api/v1/auth/logout`, { method: "POST", credentials: "include" });
    } catch {}
    resetAuth();
    window.location.href = "/login";
  };

  const sidebarWidth = isCollapsed ? "60px" : "250px";
  const contentMargin = isCollapsed ? "60px" : "250px";

  return (
    <>
      <nav style={{ 
        position: "fixed", 
        left: 0, 
        top: 0, 
        width: sidebarWidth,
        height: "100vh", 
        background: "#fff", 
        borderRight: "1px solid #eee", 
        display: "flex", 
        flexDirection: "column",
        zIndex: 100, 
        boxShadow: "2px 0 8px rgba(0,0,0,0.03)",
        transition: "width 0.3s ease"
      }}>
        <div style={{ 
          padding: isCollapsed ? "20px 8px" : "20px 16px", 
          display: "flex", 
          flexDirection: "column", 
          gap: 8,
          flex: 1
        }}>
          <Link href="/feed" style={{ 
            fontWeight: 700, 
            fontSize: 16, 
            color: "#222", 
            textDecoration: "none", 
            padding: isCollapsed ? "12px 8px" : "12px 16px", 
            display: "flex", 
            alignItems: "center", 
            gap: isCollapsed ? 0 : 12,
            borderRadius: 8,
            transition: "background 0.2s",
            justifyContent: isCollapsed ? "center" : "flex-start"
          }} onMouseEnter={(e) => e.currentTarget.style.background = "#f5f5f5"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
            <FaHome size={20} />
            {!isCollapsed && <span>Feed</span>}
          </Link>
          <Link href="/search" style={{ 
            fontWeight: 700, 
            fontSize: 16, 
            color: "#222", 
            textDecoration: "none", 
            padding: isCollapsed ? "12px 8px" : "12px 16px", 
            display: "flex", 
            alignItems: "center", 
            gap: isCollapsed ? 0 : 12,
            borderRadius: 8,
            transition: "background 0.2s",
            justifyContent: isCollapsed ? "center" : "flex-start"
          }} onMouseEnter={(e) => e.currentTarget.style.background = "#f5f5f5"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
            <FaSearch size={20} />
            {!isCollapsed && <span>Search</span>}
          </Link>
          <Link href="/chat" style={{ 
            fontWeight: 700, 
            fontSize: 16, 
            color: "#222", 
            textDecoration: "none", 
            padding: isCollapsed ? "12px 8px" : "12px 16px", 
            display: "flex", 
            alignItems: "center", 
            gap: isCollapsed ? 0 : 12,
            borderRadius: 8,
            transition: "background 0.2s",
            justifyContent: isCollapsed ? "center" : "flex-start"
          }} onMouseEnter={(e) => e.currentTarget.style.background = "#f5f5f5"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
            <FaComments size={20} />
            {!isCollapsed && <span>Chat</span>}
          </Link>
          <Link href="/notifications" style={{ 
            fontWeight: 700, 
            fontSize: 16, 
            color: "#222", 
            textDecoration: "none", 
            padding: isCollapsed ? "12px 8px" : "12px 16px", 
            display: "flex", 
            alignItems: "center", 
            gap: isCollapsed ? 0 : 12,
            borderRadius: 8,
            transition: "background 0.2s",
            justifyContent: isCollapsed ? "center" : "flex-start"
          }} onMouseEnter={(e) => e.currentTarget.style.background = "#f5f5f5"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
            <FaBell size={20} />
            {!isCollapsed && <span>Notifications</span>}
          </Link>
          <Link href="/post" style={{ 
            fontWeight: 700, 
            fontSize: 16, 
            color: "#222", 
            textDecoration: "none", 
            padding: isCollapsed ? "12px 8px" : "12px 16px", 
            display: "flex", 
            alignItems: "center", 
            gap: isCollapsed ? 0 : 12,
            borderRadius: 8,
            transition: "background 0.2s",
            justifyContent: isCollapsed ? "center" : "flex-start"
          }} onMouseEnter={(e) => e.currentTarget.style.background = "#f5f5f5"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
            <FaEdit size={20} />
            {!isCollapsed && <span>Post</span>}
          </Link>
          <Link href="/members/me" style={{ 
            fontWeight: 700, 
            fontSize: 16, 
            color: "#222", 
            textDecoration: "none", 
            padding: isCollapsed ? "12px 8px" : "12px 16px", 
            display: "flex", 
            alignItems: "center", 
            gap: isCollapsed ? 0 : 12,
            borderRadius: 8,
            transition: "background 0.2s",
            justifyContent: isCollapsed ? "center" : "flex-start"
          }} onMouseEnter={(e) => e.currentTarget.style.background = "#f5f5f5"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
            <FaUser size={20} />
            {!isCollapsed && <span>MyPage</span>}
          </Link>
        </div>
        {_hasHydrated && (
          <div style={{ padding: isCollapsed ? "16px 8px" : "16px" }}>
            {memberId ? (
              <button
                onClick={handleLogout}
                style={{
                  width: "100%",
                  padding: isCollapsed ? "12px 8px" : "12px 16px",
                  fontWeight: 900,
                  fontSize: isCollapsed ? 14 : 16,
                  background: "#f5f5f5",
                  color: "#222",
                  border: "1.5px solid #888",
                  borderRadius: 8,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: isCollapsed ? 0 : 8
                }}
              >
                {isCollapsed ? "L" : "Logout"}
              </button>
            ) : (
              <button
                onClick={() => window.location.href = "/login"}
                style={{
                  width: "100%",
                  padding: isCollapsed ? "12px 8px" : "12px 16px",
                  fontWeight: 900,
                  fontSize: isCollapsed ? 14 : 16,
                  background: "#0070f3",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: isCollapsed ? 0 : 8
                }}
              >
                {isCollapsed ? "L" : "Login"}
              </button>
            )}
          </div>
        )}
      </nav>
      <div style={{ marginLeft: contentMargin, minHeight: "100vh", transition: "margin-left 0.3s ease" }}>{children}</div>
    </>
  );
} 