const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const newProduct = {
    name: "Royal Emerald & Diamond Majestic Ring",
    price: 125000,
    category: "Rings",
    description: "A masterpiece of 18K yellow gold, featuring a hand-selected 2.5-carat royal emerald surrounded by a brilliant halo of micro-diamonds. Handcrafted for timeless elegance. SKU: LJ-RING-001",
    images: [
        "http://localhost:5000/uploads/royal_emerald_front.png",
        "http://localhost:5000/uploads/royal_emerald_side.png",
        "http://localhost:5000/uploads/royal_emerald_closeup.png",
        "http://localhost:5000/uploads/royal_emerald_lifestyle.png"
    ],
    goldType: "18K",
    weight: "6.5g",
    stock: 5,
    rating: 5,
    numReviews: 1,
    featured: true,
    bestSeller: false
};

async function addProduct() {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jewellery';
        await mongoose.connect(uri);
        console.log('Connected to MongoDB...');

        // Clear previous if any with same name to keep it single
        await Product.deleteMany({ name: newProduct.name });

        const product = new Product(newProduct);
        await product.save();
        console.log('Successfully added the Single High-Quality Product!');

        process.exit();
    } catch (error) {
        console.error('Failed to add product:', error);
        process.exit(1);
    }
}

addProduct();
