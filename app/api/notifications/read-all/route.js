import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Notification from "@/lib/models/Notification";
import { pusherServer } from "@/lib/pusher";

export async function POST() {
  const session = await auth();
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  await Notification.updateMany(
    { user: session.user.id, read: false },
    { read: true },
  );

  await pusherServer.trigger(
    `notifications-${session.user.id}`,
    "read-all",
    {},
  );

  return Response.json({ success: true });
}
