"use strict";

import express, { Router } from "express";
import mongoose from "mongoose";
import "dotenv/config";

import { login, signup } from "./handler/auth.js";
import { editProfile, getUserData } from "./handler/user.js";
import {
  uploadAudio,
  createTranscription,
  getAllAudio,
  createAudioVectorDb,
  // createSummary,
} from "./handler/audio.js";
import { uploadPdf, createPdfVectorDb, getAllPdf } from "./handler/pdf.js";
import { chatBot, getChat } from "./handler/chat.js";

import handleSingleUploadAudio from "./middleware/uploadAudio.js";
import handleSingleUploadImage from "./middleware/uploadImage.js";
import handleSingleUploadPdf from "./middleware/uploadPdf.js";
import handleAudioConversion from "./middleware/convertAudio.js";
import handleVarifyAuth from "./middleware/auth.js";

const app = express();
app.use(express.json());
app.use(express.static("public"));

const router = Router();

// auth
router.post("/signup", signup);
router.post("/login", login);

// user
router.get("/user", handleVarifyAuth, getUserData);
router.post(
  "/user/editProfile",
  handleVarifyAuth,
  handleSingleUploadImage,
  editProfile
);

// audio
router.get("/audio", handleVarifyAuth, getAllAudio);
router.post(
  "/audio",
  handleVarifyAuth,
  handleSingleUploadAudio,
  handleAudioConversion,
  uploadAudio
);
router.post("/transcription/:audioId", handleVarifyAuth, createTranscription);
router.post("/vectordb/:audioId", handleVarifyAuth, createAudioVectorDb);
// router.post('/summary/:audioId', createSummary);

// pdf
router.get("/audio", handleVarifyAuth, getAllPdf);
router.post("/pdf", handleSingleUploadPdf, uploadPdf);
router.post("/vectordb/:pdfId", createPdfVectorDb);
// router.post('/summary/:pdfID', createSummary);

// chat
router.post("/chat/:sourceId", handleVarifyAuth, chatBot);
router.get("/chat/:sourceId", handleVarifyAuth, getChat);

const mongoString = process.env.MONGODB_ATLAS_URI || "";
mongoose.connect(mongoString);
const db = mongoose.connection;
db.on("error", (error) => {
  console.log(error);
});
db.once("connected", () => {
  console.log("Database Connected");
  app.use("/api", router);
  app.listen(3000, () => {
    console.log(`Server Started at ${3000}`);
  });
});
