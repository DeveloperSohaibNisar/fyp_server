import mongoose from "mongoose";

const pdfSchema = new mongoose.Schema(
  {
    name: {
      required: true,
      type: String,
    },
    numpages: {
      required: true,
      type: Number,
    },
    pdfUrl: {
      required: true,
      type: String,
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
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("pdf", pdfSchema);
