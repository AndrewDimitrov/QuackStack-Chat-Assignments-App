import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Group from "@/lib/models/Group";
import User from "@/lib/models/User";
import { pusherServer } from "@/lib/pusher";
import { createNotification } from "@/lib/notifications";

export async function POST(request) {
  const session = await auth();
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { inviteCode } = await request.json();
  await connectDB();

  const user = await User.findById(session.user.id);

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  const group = await Group.findOne({ inviteCode }).populate(
    "members.user",
    "_id",
  );
  if (!group)
    return Response.json({ error: "Invalid invite code" }, { status: 404 });

  const alreadyMember = group.members.some(
    (m) => m.user?._id?.toString() === session.user.id,
  );
  if (alreadyMember) return Response.json({ group }, { status: 200 });

  await Group.findByIdAndUpdate(group._id, {
    $addToSet: { members: { user: user._id, role: "member" } },
  });

  await pusherServer.trigger(`sidebar-${session.user.id}`, "update", {
    link: `/dashboard/groups/${group._id}`,
  });

  const admins = group.members.filter((m) => m.role === "admin");
  for (const admin of admins) {
    await createNotification({
      userId: admin.user._id,
      type: "join",
      title: `New member in ${group.name}`,
      body: `${user.name} joined the group`,
      link: `/dashboard/groups/${group._id}`,
    });
  }

  return Response.json({ group });
}
