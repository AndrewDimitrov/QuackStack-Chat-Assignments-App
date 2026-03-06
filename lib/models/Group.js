import mongoose from "mongoose";

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const GroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    members: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: { type: String, default: "member" },
      },
    ],
    icon: { type: String, default: null },
  },
  { timestamps: true },
);

export default mongoose.models.Group || mongoose.model("Group", GroupSchema);
