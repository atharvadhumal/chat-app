import {
  createMessage,
  getMessages,
  getOrCreateConversation,
  listConversations,
  markConversationRead,
} from "./chat.service.js";
import { createNotificationAndPush } from "../../lib/push.js";
import { emitToConversation, emitToUser } from "../../lib/socket.js";

export async function list(req, res) {
  try {
    const data = await listConversations(req.user.id);
    return res.json(data);
  } catch (error) {
    return res
      .status(400)
      .json({ message: error.message || "Failed to list conversations" });
  }
}

export async function withUser(req, res) {
  try {
    const data = await getOrCreateConversation(req.user.id, req.params.userId);
    return res.json(data);
  } catch (error) {
    return res
      .status(400)
      .json({ message: error.message || "Failed to open conversation" });
  }
}

export async function messages(req, res) {
  try {
    const data = await getMessages(req.user.id, req.params.conversationId, {
      cursor: req.query.cursor,
      limit: req.query.limit ? Number(req.query.limit) : 40,
    });
    return res.json(data);
  } catch (error) {
    return res
      .status(400)
      .json({ message: error.message || "Failed to load messages" });
  }
}

export async function send(req, res) {
  try {
    const { content } = req.body;
    const { message, recipientId } = await createMessage(
      req.user.id,
      req.params.conversationId,
      content,
    );

    emitToConversation(message.conversationId, "new_message", message);
    emitToUser(recipientId, "conversation_updated", {
      conversationId: message.conversationId,
      lastMessageText: message.content,
      lastMessageAt: message.createdAt,
      fromUserId: req.user.id,
    });

    const preview =
      message.content.length > 80
        ? `${message.content.slice(0, 80)}…`
        : message.content;

    await createNotificationAndPush({
      userId: recipientId,
      type: "MESSAGE",
      title: req.user.name || "New message",
      body: preview,
      data: {
        conversationId: message.conversationId,
        messageId: message.id,
        fromUserId: req.user.id,
      },
    });

    return res.json(message);
  } catch (error) {
    return res
      .status(400)
      .json({ message: error.message || "Failed to send message" });
  }
}

export async function read(req, res) {
  try {
    const data = await markConversationRead(
      req.user.id,
      req.params.conversationId,
    );
    return res.json(data);
  } catch (error) {
    return res
      .status(400)
      .json({ message: error.message || "Failed to mark as read" });
  }
}
