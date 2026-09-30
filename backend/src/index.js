import express from "express";
import http from "http";
import { toNodeHandler } from "better-auth/node";
import "dotenv/config";
import { auth } from "./lib/auth.js";
import { friendRouter } from "./modules/friend/friend.routes.js";
import { chatRouter } from "./modules/chat/chat.routes.js";
import { notificationRouter } from "./modules/notification/notification.routes.js";
import { userRouter } from "./modules/user/user.routes.js";
import { initSocket } from "./lib/socket.js";

const app = express();
const server = http.createServer(app);

app.all("/api/auth/{*any}", toNodeHandler(auth));
app.use(express.json());

app.use("/api/friend", friendRouter);
app.use("/api/chat", chatRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/user", userRouter);

app.get("/", (req, res) => {
  res.send("Chat API is running");
});

initSocket(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`);
});
