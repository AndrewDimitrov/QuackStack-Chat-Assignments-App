import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";

export async function GET(request, { params }) {
  const session = await auth();
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { userId } = await params;

  await connectDB();

  const user = await User.findById(userId).select(
    "name avatar githubUsername _id",
  );

  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  return Response.json({ user });
}
