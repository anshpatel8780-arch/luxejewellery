const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

async function updateFeaturedProducts() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected successfully.');

        const result = await Product.updateMany(
            { price: { $in: [1500, 2500, 3500, 5500, 8500, 4500] } },
            { $set: { featured: true, bestSeller: true } }
        );

        console.log(`Updated ${result.modifiedCount} products to be featured/best sellers.`);
        process.exit(0);
    } catch (err) {
        console.error('An error occurred:', err);
        process.exit(1);
    }
}

updateFeaturedProducts();
