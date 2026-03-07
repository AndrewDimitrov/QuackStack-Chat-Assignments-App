import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import Group from "@/lib/models/Group";
import { createNotification } from "@/lib/notifications";

export async function POST(request, { params }) {
  const session = await auth();
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  await connectDB();

  const user = await User.findById(session.user.id);
  const group = await Group.findById(id).populate("members.user", "_id");

  // Check already member
  const alreadyMember = group.members.some(
    (m) => m.user._id.toString() === session.user.id,
  );
  if (alreadyMember) return Response.json({ success: true });

  await Group.findByIdAndUpdate(id, {
    $addToSet: { members: { user: user._id, role: "member" } },
  });

  // Notify admins
  const admins = group.members.filter((m) => m.role === "admin");
  for (const admin of admins) {
    await createNotification({
      userId: admin.user._id,
      type: "join",
      title: `New member in ${group.name}`,
      body: `${user.name} joined the group`,
      link: `/dashboard/groups/${id}`,
    });
  }

  return Response.json({ success: true });
}
