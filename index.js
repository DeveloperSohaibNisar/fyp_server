"use strict";

import express, { Router } from "express";
import mongoose from "mongoose";
import "dotenv/config";

import {
    uploadAudio,
    createTranscription,
    // createSummary, getAllAudio
} from "./handler/audio.js";
import { login, signup } from "./handler/auth.js";
import { editProfile } from "./handler/user.js";
import { create_llm } from "./util/llm_chains.js";
import { uploadPdf, createVectorDb, chatbot } from "./handler/pdf.js";

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
router.post("/user/editProfile", handleVarifyAuth, handleSingleUploadImage, editProfile);

// pdf
router.post("/pdf", handleSingleUploadPdf, uploadPdf);
router.post("/vectordb/:pdfId", createVectorDb);
router.post("/chat/:pdfID/:query", chatbot);

// audio
router.post("/audio", handleSingleUploadAudio, handleAudioConversion, uploadAudio);
router.post("/transcription/:audioId", createTranscription);
// router.post('/summary/:audioId', createSummary);
// router.get('/audio/:page', getAllAudio);

// llm
router.get("/llm", async (req, res) => {
    console.log("helooooooooooooooooooo");
    await create_llm();
    res.send("done");
});

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
