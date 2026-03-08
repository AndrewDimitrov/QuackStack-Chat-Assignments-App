import mongoose from "mongoose";

const CustomWorkSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    githubUrl: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    pointsGiven: { type: Number, default: 0 },
    externalUrl: { type: String, default: "" },
    requestedPoints: { type: Number, default: undefined },
  },
  { timestamps: true },
);

export default mongoose.models.CustomWork ||
  mongoose.model("CustomWork", CustomWorkSchema);
