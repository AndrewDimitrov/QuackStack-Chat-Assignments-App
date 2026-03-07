import Notification from "@/lib/models/Notification";
import { pusherServer } from "@/lib/pusher";

export async function createNotification({ userId, type, title, body, link }) {
  const notification = await Notification.create({
    user: userId,
    type,
    title,
    body,
    link,
  });

  await pusherServer.trigger(`notifications-${userId}`, "new-notification", {
    _id: notification._id,
    type,
    title,
    body,
    link,
    read: false,
    createdAt: notification.createdAt,
  });

  // Also update sidebar
  await pusherServer.trigger(`sidebar-${userId}`, "update", { link });

  return notification;
}
