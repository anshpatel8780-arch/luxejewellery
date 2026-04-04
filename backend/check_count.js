const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function checkCount() {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jewellery';
        await mongoose.connect(uri);
        const count = await Product.countDocuments();
        console.log(`CURRENT_COUNT: ${count}`);
        process.exit();
    } catch (error) {
        console.error('Check failed:', error);
        process.exit(1);
    }
}

checkCount();
