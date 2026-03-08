import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Group from "@/lib/models/Group";
import Submission from "@/lib/models/Submission";
import CustomWork from "@/lib/models/CustomWork";

export async function GET(request, { params }) {
  const session = await auth();
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  await connectDB();

  const group = await Group.findById(id).populate(
    "members.user",
    "name avatar githubUsername _id",
  );
  if (!group)
    return Response.json({ error: "Group not found" }, { status: 404 });

  // Get approved submissions
  const submissions = await Submission.find({ status: "approved" }).populate({
    path: "assignment",
    match: { group: id },
    select: "_id group",
  });
  const groupSubmissions = submissions.filter((s) => s.assignment !== null);

  // Get approved custom work for this group
  const customWork = await CustomWork.find({ group: id, status: "approved" });

  // Sum points per user
  const pointsMap = {};
  for (const sub of groupSubmissions) {
    const userId = sub.user.toString();
    pointsMap[userId] = (pointsMap[userId] || 0) + (sub.pointsGiven || 0);
  }
  for (const work of customWork) {
    const userId = work.user.toString();
    pointsMap[userId] = (pointsMap[userId] || 0) + (work.pointsGiven || 0);
  }

  const leaderboard = group.members
    .map((m) => ({
      _id: m.user._id,
      name: m.user.name,
      avatar: m.user.avatar,
      githubUsername: m.user.githubUsername,
      points: pointsMap[m.user._id.toString()] || 0,
      isMe: m.user._id.toString() === session.user.id,
    }))
    .sort((a, b) => b.points - a.points);

  return Response.json({ leaderboard });
}
