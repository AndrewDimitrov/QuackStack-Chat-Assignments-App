import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import Message from "@/lib/models/Message";
import DirectMessage from "@/lib/models/DirectMessage";
import Submission from "@/lib/models/Submission";
import Group from "@/lib/models/Group";

export async function DELETE() {
  const session = await auth();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const user = await User.findOne({ email: session.user.email });

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  const userId = user._id;

  // Delete all messages sent by user
  await Message.deleteMany({ sender: userId });

  // Delete all direct messages sent or received by user
  await DirectMessage.deleteMany({
    $or: [{ sender: userId }, { receiver: userId }],
  });

  // Delete all submissions by user
  await Submission.deleteMany({ user: userId });

  // Remove user from all groups they are a member of
  await Group.updateMany(
    { "members.user": userId },
    { $pull: { members: { user: userId } } },
  );

  // Finally delete the user
  await User.findByIdAndDelete(userId);

  return Response.json({ success: true });
}
