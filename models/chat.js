import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    query: {
      required: true,
      type: String,
    },
    reply: {
      required: true,
      type: String,
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
  },
  { timestamps: true }
);

export default mongoose.model("chat", chatSchema);
