const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const products = [
    {
        name: "Imperial Diamond Chronograph",
        price: 245000,
        category: "Watches",
        description: "Exquisite 18K gold watch encrusted with VVS diamonds. Precision movement meets absolute luxury. SKU: LJ-WATCH-002",
        images: [
            "http://localhost:5000/uploads/watch_front.png",
            "http://localhost:5000/uploads/watch_side.png",
            "http://localhost:5000/uploads/watch_closeup.png",
            "http://localhost:5000/uploads/watch_lifestyle.png"
        ],
        goldType: "18K",
        weight: "145g",
        stock: 3,
        rating: 5,
        numReviews: 4,
        featured: true,
        bestSeller: false
    },
    {
        name: "Ancestral Gold Temple Haram",
        price: 185000,
        category: "Necklaces",
        description: "A grand 22K yellow gold necklace with traditional temple motifs and natural rubies. Heritage craftsmanship. SKU: LJ-NECK-003",
        images: [
            "http://localhost:5000/uploads/necklace_front.png",
            "http://localhost:5000/uploads/necklace_side.png",
            "http://localhost:5000/uploads/necklace_closeup.png",
            "http://localhost:5000/uploads/necklace_lifestyle.png"
        ],
        goldType: "22K",
        weight: "48.5g",
        stock: 5,
        rating: 4.9,
        numReviews: 12,
        featured: true,
        bestSeller: true
    },
    {
        name: "Luxe Platinum Solitaire Studs",
        price: 95000,
        category: "Earrings",
        description: "Brilliant 2ct total weight diamond solitaire studs in pure platinum four-prong settings. SKU: LJ-EAR-004",
        images: [
            "http://localhost:5000/uploads/earrings_front.png",
            "http://localhost:5000/uploads/earrings_side.png",
            "http://localhost:5000/uploads/earrings_closeup.png",
            "http://localhost:5000/uploads/earrings_lifestyle.png"
        ],
        goldType: "Platinum",
        weight: "2.8g",
        stock: 15,
        rating: 5,
        numReviews: 28,
        featured: false,
        bestSeller: true
    },
    {
        name: "Royal Gold & Ruby Bangle Set",
        price: 110000,
        category: "Bracelets",
        description: "Matching pair of 22K yellow gold bangles featuring hand-cut rubies and intricate filigree. SKU: LJ-BRAC-005",
        images: [
            "https://images.unsplash.com/photo-1627440301191-2ca3605fb37a?w=800",
            "https://images.unsplash.com/photo-1611085583191-a3b1a308c021?w=800",
            "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800",
            "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800"
        ],
        goldType: "22K",
        weight: "32.0g",
        stock: 8,
        rating: 4.8,
        numReviews: 10,
        featured: true,
        bestSeller: false
    },
    {
        name: "Midnight Sapphire Oval Ring",
        price: 78000,
        category: "Rings",
        description: "Deep blue 3ct royal sapphire surrounded by a halo of micro-pave diamonds in 18K white gold. SKU: LJ-RING-006",
        images: [
            "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=800",
            "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800",
            "https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?w=800",
            "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800"
        ],
        goldType: "18K",
        weight: "5.4g",
        stock: 12,
        rating: 4.9,
        numReviews: 16,
        featured: false,
        bestSeller: false
    }
];

async function addProducts() {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jewellery';
        await mongoose.connect(uri);
        console.log('Connected to MongoDB...');

        // Clear existing versions to avoid duplicates if re-run
        const names = products.map(p => p.name);
        await Product.deleteMany({ name: { $in: names } });

        await Product.insertMany(products);
        console.log('Successfully added 5 High-Quality Premium Products!');

        process.exit();
    } catch (error) {
        console.error('Failed to add products:', error);
        process.exit(1);
    }
}

addProducts();
