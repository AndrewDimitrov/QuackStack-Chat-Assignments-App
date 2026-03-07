import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";

export async function PATCH(request) {
  const session = await auth();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { displayName, bio } = await request.json();

  await connectDB();

  await User.findOneAndUpdate(
    { email: session.user.email },
    {
      name: displayName,
      bio,
    },
    { new: true },
  );

  return Response.json({ success: true });
}
