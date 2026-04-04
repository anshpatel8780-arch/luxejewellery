const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

async function fixPaths() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected successfully.');

        const products = await Product.find({});
        let updatedCount = 0;

        for (const product of products) {
            let changed = false;
            const newImages = product.images.map(img => {
                if (img.includes('/uploads/uploads/')) {
                    changed = true;
                    return img.replace('/uploads/uploads/', '/uploads/');
                }
                if (img.startsWith('uploads/')) {
                    changed = true;
                    return '/' + img;
                }
                return img;
            });

            if (changed) {
                product.images = newImages;
                await product.save();
                updatedCount++;
            }
        }

        console.log(`Updated ${updatedCount} products with corrected paths.`);
        process.exit(0);
    } catch (err) {
        console.error('An error occurred:', err);
        process.exit(1);
    }
}

fixPaths();
