import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Notification from "@/lib/models/Notification";
import { pusherServer } from "@/lib/pusher";

export async function POST(request) {
  const session = await auth();
  const { link } = await request.json();
  await connectDB();

  console.log("mark-by-link link:", link);
  console.log("user:", session.user.id);

  const result = await Notification.updateMany(
    { user: session.user.id, link, read: false },
    { read: true },
  );

  console.log("updated:", result.modifiedCount);

  await pusherServer.trigger(`notifications-${session.user.id}`, "read-link", {
    link,
  });
  await pusherServer.trigger(`sidebar-${session.user.id}`, "update", { link });
  return Response.json({ success: true });
}
