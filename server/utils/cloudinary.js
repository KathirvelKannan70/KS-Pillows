import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file buffer to Cloudinary under the ks-pillows/products folder.
 * @param {Buffer} buffer - The raw file bytes from multer memoryStorage
 * @param {string} originalName - Original filename (used to build publicId)
 * @returns {Promise<string>} Cloudinary secure_url
 */
export async function uploadToCloudinary(buffer, originalName) {
    return new Promise((resolve, reject) => {
        // Strip extension and sanitise for use as a publicId-prefix
        const baseName = originalName
            .replace(/\.[^.]+$/, "")
            .replace(/[^a-zA-Z0-9_-]/g, "_")
            .slice(0, 60);

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "ks-pillows/products",
                public_id: `${baseName}_${Date.now()}`,
                overwrite: false,
                resource_type: "image",
                transformation: [
                    { quality: "auto", fetch_format: "auto" }, // auto WebP/AVIF
                    { width: 1200, height: 1200, crop: "limit" }, // max dimension
                ],
            },
            (err, result) => {
                if (err) return reject(err);
                resolve(result.secure_url);
            }
        );
        uploadStream.end(buffer);
    });
}

export default cloudinary;
