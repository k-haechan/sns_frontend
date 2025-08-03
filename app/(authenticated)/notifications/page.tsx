"use client";

import { useNotificationStore } from "@/app/store/useNotificationStore";
import { useEffect, useRef, useState } from "react";
import { components } from "@/schema";
import { useRouter } from "next/navigation";

type Notification = components["schemas"]["NotificationResponse"] & {
  follow_id?: number;
  followStatus?: string;
};

const NotificationsPage = () => {
  const { notifications, page, size, hasMore, appendNotifications, resetNotifications, markNotificationsAsRead, incrementPage, updateNotificationFollowStatus } = useNotificationStore();
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loader = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    resetNotifications();
    markNotificationsAsRead();
  }, [resetNotifications, markNotificationsAsRead]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!hasMore) return;

      if (page === 0) {
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const queryParams = new URLSearchParams({
          "pageable.page": page.toString(),
          "pageable.size": size.toString(),
        }).toString();

        const response = await fetch(`${baseUrl}/api/v1/notifications?${queryParams}`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const fetchedNotifications: Notification[] = data.data.content || [];

        // FOLLOW_REQUEST 타입 알림에 대해 follow_id와 followStatus 추가
        const processedNotifications = await Promise.all(
          fetchedNotifications.map(async (notif) => {
            if (notif.type === "FOLLOW_REQUEST" && notif.sub_id) {
              try {
                const followResponse = await fetch(`${baseUrl}/api/v1/follows/one?following-id=${notif.sub_id}`, {
                  credentials: "include",
                });
                if (followResponse.ok) {
                  const followData = await followResponse.json();
                  return { ...notif, follow_id: followData.data.follow_id, followStatus: followData.data.status };
                }
              } catch (e: unknown) {
                console.error("Failed to fetch follow status for notification:", notif.notification_id, e);
              }
            }
            return notif;
          })
        );
        appendNotifications(processedNotifications, !data.data.last);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "An unknown error occurred");
      } finally {
        setLoading(false);
        setIsLoadingMore(false);
      }
    };

    fetchNotifications();
  }, [page, size, hasMore, appendNotifications]);

  useEffect(() => {
    const currentLoader = loader.current; // Capture the ref value
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          incrementPage();
        }
      },
      {
        root: null,
        rootMargin: "20px",
        threshold: 1.0,
      }
    );

    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [hasMore, isLoadingMore, incrementPage]);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.sub_id) {
      console.warn("Notification sub_id is missing for type:", notification.type);
      return;
    }

    switch (notification.type) {
      case "FOLLOW_REQUEST":
      case "FOLLOW_ACCEPTED":
      case "FOLLOWED":
        router.push(`/members/${notification.sub_id}`);
        break;
      case "POST_LIKE":
      case "COMMENT":
        router.push(`/posts/${notification.sub_id}`);
        break;
      default:
        console.log("Unhandled notification type:", notification.type);
        break;
    }
  };

  const handleAcceptFollow = async (followId: number, notificationId: number) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(`${baseUrl}/api/v1/follows/${followId}/accept?notification-id=${notificationId}`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // 성공적으로 처리되면 알림 목록에서 해당 알림의 followStatus를 업데이트
      updateNotificationFollowStatus(notificationId, followId, "ACCEPTED");
    } catch (e: unknown) {
      console.error("Failed to accept follow request:", e);
      alert("Failed to accept follow request: " + (e instanceof Error ? e.message : "An unknown error occurred"));
    }
  };

  const handleRejectFollow = async (followId: number, notificationId: number) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(`${baseUrl}/api/v1/follows/${followId}/reject?notification-id=${notificationId}`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // 성공적으로 처리되면 알림 목록에서 해당 알림의 followStatus를 업데이트
      updateNotificationFollowStatus(notificationId, followId, "REJECTED");
    } catch (e: unknown) {
      console.error("Failed to reject follow request:", e);
      alert("Failed to reject follow request: " + (e instanceof Error ? e.message : "An unknown error occurred"));
    }
  };

  if (loading && notifications.length === 0) {
    return <div className="p-4">Loading notifications...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      {notifications.length === 0 && !loading ? (
        <p className="text-gray-500">No notifications yet.</p>
      ) : (
        <ul>
          {notifications.map((notification) => {
            console.log("Notification ID for key:", notification.notification_id);
            return (
            <li 
              key={notification.notification_id} 
              className="py-2 border-b text-gray-100 flex justify-between items-center cursor-pointer hover:bg-gray-700"
              onClick={() => handleNotificationClick(notification)}
            >
              <div>
                <span>{notification.message}</span>
                {notification.created_at && (
                  <p className="text-xs text-gray-500">{new Date(notification.created_at).toLocaleString()}</p>
                )}
                {notification.type === "FOLLOW_REQUEST" && notification.followStatus === "REQUESTED" && (
                  <div className="flex gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                    <button 
                      className="bg-blue-500 hover:bg-blue-700 text-white text-xs font-bold py-1 px-2 rounded"
                      onClick={() => notification.follow_id && handleAcceptFollow(notification.follow_id, notification.notification_id!)}
                    >
                      Accept
                    </button>
                    <button 
                      className="bg-red-500 hover:bg-red-700 text-white text-xs font-bold py-1 px-2 rounded"
                      onClick={() => notification.follow_id && handleRejectFollow(notification.follow_id, notification.notification_id!)}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
              <span className={`text-sm ${notification.is_read ? "text-gray-500" : "text-blue-500 font-bold"}`}>
                {notification.is_read ? "Read" : "Unread"}
              </span>
            </li>
            );
          })}
        </ul>
      )}
      {hasMore && (
        <div ref={loader} className="p-4 text-center">
          {isLoadingMore ? "Loading more notifications..." : ""}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
