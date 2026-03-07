import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Notification from "@/lib/models/Notification";

export async function GET() {
  const session = await auth();
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const notifications = await Notification.find({ user: session.user.id })
    .sort({ createdAt: -1 })
    .limit(30);

  const unreadCount = await Notification.countDocuments({
    user: session.user.id,
    read: false,
  });

  return Response.json({ notifications, unreadCount });
}

export async function PATCH(request) {
  const session = await auth();
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { notificationId } = await request.json();

  await connectDB();

  await Notification.findOneAndUpdate(
    { _id: notificationId, user: session.user.id },
    { read: true },
  );

  return Response.json({ success: true });
}
