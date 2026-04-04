const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../utils/cloudinary');
const path = require('path');

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'jewellery-products',
        allowed_formats: ['jpeg', 'jpg', 'png', 'webp', 'jfif'],
        public_id: (req, file) => {
            // Generate a unique public ID for each image
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            return `${req.user?._id || 'guest'}-${uniqueSuffix}`;
        }
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit per file
});

module.exports = upload;
