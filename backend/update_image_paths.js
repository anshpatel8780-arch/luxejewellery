const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

async function updateImagePaths() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected successfully.');

        const products = await Product.find({
            'images.0': { $regex: /^[^\/].+\.png$/ } // Find images that don't start with / and end with .png
        });

        console.log(`Found ${products.length} products to update.`);

        for (const product of products) {
            const updatedImages = product.images.map(img => {
                if (!img.startsWith('http') && !img.startsWith('/uploads/')) {
                    return `/uploads/${img}`;
                }
                return img;
            });

            product.images = updatedImages;
            await product.save();
            console.log(`Updated images for: ${product.name}`);
        }

        console.log('Finished updating image paths.');
        process.exit(0);
    } catch (err) {
        console.error('An error occurred:', err);
        process.exit(1);
    }
}

updateImagePaths();
