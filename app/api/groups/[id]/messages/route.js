import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import Group from "@/lib/models/Group";
import Message from "@/lib/models/Message";
import { pusherServer } from "@/lib/pusher";
import { createNotification } from "@/lib/notifications";

export async function GET(request, { params }) {
  const session = await auth();
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const before = searchParams.get("before");

  await connectDB();

  const query = { group: id };
  if (before) query.createdAt = { $lt: new Date(before) };

  const messages = await Message.find(query)
    .sort({ createdAt: -1 })
    .limit(51)
    .populate("sender", "name avatar githubUsername _id");

  const hasMore = messages.length === 51;
  if (hasMore) messages.pop();

  return Response.json({ messages: messages.reverse(), hasMore });
}

export async function POST(request, { params }) {
  const session = await auth();
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { content } = await request.json();

  if (!content?.trim())
    return Response.json({ error: "Empty message" }, { status: 400 });

  await connectDB();

  const user = await User.findById(session.user.id);

  const group = await Group.findOne({
    _id: id,
    "members.user": user._id,
  }).populate("members.user", "_id");
  if (!group) return Response.json({ error: "Not a member" }, { status: 403 });

  const message = await Message.create({
    content: content.trim(),
    sender: user._id,
    group: id,
  });

  await message.populate("sender", "name avatar githubUsername _id");

  // Update group lastMessage
  await Group.findByIdAndUpdate(id, {
    lastMessage: content.trim(),
    lastMessageAt: new Date(),
  });

  // Pusher real-time message
  await pusherServer.trigger(`group-${id}`, "new-message", {
    _id: message._id,
    content: message.content,
    createdAt: message.createdAt,
    sender: {
      _id: user._id,
      name: user.name,
      avatar: user.avatar,
      githubUsername: user.githubUsername,
    },
  });

  // Notify all members except sender
  const otherMembers = group.members.filter(
    (m) => m.user._id.toString() !== session.user.id,
  );

  for (const member of otherMembers) {
    await createNotification({
      userId: member.user._id,
      type: "message",
      title: group.name,
      body: `${user.name}: ${content.trim().slice(0, 60)}${content.length > 60 ? "..." : ""}`,
      link: `/dashboard/groups/${id}`,
    });
  }

  return Response.json({ message });
}
