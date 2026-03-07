import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Group from "@/lib/models/Group";

export async function GET(request, { params }) {
  const session = await auth();
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  await connectDB();

  try {
    const group = await Group.findById(id).populate(
      "members.user",
      "name avatar githubUsername _id",
    );

    if (!group)
      return Response.json({ error: "Group not found" }, { status: 404 });

    const isMember = group.members.some(
      (m) => m.user?._id?.toString() === session.user.id,
    );

    return Response.json({ group, isMember });
  } catch (error) {
    console.error("Group GET error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
