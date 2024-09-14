import { pipeline, env } from "@xenova/transformers";
import wavefile from "wavefile";
import createSummary from "../util/summaryAudio.js";
import createVectorDb from "../util/vector.js";
import RecordingSchema from "../models/recording.js";

env.backends.onnx.logSeverityLevel = 3;

export const uploadAudio = async (req, res) => {
  try {
    if (!req.body.name) throw new Error(`Name must be provided`);

    const audioUrl = `http://192.168.100.6:3000/uploads/audios/${req.file.filename}`;

    const transcriptionData = await createTranscription(audioUrl);

    const summaryData = await createSummary(transcriptionData.text);

    const newRecording = new RecordingSchema({
      name: req.body.name,
      audioLength: parseInt(req.body.duration),
      userId: req.userData._id,
      transcriptionData,
      audioUrl,
      summaryData,
    });

    const snapshot = await newRecording.save();
    createVectorDb(snapshot._id, transcriptionData.text);
    res.status(200).json(snapshot);
  } catch (err) {
    if (err.message) {
      return res.status(500).json({ message: err.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

const createTranscription = async (audioUrl) => {
  try {
    const transcriber = await pipeline(
      "automatic-speech-recognition",
      "Xenova/whisper-small.en"
    );
    // Load audio data
    let buffer = Buffer.from(
      await fetch(audioUrl).then((x) => x.arrayBuffer())
    );
    // Read .wav file and convert it to required format
    let wav = new wavefile.WaveFile(buffer);
    wav.toBitDepth("32f"); // Pipeline expects input as a Float32Array
    wav.toSampleRate(16000); // Whisper expects audio with a sampling rate of 16000
    let audioData = wav.getSamples();
    if (Array.isArray(audioData)) {
      if (audioData.length > 1) {
        const SCALING_FACTOR = Math.sqrt(2);
        // Merge channels (into first channel to save memory)
        for (let i = 0; i < audioData[0].length; ++i) {
          audioData[0][i] =
            (SCALING_FACTOR * (audioData[0][i] + audioData[1][i])) / 2;
        }
      }
      // Select first channel
      audioData = audioData[0];
    }
    const result = await transcriber(audioData, {
      chunk_length_s: 30,
      stride_length_s: 5,
      return_timestamps: true,
    });

    return result;
  } catch (error) {
    throw error;
  }
};

export const getAllAudio = async (req, res) => {
  try {
    const perPage = 10;
    if (!req.params.page) throw new Error(`Invalid Request`);

    const page = req.params.page;

    const result = await RecordingSchema.find({ userId: req.userData._id })
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
