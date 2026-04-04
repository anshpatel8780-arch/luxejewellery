const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const products = [
    {
        name: "Luxe Diamond Solitaire Ring",
        price: 85000,
        category: "Rings",
        description: "A stunning 18K white gold ring featuring a brilliant solitaire diamond. Perfect for special moments.",
        images: [
            "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800",
            "https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?w=800",
            "https://images.unsplash.com/photo-1605100259148-5807903901b7?w=800",
            "https://images.unsplash.com/photo-1598560912005-7947ff3945bd?w=800"
        ],
        goldType: "18K Gold",
        weight: "4.5g",
        stock: 12,
        featured: true,
        bestSeller: false
    },
    {
        name: "Heritage Temple Necklace",
        price: 145000,
        category: "Necklaces",
        description: "Exquisite 22K yellow gold necklace with traditional temple motifs and ruby embellishments.",
        images: [
            "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800",
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800",
            "https://images.unsplash.com/photo-1599643477877-380327f31165?w=800",
            "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800"
        ],
        goldType: "22K Gold",
        weight: "42.0g",
        stock: 5,
        featured: true,
        bestSeller: true
    },
    {
        name: "Classic Gold Jhumka Earrings",
        price: 42000,
        category: "Earrings",
        description: "Timeless 22K gold jhumkas with intricate filigree work and small pearl droplets.",
        images: [
            "https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=800",
            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800",
            "https://images.unsplash.com/photo-1629131726692-1accd0c53ce0?w=800",
            "https://images.unsplash.com/photo-1616781296062-870932069796?w=800"
        ],
        goldType: "22K Gold",
        weight: "12.5g",
        stock: 25,
        featured: false,
        bestSeller: true
    },
    {
        name: "Modern Platinum Sleek Bracelet",
        price: 68000,
        category: "Bracelets",
        description: "A minimalist platinum bracelet with a high-polish finish for modern elegance.",
        images: [
            "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800",
            "https://images.unsplash.com/photo-1573408339305-6562098e99aa?w=800",
            "https://images.unsplash.com/photo-1613948732890-5036ca7cd666?w=800",
            "https://images.unsplash.com/photo-1515562141589-67f0d569b4b7?w=800"
        ],
        goldType: "Platinum",
        weight: "8.2g",
        stock: 15,
        featured: false,
        bestSeller: false
    },
    {
        name: "Ruby & Gold Infinity Ring",
        price: 35000,
        category: "Rings",
        description: "A beautiful 18K gold infinity ring featuring a row of delicate rubies and diamonds.",
        images: [
            "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=800",
            "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800",
            "https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?w=800",
            "https://images.unsplash.com/photo-1584305323473-59728ad2f54d?w=800"
        ],
        goldType: "18K Gold",
        weight: "3.8g",
        stock: 20,
        featured: true,
        bestSeller: false
    },
    {
        name: "Infinity Rose Gold Band",
        price: 24000,
        category: "Rings",
        description: "Delicate 18K rose gold infinity band encrusted with micro-pave diamonds.",
        images: [
            "https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?w=800",
            "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800",
            "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=800",
            "https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=800"
        ],
        goldType: "18K Rose Gold",
        weight: "3.2g",
        stock: 40,
        featured: false,
        bestSeller: false
    },
    {
        name: "Elite Gold Skeleton Watch",
        price: 195000,
        category: "Watches",
        description: "Premium self-winding watch with an 18K gold case and clear skeleton dial.",
        images: [
            "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800",
            "https://images.unsplash.com/photo-1557531751-247738241372?w=800",
            "https://images.unsplash.com/photo-1522312346375-d1ad505d683b?w=800",
            "https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=800"
        ],
        goldType: "18K Gold",
        weight: "120g",
        stock: 8,
        featured: true,
        bestSeller: false
    },
    {
        name: "Vintage Silver Drop Earrings",
        price: 8500,
        category: "Earrings",
        description: "Handcrafted 925 sterling silver drop earrings with oxidized finish and sapphire accents.",
        images: [
            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800",
            "https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=800",
            "https://images.unsplash.com/photo-1629131726692-1accd0c53ce0?w=800",
            "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800"
        ],
        goldType: "Sterling Silver",
        weight: "6.5g",
        stock: 50,
        featured: false,
        bestSeller: false
    },
    {
        name: "Bold Gold Cuff Bracelet",
        price: 54000,
        category: "Bracelets",
        description: "Statement 22K gold cuff with unique geometric patterns for an elegant statement.",
        images: [
            "https://images.unsplash.com/photo-1611085583191-a3b1a308c021?w=800",
            "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800",
            "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800",
            "https://images.unsplash.com/photo-1515562141589-67f0d569b4b7?w=800"
        ],
        goldType: "22K Gold",
        weight: "18.5g",
        stock: 10,
        featured: false,
        bestSeller: false
    },
    {
        name: "Dainty Gold Butterfly Pendant",
        price: 18000,
        category: "Necklaces",
        description: "Sweet and simple 22K gold butterfly pendant on a thin gold chain.",
        images: [
            "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800",
            "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800",
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800",
            "https://images.unsplash.com/photo-1611085583191-a3b1a308c021?w=800"
        ],
        goldType: "22K Gold",
        weight: "3.5g",
        stock: 35,
        featured: false,
        bestSeller: false
    }
];

async function seedProducts() {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jewellery';
        await mongoose.connect(uri);
        console.log('Connected to MongoDB...');

        await Product.deleteMany({});
        console.log('Cleared all non-matching products.');

        await Product.insertMany(products);
        console.log('Successfully seeded 10 premium JEWELLERY ONLY products.');

        process.exit();
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seedProducts();
