const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

async function updatePrices() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const result = await Product.updateMany(
            { price: { $gt: 499999 } }, 
            { $set: { price: 499000 } }
        );
        console.log(`Successfully capped ${result.modifiedCount} products at ₹499,000.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

updatePrices();
