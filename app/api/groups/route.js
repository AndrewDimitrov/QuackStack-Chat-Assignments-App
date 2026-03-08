import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import Group from "@/lib/models/Group";
import Notification from "@/lib/models/Notification";

export async function GET() {
  const session = await auth();
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const user = await User.findOne({ email: session.user.email });

  const groups = await Group.find({ "members.user": user._id }).select(
    "name icon members _id",
  );

  const groupsWithUnread = await Promise.all(
    groups.map(async (group) => {
      const unread = await Notification.countDocuments({
        user: user._id,
        link: `/dashboard/groups/${group._id}`,
        read: false,
      });
      return { ...group.toObject(), unreadCount: unread };
    }),
  );

  return Response.json({ groups: groupsWithUnread });
}

export async function POST(request) {
  const session = await auth();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description, icon } = await request.json();

  await connectDB();

  const user = await User.findOne({ email: session.user.email });

  const group = await Group.create({
    name,
    description,
    icon: icon || null, // ← добави
    createdBy: session.user.id,
    members: [{ user: user._id, role: "admin" }],
  });

  return Response.json({ group });
}
