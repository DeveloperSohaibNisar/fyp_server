import { validateUploadAudio } from "../util/validation.js";
import { pipeline } from "@xenova/transformers";
import wavefile from "wavefile";

import RecordingSchema from "../models/recording.js";

export const uploadAudio = async (req, res) => {
  const { errors, valid } = validateUploadAudio(req.body);
  if (!valid) return res.status(400).json(errors);

  const newRecording = new RecordingSchema({
    name: req.body.name,
    audioLength: parseInt(req.body.duration),
    audioUrl: `http://localhost:3000/uploads/audios/${req.file.filename}`,
  });

  try {
    const snapshot = await newRecording.save();
    res.status(200).json(snapshot);
  } catch (err) {
    if (err.message) {
      return res.status(500).json({ message: err.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const createTranscription = async (req, res) => {
  try {
    if (!req.params || !req.params.audioId) {
      return res.status(400).json({ error: "invalid audio id" });
    }

    let recording = await RecordingSchema.findById(req.params.audioId);

    if (!recording) {
      return res
        .status(404)
        .json({ error: `audio with id ${req.params.audioId} not found` });
    }

    if (recording.isTranscritonCreated) {
      return res.status(500).json({ error: "transcription already exists" });
    }

    const transcriber = await pipeline(
      "automatic-speech-recognition",
      "Xenova/whisper-small.en"
    );
    // Load audio data
    let buffer = Buffer.from(
      await fetch(recording.audioUrl).then((x) => x.arrayBuffer())
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

    recording.transcriptionData.text = result.text;
    recording.transcriptionData.chunks = result.chunks;
    recording.isTranscritonCreated = true;
    const updatedRecording = await recording.save();
    return res.status(200).json(updatedRecording);
  } catch (err) {
    if (err.message) {
      return res.status(500).json({ error: err.message });
    }
    return res.status(500).json({ error: err });
  }
};

export const createAudioVectorDb = async (req, res) => {
  try {
    if (!req.params.audioId) throw new Error(`Invalid Request`);

    let audioSnap = await RecordingSchema.findById(req.params.audioId);
    if (!audioSnap) {
      return res
        .status(404)
        .json({ message: `audio with id ${req.params.audioId} not found` });
    }
    if (!audioSnap.isTranscritonCreated) {
      return res
        .status(404)
        .json({ message: `audio transcription with id ${req.params.audioId} not found` });
    }

    createVectorDb(req.params.audioId, audioSnap.transcriptionData.text);

    audioSnap.isVectorDatabaseCreated = true;
    const updatedRecording = await audioSnap.save();
    return res.status(200).json(updatedRecording);
  } catch (err) {
    if (err.message) {
      return res.status(500).json({ message: err.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};
// export const createSummary = async (req, res) => {
//     try {
//         let recording = await RecordingSchema.findById(req.params.audioId);

//         if (recording.isSummaryCreated) {
//             return res.status(500).json({ error: 'summary already exists' });
//         }

//         const response = await fetch(
//             "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
//             {
//                 headers: { Authorization: `Bearer ${HF_API_TOKEN}` },
//                 method: "POST",
//                 body: JSON.stringify({ inputs: "The tower is 324 metres (1,063 ft) tall, about the same height as an 81-storey building, and the tallest structure in Paris. Its base is square, measuring 125 metres (410 ft) on each side. During its construction, the Eiffel Tower surpassed the Washington Monument to become the tallest man-made structure in the world, a title it held for 41 years until the Chrysler Building in New York City was finished in 1930. It was the first structure to reach a height of 300 metres. Due to the addition of a broadcasting aerial at the top of the tower in 1957, it is now taller than the Chrysler Building by 5.2 metres (17 ft). Excluding transmitters, the Eiffel Tower is the second tallest free-standing structure in France after the Millau Viaduct." }),
//             }
//         );
//         const summaryText = await response.json();

//         recording.summaryText = summaryText;
//         recording.isSummaryCreated = true;
//         const updatedRecording = await recording.save();
//         return res.status(200).json(updatedRecording);

//     } catch (err) {
//         if (err.message) {
//             return res.status(500).json({ error: err.message });
//         }
//         return res.status(500).json({ error: err });
//     }
// };

export const getAllAudio = async (req, res) => {
  try {
    const perPage = 10;
    const page = req.params.page;

    const result = await RecordingSchema.find()
      .limit(perPage)
      .skip(perPage * page)
      .sort({
        uploadDate: "asc",
      });
    return res.status(200).json(result);
  } catch (err) {
    if (err.message) {
      return res.status(500).json({ message: err.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};
