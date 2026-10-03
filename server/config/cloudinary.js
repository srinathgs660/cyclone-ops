const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Uploads an image buffer (from Multer memoryStorage) directly to Cloudinary.
 * @param {Buffer} buffer - File buffer
 * @param {Object} options - Optional Cloudinary upload options
 * @returns {Promise<{ secure_url: string, public_id: string }>}
 */
const uploadBufferToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'cyclone_ops/volunteer_proofs',
        resource_type: 'image',
        transformation: [
          { quality: 'auto:good', fetch_format: 'auto' },
          { width: 1600, height: 1600, crop: 'limit' } // Ensure photos are reasonably sized
        ],
        ...options
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id
        });
      }
    );
    uploadStream.end(buffer);
  });
};

module.exports = {
  cloudinary,
  uploadBufferToCloudinary
};
