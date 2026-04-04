const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const categoricalProducts = [
    {
        name: "Diamond Solitaire Ring",
        price: 85000,
        category: "Rings",
        description: "Exquisite 1ct diamond solitaire ring set in 18K white gold. A timeless symbol of elegance.",
        images: Array(4).fill("https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800"),
        goldType: "18K",
        weight: "4.5g",
        stock: 10,
        rating: 5,
        numReviews: 15,
        featured: true,
        bestSeller: true
    },
    {
        name: "Emerald Heritage Necklace",
        price: 150000,
        category: "Necklaces",
        description: "Traditional 22K yellow gold necklace featuring teardrop emeralds and intricate floral motifs.",
        images: Array(4).fill("https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800"),
        goldType: "22K",
        weight: "35.0g",
        stock: 5,
        rating: 4.8,
        numReviews: 8,
        featured: true,
        bestSeller: false
    },
    {
        name: "Sapphire Drop Earrings",
        price: 45000,
        category: "Earrings",
        description: "Stunning blue sapphire drop earrings with a halo of brilliant-cut diamonds in platinum mounting.",
        images: Array(4).fill("https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=800"),
        goldType: "Platinum",
        weight: "6.2g",
        stock: 20,
        rating: 4.9,
        numReviews: 12,
        featured: false,
        bestSeller: true
    },
    {
        name: "Gold Filigree Bracelet",
        price: 65000,
        category: "Bracelets",
        description: "Handcrafted 22K gold bracelet with delicate filigree work and a secure hidden clasp.",
        images: Array(4).fill("https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800"),
        goldType: "22K",
        weight: "18.5g",
        stock: 15,
        rating: 4.7,
        numReviews: 20,
        featured: false,
        bestSeller: false
    },
    {
        name: "Classic Luxury Chronograph",
        price: 195000,
        category: "Watches",
        description: "Premium gold-plated automatic watch with sapphire glass and genuine leather strap.",
        images: Array(4).fill("https://images.unsplash.com/photo-1524592091214-8c6caad46244?w=800"),
        goldType: "18K",
        weight: "120g",
        stock: 3,
        rating: 5,
        numReviews: 4,
        featured: true,
        bestSeller: false
    }
];

async function seedCategorical() {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) throw new Error('MONGO_URI not found in .env');

        console.log('Connecting to MongoDB Atlas...');
        await mongoose.connect(uri);
        console.log('Connected successfully!');

        // Add products
        for (const productData of categoricalProducts) {
            // Check if product already exists to avoid duplicates
            const existing = await Product.findOne({ name: productData.name });
            if (existing) {
                console.log(`Product "${productData.name}" already exists. Skipping.`);
                continue;
            }
            
            await Product.create(productData);
            console.log(`Added product: ${productData.name} (${productData.category})`);
        }

        console.log('\nCategorical products verification complete!');
        process.exit(0);
    } catch (error) {
        console.error('Failed to seed products:', error);
        process.exit(1);
    }
}

seedCategorical();
