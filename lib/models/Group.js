import mongoose from "mongoose";

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const GroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    members: [
      {
        user: { type: ObjectId, ref: "User" }, // беше userId
        role: { type: String, default: "member" },
      },
    ],
    icon: { type: String, default: null },
    lastMessage: { type: String, default: null },
    lastMessageAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export default mongoose.models.Group || mongoose.model("Group", GroupSchema);
