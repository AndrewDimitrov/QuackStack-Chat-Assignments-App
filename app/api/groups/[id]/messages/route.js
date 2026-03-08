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
  const { content, image } = await request.json();

  if (!content?.trim() && !image) {
    return Response.json({ error: "Empty message" }, { status: 400 });
  }

  await connectDB();

  const user = await User.findById(session.user.id);
  const group = await Group.findOne({
    _id: id,
    "members.user": user._id,
  }).populate("members.user", "_id");
  if (!group) return Response.json({ error: "Not a member" }, { status: 403 });

  const message = await Message.create({
    content: content?.trim() || "",
    image: image || null,
    sender: user._id,
    group: id,
  });

  await message.populate("sender", "name avatar githubUsername _id");

  await Group.findByIdAndUpdate(id, {
    lastMessage: image ? "📷 Image" : content.trim(),
    lastMessageAt: new Date(),
  });

  await pusherServer.trigger(`group-${id}`, "new-message", {
    _id: message._id,
    content: message.content,
    image: message.image,
    createdAt: message.createdAt,
    sender: {
      _id: user._id,
      name: user.name,
      avatar: user.avatar,
      githubUsername: user.githubUsername,
    },
  });

  const otherMembers = group.members.filter(
    (m) => m.user._id.toString() !== session.user.id,
  );
  for (const member of otherMembers) {
    await createNotification({
      userId: member.user._id,
      type: "message",
      title: group.name,
      body: image
        ? `${user.name}: 📷 Image`
        : `${user.name}: ${content.trim().slice(0, 60)}${content.length > 60 ? "..." : ""}`,
      link: `/dashboard/groups/${id}`,
    });
  }

  await pusherServer.trigger(`sidebar-${session.user.id}`, "update", {
    link: `/dashboard/groups/${id}`,
  });

  return Response.json({ message });
}

export async function PATCH(request, { params }) {
  const session = await auth();
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { messageId, content } = await request.json();

  if (!content?.trim())
    return Response.json({ error: "Empty message" }, { status: 400 });

  await connectDB();

  const message = await Message.findById(messageId);
  if (!message) return Response.json({ error: "Not found" }, { status: 404 });
  if (message.sender.toString() !== session.user.id)
    return Response.json({ error: "Unauthorized" }, { status: 403 });

  message.content = content.trim();
  message.edited = true;
  await message.save();

  await pusherServer.trigger(`group-${id}`, "edit-message", {
    _id: messageId,
    content: message.content,
    edited: true,
  });

  return Response.json({ message });
}

export async function DELETE(request, { params }) {
  const session = await auth();
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { messageId } = await request.json();

  await connectDB();

  const user = await User.findById(session.user.id);
  const group = await Group.findById(id);
  const message = await Message.findById(messageId);

  if (!message) return Response.json({ error: "Not found" }, { status: 404 });

  const isOwner = message.sender.toString() === session.user.id;
  const isAdmin = group.members.find(
    (m) => m.user.toString() === session.user.id && m.role === "admin",
  );

  if (!isOwner && !isAdmin)
    return Response.json({ error: "Unauthorized" }, { status: 403 });

  await Message.findByIdAndDelete(messageId);

  await pusherServer.trigger(`group-${id}`, "delete-message", {
    _id: messageId,
  });

  return Response.json({ success: true });
}
