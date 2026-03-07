import mongoose from "mongoose";
import Message from "@/lib/models/Message";
import DirectMessage from "@/lib/models/DirectMessage";
import Notification from "@/lib/models/Notification";

const MONGODB_URI = process.env.DATABASE_URL;

if (!MONGODB_URI) {
  throw new Error("Please define the DATABASE_URL environment variable");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function createIndexes() {
  try {
    await Message.collection.createIndex({ group: 1, createdAt: -1 });
    await DirectMessage.collection.createIndex({
      sender: 1,
      receiver: 1,
      createdAt: -1,
    });
    await Notification.collection.createIndex({
      user: 1,
      read: 1,
      createdAt: -1,
    });
  } catch (err) {
    console.error("Index creation error:", err);
  }
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then(async (conn) => {
      await createIndexes();
      return conn;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;
