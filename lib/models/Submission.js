import mongoose from "mongoose";

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const SubmissionSchema = new mongoose.Schema(
  {
    githubUrl: { type: String, default: "" },
    pointsGiven: { type: Number, default: 0 },
    requestedPoints: { type: Number, default: null },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    user: { type: ObjectId, ref: "User" },
    assignment: { type: ObjectId, ref: "Assignment" },
    note: { type: String, default: "" },
    externalUrl: { type: String, default: "" },
  },
  { timestamps: true },
);

export default mongoose.models.Submission ||
  mongoose.model("Submission", SubmissionSchema);
