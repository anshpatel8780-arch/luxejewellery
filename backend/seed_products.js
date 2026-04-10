const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const products = [
    {
        name: "Classic Diamond Solitaire Ring",
        price: 45000,
        category: "Rings",
        description: "A timeless 18K white gold ring featuring a brilliant-cut solitaire diamond. Perfect for engagements.",
        images: [
            "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1603561591411-0e7d3bfb93b3?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1627225924765-552d44cfbc72?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1598560912005-5976593ac481?auto=format&fit=crop&q=80&w=800"
        ],
        goldType: "18K",
        weight: "3.5g",
        stock: 15,
        rating: 4.8,
        numReviews: 24,
        featured: true,
        bestSeller: true
    },
    {
        name: "Vintage Emerald Pendant",
        price: 32000,
        category: "Necklaces",
        description: "Stunning emerald pendant encased in a delicate 22K gold filigree design. A piece of heritage.",
        images: [
            "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1599643477877-537ef5278531?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1531995811006-35cb42e1a021?auto=format&fit=crop&q=80&w=800"
        ],
        goldType: "22K",
        weight: "5.2g",
        stock: 8,
        rating: 4.9,
        numReviews: 12,
        featured: true,
        bestSeller: false
    },
    {
        name: "Modern Silver Hoops",
        price: 3500,
        category: "Earrings",
        description: "Minimalist 925 sterling silver hoop earrings for everyday elegance and comfort.",
        images: [
            "https://images.unsplash.com/photo-1635767798638-3e25273a8256?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1535633302703-b0703af2939a?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&q=80&w=800"
        ],
        goldType: "Silver",
        weight: "4.0g",
        stock: 50,
        rating: 4.5,
        numReviews: 45,
        featured: false,
        bestSeller: true
    },
    {
        name: "Luxury Platinum Chronograph",
        price: 125000,
        category: "Watches",
        description: "Precision-engineered Swiss movement watch with a pure platinum casing and leather strap.",
        images: [
            "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1508685096489-723f51f97654?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1509152730535-90bb641c97b5?auto=format&fit=crop&q=80&w=800"
        ],
        goldType: "Platinum",
        weight: "85g",
        stock: 5,
        rating: 5.0,
        numReviews: 6,
        featured: true,
        bestSeller: false
    },
    {
        name: "Rose Gold Tennis Bracelet",
        price: 18000,
        category: "Bracelets",
        description: "Elegant 18K rose gold tennis bracelet set with sparkling cubic zirconia strings.",
        images: [
            "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1573408374415-f4e71276fd96?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=801",
            "https://images.unsplash.com/photo-1573408374415-f4e71276fd96?auto=format&fit=crop&q=80&w=801"
        ],
        goldType: "18K",
        weight: "7.8g",
        stock: 12,
        rating: 4.7,
        numReviews: 18,
        featured: false,
        bestSeller: true
    },
    {
        name: "Pearl Drop Earrings",
        price: 8500,
        category: "Earrings",
        description: "Genuine freshwater pearls hanging from 22K gold shepherd hooks. Classically beautiful.",
        images: [
            "https://images.unsplash.com/photo-1535633302703-b0703af2939a?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1535633302703-b0703af2939a?auto=format&fit=crop&q=80&w=801",
            "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&q=80&w=801"
        ],
        goldType: "22K",
        weight: "3.2g",
        stock: 20,
        rating: 4.6,
        numReviews: 30,
        featured: false,
        bestSeller: false
    },
    {
        name: "Men's Solid Gold Band",
        price: 28000,
        category: "Rings",
        description: "Classic 24K pure gold wedding band with a heavy, polished finish for a lifetime.",
        images: [
            "https://images.unsplash.com/photo-1627225924765-552d44cfbc72?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1598560912005-5976593ac481?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1627225924765-552d44cfbc72?auto=format&fit=crop&q=80&w=801",
            "https://images.unsplash.com/photo-1598560912005-5976593ac481?auto=format&fit=crop&q=80&w=801"
        ],
        goldType: "24K",
        weight: "8.0g",
        stock: 10,
        rating: 4.9,
        numReviews: 15,
        featured: false,
        bestSeller: true
    },
    {
        name: "Amethyst Statement Necklace",
        price: 22000,
        category: "Necklaces",
        description: "Bold amethyst stones set in a sterling silver multi-strand necklace for a unique look.",
        images: [
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1599643477877-537ef5278531?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1531995811006-35cb42e1a021?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=801"
        ],
        goldType: "Silver",
        weight: "12.5g",
        stock: 6,
        rating: 4.4,
        numReviews: 8,
        featured: true,
        bestSeller: false
    },
    {
        name: "Butterfly Charm Bracelet",
        price: 5500,
        category: "Bracelets",
        description: "Whimsical 18K gold charm bracelet featuring delicate butterfly motifs and a safety chain.",
        images: [
            "https://images.unsplash.com/photo-1573408374415-f4e71276fd96?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1573408374415-f4e71276fd96?auto=format&fit=crop&q=80&w=801",
            "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=801"
        ],
        goldType: "18K",
        weight: "4.5g",
        stock: 25,
        rating: 4.7,
        numReviews: 22,
        featured: false,
        bestSeller: false
    },
    {
        name: "Sapphire Stud Earrings",
        price: 15000,
        category: "Earrings",
        description: "Deep blue sapphires claw-set in premium 18K white gold. Minimalist and elegant.",
        images: [
            "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?auto=format&fit=crop&q=80&w=801",
            "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&q=80&w=801"
        ],
        goldType: "18K",
        weight: "2.8g",
        stock: 10,
        rating: 4.8,
        numReviews: 14,
        featured: true,
        bestSeller: false
    },
    {
        name: "Gold Quartz Watch",
        price: 45000,
        category: "Watches",
        description: "Elegant rectangular watch face with 22K gold plating and a mesh bracelet.",
        images: [
            "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1508685096489-723f51f97654?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&q=80&w=801",
            "https://images.unsplash.com/photo-1508685096489-723f51f97654?auto=format&fit=crop&q=80&w=801"
        ],
        goldType: "22K",
        weight: "45g",
        stock: 7,
        rating: 4.6,
        numReviews: 11,
        featured: false,
        bestSeller: false
    },
    {
        name: "Ruby Infinity Ring",
        price: 19500,
        category: "Rings",
        description: "Infinity symbol ring crafted from 18K gold and adorned with small rubies. Symbolic of forever.",
        images: [
            "https://images.unsplash.com/photo-1603561591411-0e7d3bfb93b3?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1627225924765-552d44cfbc72?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1603561591411-0e7d3bfb93b3?auto=format&fit=crop&q=80&w=801",
            "https://images.unsplash.com/photo-1627225924765-552d44cfbc72?auto=format&fit=crop&q=80&w=801"
        ],
        goldType: "18K",
        weight: "3.0g",
        stock: 14,
        rating: 4.7,
        numReviews: 20,
        featured: false,
        bestSeller: true
    },
    {
        name: "Tribal Silver Bangle",
        price: 4200,
        category: "Bracelets",
        description: "Handcrafted ethnic bangle made from pure silver with intricate tribal engravings.",
        images: [
            "https://images.unsplash.com/photo-1535633302703-b0703af2939a?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1535633302703-b0703af2939a?auto=format&fit=crop&q=80&w=801",
            "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=801"
        ],
        goldType: "Silver",
        weight: "15.0g",
        stock: 30,
        rating: 4.5,
        numReviews: 35,
        featured: false,
        bestSeller: false
    },
    {
        name: "Diamond Choker Necklace",
        price: 85000,
        category: "Necklaces",
        description: "Exquisite choker featuring a line of brilliant diamonds set in platinum. Modern and bold.",
        images: [
            "https://images.unsplash.com/photo-1599643477877-537ef5278531?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1531995811006-35cb42e1a021?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1599643477877-537ef5278531?auto=format&fit=crop&q=80&w=801",
            "https://images.unsplash.com/photo-1531995811006-35cb42e1a021?auto=format&fit=crop&q=80&w=801"
        ],
        goldType: "Platinum",
        weight: "18.5g",
        stock: 3,
        rating: 5.0,
        numReviews: 5,
        featured: true,
        bestSeller: false
    },
    {
        name: "Opal Earrings",
        price: 11000,
        category: "Earrings",
        description: "Iridescent opals that catch the light from every angle, set in 18K yellow gold.",
        images: [
            "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1535633302703-b0703af2939a?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&q=80&w=801",
            "https://images.unsplash.com/photo-1535633302703-b0703af2939a?auto=format&fit=crop&q=80&w=801"
        ],
        goldType: "18K",
        weight: "3.5g",
        stock: 9,
        rating: 4.7,
        numReviews: 16,
        featured: false,
        bestSeller: false
    },
    {
        name: "Designer Steel & Gold Watch",
        price: 65000,
        category: "Watches",
        description: "Two-tone surgical steel and 18K gold watch for the modern professional with style.",
        images: [
            "https://images.unsplash.com/photo-1508685096489-723f51f97654?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1508685096489-723f51f97654?auto=format&fit=crop&q=80&w=801",
            "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&q=80&w=801"
        ],
        goldType: "18K",
        weight: "110g",
        stock: 4,
        rating: 4.9,
        numReviews: 9,
        featured: true,
        bestSeller: true
    },
    {
        name: "Emerald Cut Topaz Ring",
        price: 16500,
        category: "Rings",
        description: "Large emerald-cut blue topaz set in a 22K gold shank. Stunning clarity and color.",
        images: [
            "https://images.unsplash.com/photo-1598560912005-5976593ac481?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1627225924765-552d44cfbc72?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1598560912005-5976593ac481?auto=format&fit=crop&q=80&w=801",
            "https://images.unsplash.com/photo-1627225924765-552d44cfbc72?auto=format&fit=crop&q=80&w=801"
        ],
        goldType: "22K",
        weight: "5.5g",
        stock: 11,
        rating: 4.6,
        numReviews: 13,
        featured: false,
        bestSeller: false
    },
    {
        name: "Heart Silhouette Necklace",
        price: 6800,
        category: "Necklaces",
        description: "Simple and elegant open heart pendant on a fine 18K gold chain. A gift of love.",
        images: [
            "https://images.unsplash.com/photo-1531995811006-35cb42e1a021?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1599643477877-537ef5278531?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1531995811006-35cb42e1a021?auto=format&fit=crop&q=80&w=801",
            "https://images.unsplash.com/photo-1599643477877-537ef5278531?auto=format&fit=crop&q=80&w=801"
        ],
        goldType: "18K",
        weight: "2.5g",
        stock: 40,
        rating: 4.8,
        numReviews: 52,
        featured: false,
        bestSeller: true
    },
    {
        name: "Cuff Bracelet in Platinum",
        price: 55000,
        category: "Bracelets",
        description: "Sleek and minimalist platinum cuff bracelet with a mirror finish. Substantial and premium.",
        images: [
            "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1573408374415-f4e71276fd96?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=801",
            "https://images.unsplash.com/photo-1573408374415-f4e71276fd96?auto=format&fit=crop&q=80&w=801"
        ],
        goldType: "Platinum",
        weight: "22.0g",
        stock: 4,
        rating: 4.9,
        numReviews: 7,
        featured: true,
        bestSeller: false
    },
    {
        name: "Temple Design Earrings",
        price: 38000,
        category: "Earrings",
        description: "Traditional Indian temple jewellery earrings in 24K pure gold with exquisite detail.",
        images: [
            "https://images.unsplash.com/photo-1630019017590-f00496aa9021?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1630019017590-f00496aa9021?auto=format&fit=crop&q=80&w=801",
            "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&q=80&w=801"
        ],
        goldType: "24K",
        weight: "12.0g",
        stock: 6,
        rating: 5.0,
        numReviews: 10,
        featured: true,
        bestSeller: false
    }
];

async function seedProducts() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB.');

        // Clear existing products for a clean start with 4 images each
        await Product.deleteMany({});
        console.log('Cleared existing products.');

        for (const productData of products) {
            await Product.create(productData);
            console.log(`Created product: ${productData.name}`);
        }

        console.log('Seed completed successfully with multi-angle images.');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding products:', err);
        process.exit(1);
    }
}

seedProducts();
