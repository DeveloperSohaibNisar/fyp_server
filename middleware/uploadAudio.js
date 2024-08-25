import multer from "multer";
import path from "path";

// Define storage configuration for uploaded files
const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    // Generate a unique filename to prevent conflicts
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const originalname = path.parse(file.originalname).name; // Get file orignal name
    const ext = ".wav";
    cb(null, `${uniqueSuffix}-${originalname + ext}`);
  },
});

// Create multer instance with storage and file type validation
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedExtensions =
      /^(audio\/|.*\.)(m4a|flac|mp3|mp4|wav|wma|aac|opus|x-flac|x-wav|wave|mpeg|x-flac)$/; // Regular expression for allowed extensions (case-insensitive)
    if (allowedExtensions.test(file.mimetype)) {
      return cb(null, true);
    }
    // console.log(file.mimetype);
    return cb(
      new Error(
        "Invalid file type. Only audio files (m4a, flac, mp3, mp4, wav, wma, aac, opus) are allowed!"
      )
    );
  },
}).single("file"); // Configure to handle a single file named 'file' in the request

// Function to handle file upload with error handling and success response
function uploadAudio(req, res, next) {
  upload(req, res, (err) => {
    if (err) {
      if (err.message) {
        return res.status(400).json({ message: err.message }); // Use 400 for bad request errors
      }
      return res.status(500).json({ message: "Internal Server Error" }); // Generic error for unexpected issues
    }

    // Check if file was uploaded successfully
    if (!req.file) {
      return res.status(400).json({ message: "Please select a file to upload" });
    }

    next();
  });
}

export default uploadAudio;
