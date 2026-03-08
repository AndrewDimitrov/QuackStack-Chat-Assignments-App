import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Group from "@/lib/models/Group";
import CustomWork from "@/lib/models/CustomWork";
import User from "@/lib/models/User";
import { createNotification } from "@/lib/notifications";

// GET — list all custom work for group (admin) or own work (member)
export async function GET(request, { params }) {
  const session = await auth();
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectDB();

  const group = await Group.findById(id);
  const member = group.members.find(
    (m) => m.user.toString() === session.user.id,
  );
  const isAdmin = member?.role === "admin";

  const query = isAdmin ? { group: id } : { group: id, user: session.user.id };
  const work = await CustomWork.find(query)
    .populate("user", "name avatar githubUsername _id")
    .sort({ createdAt: -1 });

  return Response.json({ work });
}

// POST — member submits custom work
export async function POST(request, { params }) {
  const session = await auth();
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { title, description, githubUrl, externalUrl, requestedPoints } =
    await request.json();

  if (!title?.trim())
    return Response.json({ error: "Title is required" }, { status: 400 });

  await connectDB();

  const user = await User.findById(session.user.id);

  // Validate GitHub URL if provided
  if (githubUrl?.trim()) {
    const expectedPrefix = `https://github.com/${user.githubUsername}/`;
    if (!githubUrl.startsWith(expectedPrefix)) {
      return Response.json(
        {
          error: `URL must be from your GitHub profile (github.com/${user.githubUsername}/...)`,
        },
        { status: 400 },
      );
    }
  }

  const work = await CustomWork.create({
    title: title.trim(),
    description: description?.trim() || "",
    githubUrl: githubUrl?.trim() || "",
    externalUrl: externalUrl?.trim() || "",
    requestedPoints: requestedPoints ?? undefined,
    user: session.user.id,
    group: id,
  });

  await work.populate("user", "name avatar githubUsername _id");

  // Notify admins
  const group = await Group.findById(id).populate("members.user", "_id");
  if (!group)
    return Response.json({ error: "Group not found" }, { status: 404 });
  const admins = group.members.filter((m) => m.role === "admin");

  for (const admin of admins) {
    await createNotification({
      userId: admin.user._id,
      type: "assignment",
      title: `New work submission in ${group.name}`,
      body: `${user.name} shared "${title.trim()}"`,
      link: `/dashboard/groups/${id}?tab=assignments&subtab=work`,
      sidebar: false,
    });
  }

  return Response.json({ work });
}

// PATCH — admin reviews custom work
export async function PATCH(request, { params }) {
  const session = await auth();
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { workId, status, points } = await request.json();

  await connectDB();

  const group = await Group.findById(id);
  const member = group.members.find(
    (m) => m.user.toString() === session.user.id,
  );
  if (!member || member.role !== "admin") {
    return Response.json(
      { error: "Only admins can review submissions" },
      { status: 403 },
    );
  }

  const work = await CustomWork.findById(workId);
  if (!work) return Response.json({ error: "Not found" }, { status: 404 });

  work.status = status;
  if (status === "approved") {
    const pts = points ? Number(points) : 10;
    work.pointsGiven = pts;
    await User.findByIdAndUpdate(work.user, { $inc: { points: pts } });
  }

  await work.save();
  await work.populate("user", "name avatar githubUsername _id");

  // Notify the user
  await createNotification({
    userId: work.user._id,
    type: status === "approved" ? "submission_approved" : "submission_rejected",
    title:
      status === "approved"
        ? `Work approved! +${work.pointsGiven} pts`
        : "Work submission rejected",
    body: `"${work.title}" in ${group.name}`,
    link: `/dashboard/groups/${id}?tab=assignments&subtab=work`,
  });

  return Response.json({ work });
}

// DELETE — member deletes own pending work
export async function DELETE(request, { params }) {
  const session = await auth();
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { workId } = await request.json();
  await connectDB();

  const work = await CustomWork.findById(workId);
  if (!work) return Response.json({ error: "Not found" }, { status: 404 });

  if (work.user.toString() !== session.user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  if (work.status !== "pending") {
    return Response.json(
      { error: "Cannot delete reviewed submission" },
      { status: 400 },
    );
  }

  await work.deleteOne();
  return Response.json({ success: true });
}
