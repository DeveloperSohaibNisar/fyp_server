import mongoose from "mongoose";

const recordingSchema = new mongoose.Schema(
  {
    name: {
      required: true,
      type: String,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    audioLength: {
      required: true,
      type: Number,
    },
    audioUrl: {
      required: true,
      type: String,
    },
    transcriptionData: {
      text: {
        type: String,
        required: true,
      },
      chunks: [
        {
          text: {
            type: String,
            required: true,
          },
          timestamp: [Number],
        },
      ],
    },
    summaryData: {
      title: { type: String, required: true },
      summary: { type: String, required: true },
      additionalInfo: {
        mainPoints: [String],
        actionItems: [String],
        followUpQuestions: [String],
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("recording", recordingSchema);
