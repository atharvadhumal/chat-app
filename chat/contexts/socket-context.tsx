import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { SOCKET_URL } from "../utils";
import { authClient } from "../utils/auth-client";
import { useAuth } from "./auth-context";
import { CHAT_KEYS } from "../hooks/useChatQueries";
import { NOTIF_KEYS } from "../hooks/useNotificationQueries";
import { USER_KEYS } from "../hooks/useFriendQueries";
import type { Message } from "../services/chat.service";

type SocketContextValue = {
  socket: Socket | null;
  joinConversation: (id: string) => void;
  leaveConversation: (id: string) => void;
  emitTyping: (conversationId: string, isTyping: boolean) => void;
};

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  joinConversation: () => {},
  leaveConversation: () => {},
  emitTyping: () => {},
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!user) {
      setSocket((prev) => {
        prev?.disconnect();
        return null;
      });
      return;
    }

    let active = true;
    let current: Socket | null = null;

    (async () => {
      const cookie = (await authClient.getCookie?.()) ?? "";
      if (!active || !cookie) return;

      current = io(SOCKET_URL, {
        transports: ["websocket"],
        auth: { cookie },
        autoConnect: true,
      });

      current.on("new_message", (message: Message) => {
        queryClient.setQueryData(
          CHAT_KEYS.messages(message.conversationId),
          (old: Message[] | undefined) => {
            if (!old) return [message];
            if (old.some((m) => m.id === message.id)) return old;
            return [...old, message];
          },
        );
        queryClient.invalidateQueries({ queryKey: CHAT_KEYS.conversations() });
        queryClient.invalidateQueries({ queryKey: NOTIF_KEYS.all });
      });

      current.on("conversation_updated", () => {
        queryClient.invalidateQueries({ queryKey: CHAT_KEYS.conversations() });
      });

      current.on("friend_request_received", () => {
        queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
        queryClient.invalidateQueries({ queryKey: NOTIF_KEYS.all });
      });

      current.on("friend_request_accepted", () => {
        queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
        queryClient.invalidateQueries({ queryKey: NOTIF_KEYS.all });
      });

      if (active) setSocket(current);
    })();

    return () => {
      active = false;
      current?.disconnect();
      setSocket(null);
    };
  }, [user?.id, queryClient]);

  const value = useMemo<SocketContextValue>(
    () => ({
      socket,
      joinConversation: (id: string) => socket?.emit("join_conversation", id),
      leaveConversation: (id: string) => socket?.emit("leave_conversation", id),
      emitTyping: (conversationId: string, isTyping: boolean) =>
        socket?.emit("typing", { conversationId, isTyping }),
    }),
    [socket],
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
