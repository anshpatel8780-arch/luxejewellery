const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const moreProducts = [
    {
        name: "Rose Gold Eternity Band",
        price: 55000,
        category: "Rings",
        description: "Elegant 18K rose gold eternity band featuring micro-pave set round brilliant diamonds. Perfect for stacking.",
        images: Array(4).fill("https://images.unsplash.com/photo-1603912627214-9460d6347d4e?w=800"),
        goldType: "18K",
        weight: "3.8g",
        stock: 12,
        rating: 4.9,
        numReviews: 18,
        featured: false,
        bestSeller: true
    },
    {
        name: "Lustrous Pearl Choker",
        price: 32000,
        category: "Necklaces",
        description: "Stunning freshwater pearl choker with a hidden 14K gold clasp. Adds a touch of classic sophistication.",
        images: Array(4).fill("https://images.unsplash.com/photo-1596944214829-d6480e608821?w=800"),
        goldType: "22K",
        weight: "22.0g",
        stock: 8,
        rating: 4.8,
        numReviews: 10,
        featured: false,
        bestSeller: false
    },
    {
        name: "Brilliant Diamond Studs",
        price: 95000,
        category: "Earrings",
        description: "Classic 1ct total weight diamond solitaire studs in secure 4-prong platinum settings. Essential luxury.",
        images: Array(4).fill("https://images.unsplash.com/photo-1598560917505-59a3ad559071?w=800"),
        goldType: "Platinum",
        weight: "2.5g",
        stock: 25,
        rating: 5,
        numReviews: 30,
        featured: true,
        bestSeller: true
    },
    {
        name: "Silver Harmony Charm Bracelet",
        price: 18000,
        category: "Bracelets",
        description: "Charming Sterling Silver link bracelet with detailed botanical charms and a toggle closure.",
        images: Array(4).fill("https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800"),
        goldType: "Silver",
        weight: "12.5g",
        stock: 30,
        rating: 4.6,
        numReviews: 22,
        featured: false,
        bestSeller: false
    },
    {
        name: "Minimalist Rose Gold Watch",
        price: 125000,
        category: "Watches",
        description: "Sleek and modern 18K rose gold watch with a minimalist sunray dial and premium mesh strap. Swiss quartz movement.",
        images: Array(4).fill("https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=800"),
        goldType: "18K",
        weight: "85g",
        stock: 5,
        rating: 4.9,
        numReviews: 6,
        featured: true,
        bestSeller: false
    }
];

async function seedMore() {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) throw new Error('MONGO_URI not found in .env');

        console.log('Connecting to MongoDB Atlas...');
        await mongoose.connect(uri);
        console.log('Connected successfully!');

        // Add additional products
        for (const productData of moreProducts) {
            const existing = await Product.findOne({ name: productData.name });
            if (existing) {
                console.log(`Product "${productData.name}" already exists. Skipping.`);
                continue;
            }
            
            await Product.create(productData);
            console.log(`Added more product: ${productData.name} (${productData.category})`);
        }

        console.log('\nSeeding of 5 more premium products complete!');
        process.exit(0);
    } catch (error) {
        console.error('Failed to seed more products:', error);
        process.exit(1);
    }
}

seedMore();
