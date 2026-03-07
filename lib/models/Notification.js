import mongoose from "mongoose";

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const NotificationSchema = new mongoose.Schema(
  {
    user: { type: ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: [
        "message",
        "assignment",
        "submission_approved",
        "submission_rejected",
        "join",
      ],
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    link: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.models.Notification ||
  mongoose.model("Notification", NotificationSchema);
