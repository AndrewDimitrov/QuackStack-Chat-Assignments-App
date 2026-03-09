import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Group from "@/lib/models/Group";
import { pusherServer } from "@/lib/pusher";

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

export async function PATCH(request, { params }) {
  const session = await auth();
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { name, description, icon } = await request.json();

  await connectDB();

  const group = await Group.findById(id);
  if (!group) return Response.json({ error: "Not found" }, { status: 404 });

  const member = group.members.find(
    (m) => m.user.toString() === session.user.id,
  );
  if (!member || member.role !== "admin")
    return Response.json({ error: "Unauthorized" }, { status: 403 });

  group.name = name || group.name;
  group.description = description ?? group.description;
  group.icon = icon ?? group.icon;
  await group.save();

  await Promise.all(
    group.members.map((member) =>
      pusherServer.trigger(`sidebar-${member.user.toString()}`, "update", {
        link: `/dashboard/groups/${group._id}`,
      }),
    ),
  );

  return Response.json({ group });
}
