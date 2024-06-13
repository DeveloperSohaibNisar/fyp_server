import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
import fs, { write } from "fs";
import path from "path";
ffmpeg.setFfmpegPath(ffmpegPath);

const convertAudio = async (req, res, next) => {
    try {
        const inputFilePath = req.file.path;
        const outputFilename = `converted-${req.file.filename}`;
        req.file.filename = outputFilename;
        const ffmpegProcess = ffmpeg(inputFilePath)
            .toFormat('wav')
            .on('error', (err) => {
                console.error('FFmpeg error:', err);
                fs.unlink(inputFilePath, (err) => { // Clean up input file on error
                    if (err) console.error('Error deleting temporary file:', err);
                });
                return res.status(500).json({ error: 'Audio compression failed' });
            })
            .on('codecData', (data) => {
                const parts = data.duration.split(':');
                const hours = parseInt(parts[0], 10);
                const minutes = parseInt(parts[1], 10);
                const seconds = parseFloat(parts[2], 10);

                // Convert to seconds and add milliseconds
                const durationInSeconds = hours * 3600 + minutes * 60 + seconds;
                req.body.duration = durationInSeconds;
            })
            .on('end', () => {
                fs.unlink(inputFilePath, (err) => { // Clean up input file after successful conversion
                    if (err) console.error('Error deleting temporary file:', err);
                });
                next();
            })
            .save(`public/uploads/audios/${outputFilename}`)
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export default convertAudio;