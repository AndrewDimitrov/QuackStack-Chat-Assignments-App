import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import Group from "@/lib/models/Group";
import Submission from "@/lib/models/Submission";
import Assignment from "@/lib/models/Assignment";
import CustomWork from "@/lib/models/CustomWork";

export async function GET(request, { params }) {
  const { username } = await params;

  await connectDB();

  const user = await User.findOne({
    githubUsername: { $regex: new RegExp(`^${username}$`, "i") },
  });

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  const groups = await Group.find({ "members.user": user._id }).select(
    "name icon _id",
  );

  const submissions = await Submission.find({ user: user._id })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate({
      path: "assignment",
      select: "title points group",
      populate: { path: "group", select: "name" },
    });

  const customWork = await CustomWork.find({ user: user._id })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate("group", "name _id");

  return Response.json({
    user: {
      _id: user._id,
      name: user.name,
      avatar: user.avatar,
      bio: user.bio,
      githubUsername: user.githubUsername,
      points: user.points,
      createdAt: user.createdAt,
    },
    groups: groups.map((g) => ({ id: g._id, name: g.name, icon: g.icon })),
    submissions: submissions.map((s) => ({
      id: s._id,
      assignmentTitle: s.assignment?.title,
      groupName: s.assignment?.group?.name,
      groupId: s.assignment?.group?._id,
      status: s.status,
      pointsGiven: s.pointsGiven,
      createdAt: s.createdAt,
    })),
    customWork: customWork.map((w) => ({
      id: w._id,
      title: w.title,
      description: w.description,
      githubUrl: w.githubUrl,
      externalUrl: w.externalUrl,
      groupName: w.group?.name,
      groupId: w.group?._id,
      status: w.status,
      pointsGiven: w.pointsGiven,
      createdAt: w.createdAt,
    })),
  });
}
