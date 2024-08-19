import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  query: {
    required: true,
    type: String,
  },
  reply: {
    required: true,
    type: String,
  },
  uploadDate: {
    type: Date,
    default: Date.now(),
  },
  sourceId: {
    required: true,
    type: mongoose.Schema.Types.ObjectId,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
});

export default mongoose.model("chat", chatSchema);
