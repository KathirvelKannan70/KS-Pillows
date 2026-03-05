import multer from "multer";

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB per file
const MAX_FILES = 5;

const storage = multer.memoryStorage(); // keep files in RAM; we'll push to Cloudinary

const fileFilter = (req, file, cb) => {
    if (ALLOWED_MIME.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only JPEG, PNG, WebP or GIF images are allowed."), false);
    }
};

export const uploadImages = multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_SIZE_BYTES, files: MAX_FILES },
}).array("images", MAX_FILES);
