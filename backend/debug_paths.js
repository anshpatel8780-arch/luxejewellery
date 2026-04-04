const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

async function checkPaths() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const products = await Product.find({}).limit(5);
        products.forEach(p => {
            console.log(`Product: ${p.name}, Images: ${JSON.stringify(p.images)}`);
        });
        process.exit(0);
    } catch (err) {
        process.exit(1);
    }
}
checkPaths();
