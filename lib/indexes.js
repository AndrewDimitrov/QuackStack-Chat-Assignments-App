import Message from "@/lib/models/Message";
import DirectMessage from "@/lib/models/DirectMessage";
import Notification from "@/lib/models/Notification";

export async function createIndexes() {
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
}
