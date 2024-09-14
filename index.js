"use strict";

import express, { Router } from "express";
import mongoose from "mongoose";
import "dotenv/config";

import { login, signup } from "./handler/auth.js";
import { editProfile, getUserData } from "./handler/user.js";
import { uploadAudio, getAllAudio } from "./handler/audio.js";
import { uploadPdf, getAllPdf } from "./handler/pdf.js";
import { chatBot, getChats } from "./handler/chat.js";
import { getAllNotes, updateNote, uploadNote } from "./handler/note.js";

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
router.get("/audio/:page", handleVarifyAuth, getAllAudio);
router.post(
  "/audio",
  handleVarifyAuth,
  handleSingleUploadAudio,
  handleAudioConversion,
  uploadAudio
);

// pdf
router.get("/pdf/:page", handleVarifyAuth, getAllPdf);
router.post("/pdf", handleVarifyAuth, handleSingleUploadPdf, uploadPdf);

// chat
router.get("/chat/:sourceId", handleVarifyAuth, getChats);
router.post("/chat/:sourceId", handleVarifyAuth, chatBot);

// chat
router.get("/note/:page", handleVarifyAuth, getAllNotes);
router.post("/note", handleVarifyAuth, uploadNote);
router.patch("/note", handleVarifyAuth, updateNote);

const mongoString = process.env.MONGODB_ATLAS_URI || "";
mongoose.connect(mongoString);
const db = mongoose.connection;
db.on("error", (error) => {
  console.log(error);
});
db.once("connected", () => {
  console.log("Database Connected");
  app.use("/api", router);
  app.listen(3000, "192.168.100.6", () => {
    console.log(`Server Started at ${3000}`);
  });
});
