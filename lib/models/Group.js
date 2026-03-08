import mongoose from "mongoose";
import { randomBytes } from "crypto";

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const GroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    members: [
      {
        user: { type: ObjectId, ref: "User" },
        role: { type: String, default: "member" },
      },
    ],
    icon: { type: String, default: null },
    lastMessage: { type: String, default: null },
    lastMessageAt: { type: Date, default: null },
    inviteCode: {
      type: String,
      unique: true,
      default: () => randomBytes(6).toString("hex"),
    },
  },
  { timestamps: true },
);

export default mongoose.models.Group || mongoose.model("Group", GroupSchema);
