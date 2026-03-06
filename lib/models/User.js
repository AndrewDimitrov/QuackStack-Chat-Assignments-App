import mongoose from "mongoose";

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    githubUsername: String,
    githubId: String,
    avatar: String,
    points: { type: Number, default: 0 },
    notifications: [
      {
        type: String,
        message: String,
        read: Boolean,
        createdAt: Date,
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
