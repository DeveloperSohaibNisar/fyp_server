import { url2blob } from '../utils/helperFunctions.js';
import RecordingSchema from '../models/recording.js';

const HF_API_TOKEN = process.env.HF_API_TOKEN || ""

export const uploadAudio = async (req, res) => {
    const newRecording = new RecordingSchema({
        name: req.file.originalname,
        audioLength: parseInt(req.body.duration),
        audioUrl: `http://localhost:3000/uploads/${req.file.filename}`,
    });

    try {
        const snapshot = await newRecording.save();
        res.status(200).json(snapshot);
    }
    catch (err) {
        if (err.message) {
            return res.status(500).json({ error: err.message });
        }
        return res.status(500).json({ error: err });
    }
};


export const createTranscription = async (req, res) => {
    try {
        let recording = await RecordingSchema.findById(req.params.audioId);

        if (recording.isTranscritonCreated) {
            return res.status(500).json({ error: 'transcription already exists' });
        }

        const blob = await url2blob(recording.audioUrl);
        const response = await fetch(
            "https://api-inference.huggingface.co/models/facebook/wav2vec2-base-960h",
            {
                headers: { Authorization: `Bearer ${HF_API_TOKEN}` },
                method: "POST",
                body: blob,
            }
        );
        const result = await response.json();

        recording.transcriptionData = [{
            text: result.text,
            start: 0,
            end: recording.audioLength
        }];
        recording.isTranscritonCreated = true;
        const updatedRecording = await recording.save();
        return res.status(200).json(updatedRecording);
    }
    catch (err) {
        if (err.message) {
            return res.status(500).json({ error: err.message });
        }
        return res.status(500).json({ error: err });
    }
};


export const createSummary = async (req, res) => {
    try {
        let recording = await RecordingSchema.findById(req.params.audioId);

        if (recording.isSummaryCreated) {
            return res.status(500).json({ error: 'summary already exists' });
        }

        const response = await fetch(
            "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
            {
                headers: { Authorization: `Bearer ${HF_API_TOKEN}` },
                method: "POST",
                body: JSON.stringify({ inputs: "The tower is 324 metres (1,063 ft) tall, about the same height as an 81-storey building, and the tallest structure in Paris. Its base is square, measuring 125 metres (410 ft) on each side. During its construction, the Eiffel Tower surpassed the Washington Monument to become the tallest man-made structure in the world, a title it held for 41 years until the Chrysler Building in New York City was finished in 1930. It was the first structure to reach a height of 300 metres. Due to the addition of a broadcasting aerial at the top of the tower in 1957, it is now taller than the Chrysler Building by 5.2 metres (17 ft). Excluding transmitters, the Eiffel Tower is the second tallest free-standing structure in France after the Millau Viaduct." }),
            }
        );
        const summaryText = await response.json();

        recording.summaryText = summaryText;
        recording.isSummaryCreated = true;
        const updatedRecording = await recording.save();
        return res.status(200).json(updatedRecording);

    } catch (err) {
        if (err.message) {
            return res.status(500).json({ error: err.message });
        }
        return res.status(500).json({ error: err });
    }
};

export const getAllAudio = async (req, res) => {
    try {
        const perPage = 10;
        const page = req.params.page;

        const result = await RecordingSchema.find()
            .limit(perPage)
            .skip(perPage * page)
            .sort({
                uploadDate: 'asc'
            });
        return res.status(200).json(result);
    } catch (err) {
        if (err.message) {
            return res.status(500).json({ error: err.message });
        }
        return res.status(500).json({ error: err });
    }
}