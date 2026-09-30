import { Server } from "socket.io";
import { auth } from "./auth.js";

let io = null;

export function getIO() {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
}

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const cookie =
        socket.handshake.auth?.cookie ||
        socket.handshake.headers?.cookie ||
        "";

      if (!cookie) {
        return next(new Error("Unauthorized"));
      }

      const session = await auth.api.getSession({
        headers: new Headers({ cookie }),
      });

      if (!session?.user?.id) {
        return next(new Error("Unauthorized"));
      }

      socket.user = session.user;
      return next();
    } catch (error) {
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user.id;
    socket.join(`user:${userId}`);

    socket.on("join_conversation", (conversationId) => {
      if (typeof conversationId === "string" && conversationId) {
        socket.join(`conversation:${conversationId}`);
      }
    });

    socket.on("leave_conversation", (conversationId) => {
      if (typeof conversationId === "string" && conversationId) {
        socket.leave(`conversation:${conversationId}`);
      }
    });

    socket.on("typing", ({ conversationId, isTyping }) => {
      if (!conversationId) return;
      socket.to(`conversation:${conversationId}`).emit("typing", {
        conversationId,
        userId,
        isTyping: !!isTyping,
      });
    });
  });

  return io;
}

export function emitToUser(userId, event, payload) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
}

export function emitToConversation(conversationId, event, payload) {
  if (!io) return;
  io.to(`conversation:${conversationId}`).emit(event, payload);
}
