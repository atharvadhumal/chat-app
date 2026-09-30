import { apiFetch } from "../utils/api";

export type AppNotification = {
  id: string;
  type: "FRIEND_REQUEST" | "FRIEND_ACCEPTED" | "MESSAGE";
  title: string;
  body: string;
  data?: Record<string, unknown> | null;
  read: boolean;
  createdAt: string;
};

export const notificationService = {
  list: () => apiFetch("/notifications") as Promise<AppNotification[]>,
  unreadCount: () =>
    apiFetch("/notifications/unread-count") as Promise<{ count: number }>,
  markRead: (id: string) =>
    apiFetch(`/notifications/${id}/read`, { method: "POST" }),
  markAllRead: () => apiFetch("/notifications/read-all", { method: "POST" }),
};

export const userService = {
  savePushToken: (token: string) =>
    apiFetch("/user/push-token", {
      method: "POST",
      body: JSON.stringify({ token }),
    }),
  clearPushToken: () => apiFetch("/user/push-token", { method: "DELETE" }),
  updateAvatar: (image: string) =>
    apiFetch("/user/avatar", {
      method: "POST",
      body: JSON.stringify({ image }),
    }) as Promise<{ id: string; name: string; email: string; image: string }>,
};
