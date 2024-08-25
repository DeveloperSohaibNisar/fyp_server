import mongoose from "mongoose";

const recordingSchema = new mongoose.Schema({
  name: {
    required: true,
    type: String,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  uploadDate: {
    type: Date,
    default: Date.now(),
  },
  audioLength: {
    required: true,
    type: Number,
  },
  audioUrl: {
    required: true,
    type: String,
  },
  isTranscriptionCreated: {
    type: Boolean,
    default: false,
  },
  isVectorDatabaseCreated: {
    type: Boolean,
    default: false,
  },
  isSummaryCreated: {
    type: Boolean,
    default: false,
  },
  transcriptionData: {
    text: {
      type: String,
      default: null,
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
  summaryText: {
    type: String,
    default: null,
  },
});

export default mongoose.model("recording", recordingSchema);
