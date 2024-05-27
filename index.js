'use strict'

import { Router } from 'express';
import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config';

import { uploadAudio, createTranscription, createSummary, getAllAudio } from "./handler/audio.js";
import handleSingleUploadFile from './utils/upload.js';

const app = express();
app.use(express.json());
app.use(express.static('public'))

const router = Router();

router.get('/hello', (req, res) => {
    res.send('Hello World!')
})
router.post('/audio', handleSingleUploadFile, uploadAudio);
router.post('/transcription/:audioId', createTranscription);
router.post('/summary/:audioId', createSummary);
router.get('/audio/:page', getAllAudio);

const mongoString = process.env.ATLAS_URI || ""
mongoose.connect(mongoString);
const db = mongoose.connection;
db.on('error', (error) => {
    console.log(error)
})
db.once('connected', () => {
    console.log('Database Connected');
    app.use('/api', router)
    app.listen(3000, () => {
        console.log(`Server Started at ${3000}`)
    })
})
