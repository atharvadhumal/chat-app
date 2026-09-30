import { prisma } from "../../lib/db.js";
import { areFriends } from "../friend/friend.service.js";

function normalizePair(a, b) {
  return a < b ? [a, b] : [b, a];
}

const userSelect = { id: true, name: true, email: true, image: true };

export async function getOrCreateConversation(userId, otherUserId) {
  if (!otherUserId) throw new Error("otherUserId is required");
  if (userId === otherUserId) throw new Error("Cannot chat with yourself");

  const friends = await areFriends(userId, otherUserId);
  if (!friends) throw new Error("You can only chat with friends");

  const [u1, u2] = normalizePair(userId, otherUserId);

  if (!prisma.conversation) {
    throw new Error(
      "Chat models are not loaded. Restart the backend after running prisma generate.",
    );
  }

  const include = {
    user1: { select: userSelect },
    user2: { select: userSelect },
  };

  let conversation = await prisma.conversation.findUnique({
    where: { userId1_userId2: { userId1: u1, userId2: u2 } },
    include,
  });

  if (!conversation) {
    try {
      conversation = await prisma.conversation.create({
        data: { userId1: u1, userId2: u2 },
        include,
      });
    } catch (error) {
      // Concurrent create — fetch the winner
      conversation = await prisma.conversation.findUnique({
        where: { userId1_userId2: { userId1: u1, userId2: u2 } },
        include,
      });
      if (!conversation) throw error;
    }
  }

  const other =
    conversation.userId1 === userId ? conversation.user2 : conversation.user1;

  return {
    id: conversation.id,
    otherUser: other,
    lastMessageAt: conversation.lastMessageAt,
    lastMessageText: conversation.lastMessageText,
    createdAt: conversation.createdAt,
  };
}

export async function listConversations(userId) {
  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ userId1: userId }, { userId2: userId }],
    },
    include: {
      user1: { select: userSelect },
      user2: { select: userSelect },
    },
    orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
  });

  return conversations.map((c) => {
    const other = c.userId1 === userId ? c.user2 : c.user1;
    return {
      id: c.id,
      otherUser: other,
      lastMessageAt: c.lastMessageAt,
      lastMessageText: c.lastMessageText,
      createdAt: c.createdAt,
    };
  });
}

export async function getMessages(userId, conversationId, { cursor, limit = 40 } = {}) {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [{ userId1: userId }, { userId2: userId }],
    },
  });

  if (!conversation) throw new Error("Conversation not found");

  const messages = await prisma.message.findMany({
    where: {
      conversationId,
      ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      sender: { select: userSelect },
    },
  });

  return messages.reverse();
}

export async function createMessage(userId, conversationId, content) {
  const text = (content || "").trim();
  if (!text) throw new Error("Message cannot be empty");

  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [{ userId1: userId }, { userId2: userId }],
    },
  });

  if (!conversation) throw new Error("Conversation not found");

  const message = await prisma.$transaction(async (tx) => {
    const created = await tx.message.create({
      data: {
        conversationId,
        senderId: userId,
        content: text,
      },
      include: {
        sender: { select: userSelect },
      },
    });

    await tx.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: created.createdAt,
        lastMessageText: text.slice(0, 200),
      },
    });

    return created;
  });

  const recipientId =
    conversation.userId1 === userId
      ? conversation.userId2
      : conversation.userId1;

  return { message, recipientId };
}

export async function markConversationRead(userId, conversationId) {
  await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: userId },
      readAt: null,
      conversation: {
        OR: [{ userId1: userId }, { userId2: userId }],
      },
    },
    data: { readAt: new Date() },
  });

  return { success: true };
}
