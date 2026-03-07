import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import DirectMessage from "@/lib/models/DirectMessage";
import { pusherServer } from "@/lib/pusher";
import { createNotification } from "@/lib/notifications";
import Message from "@/lib/models/Message";

export async function GET(request, { params }) {
  const session = await auth();
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { userId } = await params;
  const { searchParams } = new URL(request.url);
  const before = searchParams.get("before");

  await connectDB();

  const query = {
    $or: [
      { sender: session.user.id, receiver: userId },
      { sender: userId, receiver: session.user.id },
    ],
  };
  if (before) query.createdAt = { $lt: new Date(before) };

  const messages = await DirectMessage.find(query)
    .sort({ createdAt: -1 })
    .limit(51)
    .populate("sender receiver", "name avatar githubUsername _id");

  const hasMore = messages.length === 51;
  if (hasMore) messages.pop();

  return Response.json({ messages: messages.reverse(), hasMore });
}

export async function POST(request, { params }) {
  const session = await auth();
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { userId } = await params;
  const { content } = await request.json();

  if (!content?.trim())
    return Response.json({ error: "Empty message" }, { status: 400 });

  await connectDB();

  const message = await DirectMessage.create({
    content: content.trim(),
    sender: session.user.id,
    receiver: userId,
  });

  const sender = await User.findById(session.user.id);
  const receiver = await User.findById(userId);

  if (receiver.blockedUsers?.includes(session.user.id)) {
    return Response.json(
      { error: "You are blocked by this user" },
      { status: 403 },
    );
  }

  if (userId !== session.user.id) {
    await createNotification({
      userId: userId,
      type: "message",
      title: sender.name,
      body: content.trim().slice(0, 60) + (content.length > 60 ? "..." : ""),
      link: `/dashboard/dm/${session.user.id}`, // изпращача — правилно
    });
  }

  const dmLink = `/dashboard/dm/${session.user.id}`;
  await pusherServer.trigger(`sidebar-${session.user.id}`, "update", {
    link: dmLink,
  });
  await pusherServer.trigger(`sidebar-${userId}`, "update", { link: dmLink });

  await message.populate("sender receiver", "name avatar githubUsername _id");

  // Pusher — trigger към двата потребителя
  const channelName = [session.user.id, userId].sort().join("-");
  await pusherServer.trigger(`dm-${channelName}`, "new-message", {
    _id: message._id,
    content: message.content,
    createdAt: message.createdAt,
    sender: message.sender,
    receiver: message.receiver,
  });

  return Response.json({ message });
}
