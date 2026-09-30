import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatService } from "../services/chat.service";

export const CHAT_KEYS = {
  all: ["chats"] as const,
  conversations: () => [...CHAT_KEYS.all, "conversations"] as const,
  messages: (id: string) => [...CHAT_KEYS.all, "messages", id] as const,
};

export function useConversations() {
  return useQuery({
    queryKey: CHAT_KEYS.conversations(),
    queryFn: () => chatService.listConversations(),
  });
}

export function useMessages(conversationId: string) {
  return useQuery({
    queryKey: CHAT_KEYS.messages(conversationId),
    queryFn: () => chatService.getMessages(conversationId),
    enabled: !!conversationId,
  });
}

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) =>
      chatService.sendMessage(conversationId, content),
    onSuccess: (message) => {
      queryClient.setQueryData(
        CHAT_KEYS.messages(conversationId),
        (old: any[] | undefined) => {
          if (!old) return [message];
          if (old.some((m) => m.id === message.id)) return old;
          return [...old, message];
        },
      );
      queryClient.invalidateQueries({ queryKey: CHAT_KEYS.conversations() });
    },
  });
}

export function useOpenChat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => chatService.openWithUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAT_KEYS.conversations() });
    },
  });
}
