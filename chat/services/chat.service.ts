import { apiFetch } from "../utils/api";

export type ChatUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
};

export type Conversation = {
  id: string;
  otherUser: ChatUser;
  lastMessageAt?: string | null;
  lastMessageText?: string | null;
  createdAt: string;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  readAt?: string | null;
  sender?: ChatUser;
};

export const chatService = {
  listConversations: () =>
    apiFetch("/chat/conversations") as Promise<Conversation[]>,
  openWithUser: (userId: string) =>
    apiFetch(`/chat/with/${userId}`) as Promise<Conversation>,
  getMessages: (conversationId: string) =>
    apiFetch(`/chat/conversations/${conversationId}/messages`) as Promise<
      Message[]
    >,
  sendMessage: (conversationId: string, content: string) =>
    apiFetch(`/chat/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }) as Promise<Message>,
  markRead: (conversationId: string) =>
    apiFetch(`/chat/conversations/${conversationId}/read`, { method: "POST" }),
};
