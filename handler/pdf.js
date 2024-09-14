import PdfSchema from "../models/pdf.js";
import pdf from "pdf-parse";
import createVectorDb from "../util/vector.js";
import createSummary from "../util/summaryPdf.js";

export const uploadPdf = async (req, res) => {
  try {
    if (!req.body.name) throw new Error(`Name must be provided`);

    const pdfData = await pdf(req.file.path);
    const summaryData = await createSummary(pdfData.text);

    const newPdf = new PdfSchema({
      name: req.body.name,
      numpages: parseInt(pdfData.numpages),
      pdfUrl: `http://192.168.100.6:3000/uploads/pdfs/${req.file.filename}`,
      summaryData,
      userId: req.userData._id,
    });
    const snapshot = await newPdf.save();
    createVectorDb(snapshot._id, pdfData.text);
    res.status(200).json(newPdf);
  } catch (err) {
    if (err.message) {
      return res.status(500).json({ message: err.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllPdf = async (req, res) => {
  try {
    const perPage = 10;

    if (!req.params.page) throw new Error(`Invalid Request`);
    const page = req.params.page;

    const result = await PdfSchema.find({ userId: req.userData._id })
      .limit(perPage)
      .skip(perPage * page)
      .sort({ createdAt: -1 });

    return res.status(200).json(result);
  } catch (err) {
    if (err.message) {
      return res.status(500).json({ message: err.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};
