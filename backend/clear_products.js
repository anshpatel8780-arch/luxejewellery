const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function clearProducts() {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jewellery';
        await mongoose.connect(uri);
        console.log('Connected to MongoDB...');

        const result = await Product.deleteMany({});
        console.log(`Successfully removed ${result.deletedCount} products from the shop.`);

        process.exit();
    } catch (error) {
        console.error('Failed to clear products:', error);
        process.exit(1);
    }
}

clearProducts();
