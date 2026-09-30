import { Router } from "express";
import { requireAuth } from "../../lib/require-auth.js";
import { prisma } from "../../lib/db.js";

export const userRouter = Router();

userRouter.use(requireAuth);

userRouter.post("/avatar", async (req, res) => {
  try {
    const { image } = req.body;
    if (!image || typeof image !== "string") {
      return res.status(400).json({ message: "image url is required" });
    }

    if (!image.startsWith("https://api.dicebear.com/")) {
      return res.status(400).json({ message: "Invalid avatar url" });
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { image },
      select: { id: true, name: true, email: true, image: true },
    });

    return res.json(user);
  } catch (error) {
    return res
      .status(400)
      .json({ message: error.message || "Failed to update avatar" });
  }
});

userRouter.post("/push-token", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token || typeof token !== "string") {
      return res.status(400).json({ message: "token is required" });
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: { pushToken: token },
    });

    return res.json({ success: true });
  } catch (error) {
    return res
      .status(400)
      .json({ message: error.message || "Failed to save push token" });
  }
});

userRouter.delete("/push-token", async (req, res) => {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { pushToken: null },
    });
    return res.json({ success: true });
  } catch (error) {
    return res
      .status(400)
      .json({ message: error.message || "Failed to clear push token" });
  }
});
