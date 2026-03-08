import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Group from "@/lib/models/Group";
import Assignment from "@/lib/models/Assignment";
import Submission from "@/lib/models/Submission";
import User from "@/lib/models/User";
import { createNotification } from "@/lib/notifications";

export async function GET(request, { params }) {
  const session = await auth();
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { assignmentId } = await params;
  await connectDB();

  const submissions = await Submission.find({
    assignment: assignmentId,
  }).populate("user", "name avatar githubUsername _id");

  return Response.json({ submissions });
}

export async function POST(request, { params }) {
  const session = await auth();
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id, assignmentId } = await params;
  const { githubUrl, externalUrl, note, requestedPoints } =
    await request.json();

  if (!githubUrl?.trim() && !note?.trim()) {
    return Response.json(
      { error: "Please provide a GitHub URL or a note" },
      { status: 400 },
    );
  }

  await connectDB();

  const user = await User.findById(session.user.id);

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

  const existing = await Submission.findOne({
    assignment: assignmentId,
    user: session.user.id,
  });
  if (existing)
    return Response.json({ error: "Already submitted" }, { status: 400 });

  const submission = await Submission.create({
    githubUrl: githubUrl?.trim() || "",
    externalUrl: externalUrl?.trim() || "",
    note: note?.trim() || "",
    requestedPoints: requestedPoints || null,
    user: session.user.id,
    assignment: assignmentId,
  });

  await submission.populate("user", "name avatar githubUsername _id");

  const group = await Group.findById(id).populate("members.user", "_id");
  const assignment = await Assignment.findById(assignmentId);
  const admins = group.members.filter((m) => m.role === "admin");

  for (const admin of admins) {
    await createNotification({
      userId: admin.user._id,
      type: "assignment",
      title: `New submission in ${group.name}`,
      body: `${user.name} submitted "${assignment.title}"`,
      link: `/dashboard/groups/${id}?tab=assignments&assignmentId=${assignmentId}`,
    });
  }

  return Response.json({ submission });
}

export async function PATCH(request, { params }) {
  const session = await auth();
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id, assignmentId } = await params;
  const { submissionId, status, points } = await request.json();

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

  const assignment = await Assignment.findById(assignmentId);
  const submission = await Submission.findById(submissionId);
  if (!submission)
    return Response.json({ error: "Submission not found" }, { status: 404 });

  submission.status = status;
  if (status === "approved") {
    const pts = points ? Number(points) : assignment.points;
    submission.pointsGiven = pts;
    await User.findByIdAndUpdate(submission.user, { $inc: { points: pts } });
  }

  await submission.save();
  await submission.populate("user", "name avatar githubUsername _id");

  await createNotification({
    userId: submission.user._id,
    type: status === "approved" ? "submission_approved" : "submission_rejected",
    title:
      status === "approved"
        ? `Submission approved! +${submission.pointsGiven} pts`
        : "Submission rejected",
    body: `"${assignment.title}" in ${group.name}`,
    link: `/dashboard/groups/${id}?tab=assignments&assignmentId=${assignmentId}`,
  });

  return Response.json({ submission });
}

export async function DELETE(request, { params }) {
  const session = await auth();
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { assignmentId } = await params;
  const { submissionId } = await request.json();

  await connectDB();

  const submission = await Submission.findById(submissionId);
  if (!submission)
    return Response.json({ error: "Not found" }, { status: 404 });

  if (submission.user.toString() !== session.user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  if (submission.status !== "pending") {
    return Response.json(
      { error: "Cannot delete reviewed submission" },
      { status: 400 },
    );
  }

  await submission.deleteOne();
  return Response.json({ success: true });
}

export async function PUT(request, { params }) {
  const session = await auth();
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id, assignmentId } = await params;
  const { submissionId, githubUrl } = await request.json();

  await connectDB();

  const submission = await Submission.findById(submissionId);
  if (!submission)
    return Response.json({ error: "Not found" }, { status: 404 });

  if (submission.user.toString() !== session.user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  if (submission.status !== "pending") {
    return Response.json(
      { error: "Cannot edit reviewed submission" },
      { status: 400 },
    );
  }

  const user = await User.findById(session.user.id);
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

  submission.githubUrl = githubUrl;
  await submission.save();
  await submission.populate("user", "name avatar githubUsername _id");

  return Response.json({ submission });
}
