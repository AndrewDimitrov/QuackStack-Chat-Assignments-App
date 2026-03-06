import mongoose from "mongoose";

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const DirectMessageSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    sender: { type: ObjectId, ref: "User" },
    receiver: { type: ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export default mongoose.models.DirectMessage ||
  mongoose.model("DirectMessage", DirectMessageSchema);
