import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + file.originalname);
    }
});

// Create the multer instance
const upload = multer({
    storage: storage,
    fileFilter(req, file, cb) {
        const filetypes = /m4a|flac|mp3|mp4|wav|wma|aac|opus/;
        const extension = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = file.mimetype.substring(0,5)=='audio';
        if (extension && mimeType) {
            return cb(null, true);
        }

        cb('Invalid file type. Only audio file is allowed!');
    },
}).single('file');

function uploadFile(req, res, next) {
    upload(req, res, (err) => {
        if (err) {
            if (err.message) {
                return res.status(500).json({ error: err.message });
            }
            return res.status(500).json({ error: err });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'Please send file' });
        }
        next()
    })
}

export default uploadFile;