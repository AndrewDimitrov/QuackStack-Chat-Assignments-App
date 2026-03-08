import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import DirectMessage from "@/lib/models/DirectMessage";
import Notification from "@/lib/models/Notification";

export async function GET() {
  const session = await auth();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const user = await User.findOne({ email: session.user.email });

  // Find all messages involving this user
  const messages = await DirectMessage.find({
    $or: [{ sender: user._id }, { receiver: user._id }],
  })
    .sort({ createdAt: -1 })
    .populate("sender receiver", "name avatar githubUsername _id");

  // Get unique conversations
  const seen = new Set();
  const conversations = [];

  for (const msg of messages) {
    const other =
      msg.sender._id.toString() === user._id.toString()
        ? msg.receiver
        : msg.sender;

    if (!seen.has(other._id.toString())) {
      seen.add(other._id.toString());

      const unread = await Notification.countDocuments({
        user: session.user.id,
        link: `/dashboard/dm/${other._id.toString()}`,
        read: false,
      });

      console.log("unread for", other._id.toString(), ":", unread);
      console.log("looking for link containing:", other._id.toString());

      conversations.push({
        userId: other._id,
        name: other.name,
        avatar: other.avatar,
        githubUsername: other.githubUsername,
        lastMessage: msg.content,
        lastMessageAt: msg.createdAt,
        unreadCount: unread,
      });
    }
  }

  return Response.json({ conversations });
}
