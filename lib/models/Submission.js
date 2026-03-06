import mongoose from "mongoose";

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const SubmissionSchema = new mongoose.Schema(
  {
    githubUrl: { type: String, required: true },
    pointsGiven: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    user: { type: ObjectId, ref: "User" },
    assignment: { type: ObjectId, ref: "Assignment" },
  },
  { timestamps: true },
);

export default mongoose.models.Submission ||
  mongoose.model("Submission", SubmissionSchema);
