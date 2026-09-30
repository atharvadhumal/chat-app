import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "../services/notification.service";

export const NOTIF_KEYS = {
  all: ["notifications"] as const,
  list: () => [...NOTIF_KEYS.all, "list"] as const,
  unread: () => [...NOTIF_KEYS.all, "unread"] as const,
};

export function useNotifications() {
  return useQuery({
    queryKey: NOTIF_KEYS.list(),
    queryFn: () => notificationService.list(),
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: NOTIF_KEYS.unread(),
    queryFn: async () => {
      const { count } = await notificationService.unreadCount();
      return count;
    },
    refetchInterval: 30_000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIF_KEYS.all });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIF_KEYS.all });
    },
  });
}
