import mongoose from "mongoose";

const noteSchema = mongoose.Schema(
  {
    name: {
      required: true,
      type: String,
    },
    linesCount: {
      type: Number,
      default: 0,
    },
    content: {
      type: Array,
      default: [{ insert: "\n" }],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("note", noteSchema);
