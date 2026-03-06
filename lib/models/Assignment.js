import mongoose from "mongoose";

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const AssignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    points: { type: Number, default: 10 },
    dueDate: Date,
    group: { type: ObjectId, ref: "Group" },
    createdBy: { type: ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export default mongoose.models.Assignment ||
  mongoose.model("Assignment", AssignmentSchema);
