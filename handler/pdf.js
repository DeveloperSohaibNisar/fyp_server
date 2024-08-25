import PdfSchema from "../models/pdf.js";
import pdf from "pdf-parse";
import { createVectorDb } from "../util/vector.js";

export const uploadPdf = async (req, res) => {
  try {
    const data = await pdf(req.file.path);
    const newPdf = new PdfSchema({
      name: req.file.originalname,
      numpages: parseInt(data.numpages),
      pdfUrl: `http://localhost:3000/uploads/pdfs/${req.file.filename}`,
    });
    const snapshot = await newPdf.save();
    res.status(200).json(snapshot);
  } catch (err) {
    if (err.message) {
      return res.status(500).json({ message: err.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const createPdfVectorDb = async (req, res) => {
  try {
    if (!req.params.pdfId) throw new Error(`Invalid Request`);

    let pdfSnap = await PdfSchema.findById(req.params.pdfId);
    if (!pdfSnap) {
      return res
        .status(404)
        .json({ message: `pdf with id ${req.params.audioId} not found` });
    }

    let dataBuffer = Buffer.from(
      await fetch(pdfSnap.pdfUrl).then((x) => x.arrayBuffer())
    );

    const data = await pdf(dataBuffer);

    createVectorDb(req.params.pdfId, data.text);

    pdfSnap.isVectorDatabaseCreated = true;
    const updatedPdf = await pdfSnap.save();
    return res.status(200).json(updatedPdf);
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

    const result = await PdfSchema.find()
      .limit(perPage)
      .skip(perPage * page)
      .sort("-uploadDate");
    return res.status(200).json(result);
  } catch (err) {
    if (err.message) {
      return res.status(500).json({ message: err.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};
