import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Group from "@/lib/models/Group";
import Assignment from "@/lib/models/Assignment";
import { createNotification } from "@/lib/notifications";

export async function GET(request, { params }) {
  const session = await auth();
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  await connectDB();

  const assignments = await Assignment.find({ group: id })
    .sort({ createdAt: -1 })
    .populate("createdBy", "name avatar githubUsername");

  return Response.json({ assignments });
}

export async function POST(request, { params }) {
  const session = await auth();
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  await connectDB();

  const group = await Group.findById(id).populate("members.user", "_id");
  const member = group.members.find(
    (m) => m.user._id.toString() === session.user.id,
  );
  if (!member || member.role !== "admin") {
    return Response.json(
      { error: "Only admins can create assignments" },
      { status: 403 },
    );
  }

  const { title, description, points, dueDate } = await request.json();

  const assignment = await Assignment.create({
    title,
    description,
    points: points || 10,
    dueDate: dueDate || null,
    group: id,
    createdBy: session.user.id,
  });

  await assignment.populate("createdBy", "name avatar githubUsername");

  // Notify all members except admin
  const otherMembers = group.members.filter(
    (m) => m.user._id.toString() !== session.user.id,
  );

  for (const m of otherMembers) {
    await createNotification({
      userId: m.user._id,
      type: "assignment",
      title: `New assignment in ${group.name}`,
      body: `${title}${points ? ` · ${points} pts` : ""}`,
      link: `/dashboard/groups/${id}?tab=assignments&assignmentId=${assignment._id}`,
    });
  }

  return Response.json({ assignment });
}

export async function DELETE(request, { params }) {
  const session = await auth();
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { assignmentId } = await request.json();

  await connectDB();

  const group = await Group.findById(id).populate("members.user", "_id");
  const member = group.members.find(
    (m) => m.user._id.toString() === session.user.id,
  );
  if (!member || member.role !== "admin")
    return Response.json(
      { error: "Only admins can delete assignments" },
      { status: 403 },
    );

  await Assignment.findByIdAndDelete(assignmentId);

  return Response.json({ success: true });
}
