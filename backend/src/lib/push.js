import { Expo } from "expo-server-sdk";
import { prisma } from "./db.js";

const expo = new Expo();

export async function sendPushToUser(userId, { title, body, data = {} }) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { pushToken: true },
  });

  if (!user?.pushToken || !Expo.isExpoPushToken(user.pushToken)) {
    return null;
  }

  const messages = [
    {
      to: user.pushToken,
      sound: "default",
      title,
      body,
      data,
    },
  ];

  try {
    const tickets = await expo.sendPushNotificationsAsync(messages);
    return tickets;
  } catch (error) {
    console.error("Push notification failed:", error);
    return null;
  }
}

export async function createNotificationAndPush({
  userId,
  type,
  title,
  body,
  data = {},
}) {
  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      body,
      data,
    },
  });

  await sendPushToUser(userId, {
    title,
    body,
    data: { ...data, notificationId: notification.id, type },
  });

  return notification;
}
