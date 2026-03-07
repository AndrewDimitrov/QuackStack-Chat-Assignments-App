import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Group from "@/lib/models/Group";

export async function PATCH(request, { params }) {
  const session = await auth();
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { userId, role } = await request.json();

  await connectDB();

  // Check if current user is admin
  const group = await Group.findById(id);
  const currentMember = group.members.find(
    (m) => m.user.toString() === session.user.id,
  );
  if (!currentMember || currentMember.role !== "admin") {
    return Response.json(
      { error: "Only admins can change roles" },
      { status: 403 },
    );
  }

  await Group.findOneAndUpdate(
    { _id: id, "members.user": userId },
    { $set: { "members.$.role": role } },
  );

  const updated = await Group.findById(id).populate(
    "members.user",
    "name avatar githubUsername _id",
  );
  return Response.json({ group: updated });
}

export async function DELETE(request, { params }) {
  const session = await auth();
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { userId } = await request.json();

  await connectDB();

  const group = await Group.findById(id);
  const currentMember = group.members.find(
    (m) => m.user.toString() === session.user.id,
  );

  // Can kick if admin, or leaving yourself
  if (userId !== session.user.id) {
    if (!currentMember || currentMember.role !== "admin") {
      return Response.json(
        { error: "Only admins can kick members" },
        { status: 403 },
      );
    }
  }

  await Group.findByIdAndUpdate(id, {
    $pull: { members: { user: userId } },
  });

  return Response.json({ success: true });
}
