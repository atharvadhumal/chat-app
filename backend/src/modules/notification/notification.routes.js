import { Router } from "express";
import { requireAuth } from "../../lib/require-auth.js";
import { prisma } from "../../lib/db.js";

export const notificationRouter = Router();

notificationRouter.use(requireAuth);

notificationRouter.get("/", async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return res.json(notifications);
  } catch (error) {
    return res
      .status(400)
      .json({ message: error.message || "Failed to load notifications" });
  }
});

notificationRouter.get("/unread-count", async (req, res) => {
  try {
    const count = await prisma.notification.count({
      where: { userId: req.user.id, read: false },
    });
    return res.json({ count });
  } catch (error) {
    return res
      .status(400)
      .json({ message: error.message || "Failed to load unread count" });
  }
});

notificationRouter.post("/read-all", async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, read: false },
      data: { read: true },
    });
    return res.json({ success: true });
  } catch (error) {
    return res
      .status(400)
      .json({ message: error.message || "Failed to mark all read" });
  }
});

notificationRouter.post("/:id/read", async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user.id },
      data: { read: true },
    });
    return res.json({ success: true });
  } catch (error) {
    return res
      .status(400)
      .json({ message: error.message || "Failed to mark notification read" });
  }
});
