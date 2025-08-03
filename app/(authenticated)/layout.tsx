'use client';

import Link from "next/link";
import { useAuthStore } from "../store/useAuthStore";
import { FaHome, FaSearch, FaComments, FaUser, FaEdit } from 'react-icons/fa';
import { useState, useEffect } from "react";
import NotificationIcon from "./notifications/NotificationIcon";
import { useNotificationStore } from "../store/useNotificationStore";
import { components } from "@/schema";

type Notification = components["schemas"]["NotificationResponse"];

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { memberId, resetAuth, _hasHydrated } = useAuthStore();
  const { addNotification, hasUnreadNotifications } = useNotificationStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsCollapsed(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!_hasHydrated || !memberId) return;

    const eventSource = new EventSource(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/notifications/subscribe`,
      { withCredentials: true }
    );

    eventSource.onmessage = (event) => {
      if (event.data.startsWith("EventStream Created.")) {
        return;
      }
      const newNotification = JSON.parse(event.data) as Notification;
      addNotification(newNotification);
    };

    eventSource.onerror = (error) => {
      console.error("EventSource failed:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [_hasHydrated, memberId, addNotification]);

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
          <Link href="/chat-rooms" style={{ 
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
            cursor: "pointer",
            justifyContent: isCollapsed ? "center" : "flex-start"
          }} 
          onMouseEnter={(e) => e.currentTarget.style.background = "#f5f5f5"} 
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          onClick={() => useNotificationStore.getState().markNotificationsAsRead()}
          >
            <NotificationIcon hasUnreadNotifications={hasUnreadNotifications} />
            {!isCollapsed && <span>Notifications</span>}
          </Link>
          <Link href="/posts" style={{ 
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
      <div style={{ marginLeft: contentMargin, minHeight: "100vh", transition: "margin-left 0.3s ease" }}>
        {children}
      </div>
    </>
  );
}
 