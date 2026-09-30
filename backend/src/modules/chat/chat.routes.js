import { Router } from "express";
import { requireAuth } from "../../lib/require-auth.js";
import { list, messages, read, send, withUser } from "./chat.controller.js";

export const chatRouter = Router();

chatRouter.use(requireAuth);

chatRouter.get("/conversations", list);
chatRouter.get("/with/:userId", withUser);
chatRouter.get("/conversations/:conversationId/messages", messages);
chatRouter.post("/conversations/:conversationId/messages", send);
chatRouter.post("/conversations/:conversationId/read", read);
