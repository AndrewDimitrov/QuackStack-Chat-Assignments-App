import mongoose from "mongoose";

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const MessageSchema = new mongoose.Schema(
  {
    content: { type: String, default: "" },
    image: { type: String, default: null },
    sender: { type: ObjectId, ref: "User" },
    group: { type: ObjectId, ref: "Group" },
    edited: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.models.Message ||
  mongoose.model("Message", MessageSchema);
