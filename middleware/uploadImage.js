import multer from "multer";

// Define storage configuration for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/images');
    },
    filename: (req, file, cb) => {
        // Generate a unique filename to prevent conflicts
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
});

// Create multer instance with storage and file type validation
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedExtensions = /^(image\/|.*\.)(jpeg|jpg|png)$/; // Regular expression for allowed extensions (case-insensitive)
        if (allowedExtensions.test(file.mimetype)) {
            return cb(null, true);
        }
        // console.log(file.mimetype);
        return cb(new Error('Invalid file type. Only image files (jpeg, jpg, png) are allowed!'));
    },
}).single('file'); // Configure to handle a single file named 'file' in the request

// Function to handle file upload with error handling and success response
function uploadImage(req, res, next) {
    upload(req, res, (err) => {
        if (err) {
            if (err.message) {
                return res.status(400).json({ error: err.message }); // Use 400 for bad request errors
            }
            return res.status(500).json({ error: 'Internal Server Error' }); // Generic error for unexpected issues
        }

        // Check if file was uploaded successfully
        // if (!req.file) {
        //     // return res.status(400).json({ error: 'Please select a file to upload' });
        //     req.file = null;
        // }

        next();
    });
}

export default uploadImage;