import { create } from "zustand";
import { components } from "@/schema";

type Notification = components["schemas"]["NotificationResponse"] & {
  follow_id?: number;
  followStatus?: string;
};

interface NotificationStore {
  notifications: Notification[];
  hasUnreadNotifications: boolean;
  page: number;
  size: number;
  hasMore: boolean;
  addNotification: (notification: Notification) => void;
  appendNotifications: (newNotifications: Notification[], hasMore: boolean) => void;
  resetNotifications: () => void;
  markNotificationsAsRead: () => void;
  incrementPage: () => void;
  removeNotification: (notificationId: number) => void;
  markSingleNotificationAsRead: (notificationId: number) => void;
  updateNotificationFollowStatus: (notificationId: number, followId: number, followStatus: string) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  hasUnreadNotifications: false,
  page: 0,
  size: 10,
  hasMore: true,
  addNotification: (notification) =>
    set((state) => {
      // Check if notification already exists to prevent duplicate keys
      if (state.notifications.some((n) => n.notification_id === notification.notification_id)) {
        return state; // Do not add if already exists
      }
      return {
        notifications: [notification, ...state.notifications],
        hasUnreadNotifications: true,
      };
    }),
  appendNotifications: (newNotifications, hasMore) =>
    set((state) => {
      // Filter out notifications that already exist in the current state
      const filteredNewNotifications = newNotifications.filter(
        (newNotif) => !state.notifications.some((existingNotif) => existingNotif.notification_id === newNotif.notification_id)
      );
      return {
        notifications: [...state.notifications, ...filteredNewNotifications],
        hasMore,
      };
    }),
  resetNotifications: () =>
    set({
      notifications: [],
      page: 0,
      hasMore: true,
    }),
  markNotificationsAsRead: () => set({ hasUnreadNotifications: false }),
  incrementPage: () => set((state) => ({ page: state.page + 1 })),
  removeNotification: (notificationId) =>
    set((state) => ({
      notifications: state.notifications.filter(
        (notif) => notif.notification_id !== notificationId
      ),
    })),
  markSingleNotificationAsRead: (notificationId) =>
    set((state) => ({
      notifications: state.notifications.map((notif) =>
        notif.notification_id === notificationId
          ? { ...notif, is_read: true }
          : notif
      ),
    })),
  updateNotificationFollowStatus: (notificationId, followId, followStatus) =>
    set((state) => ({
      notifications: state.notifications.map((notif) =>
        notif.notification_id === notificationId
          ? { ...notif, follow_id: followId, followStatus: followStatus }
          : notif
      ),
    })),
}));
