import mongoose from "mongoose";

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const MessageSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    sender: { type: ObjectId, ref: "User" },
    group: { type: ObjectId, ref: "Group" },
  },
  { timestamps: true },
);

export default mongoose.models.Message ||
  mongoose.model("Message", MessageSchema);
