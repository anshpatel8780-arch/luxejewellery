const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Product = require('./models/Product');

const products = [
    // Rings
    { name: 'Royal Diamond Solitaire Ring', price: 45000, category: 'Rings', description: 'A stunning solitaire ring featuring a brilliant-cut diamond set in 22K gold. Perfect for engagements and special occasions.', images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500'], goldType: '22K', weight: '4.5g', stock: 15, rating: 4.8, numReviews: 24, featured: true, bestSeller: true },
    { name: 'Elegant Rose Gold Band', price: 18000, category: 'Rings', description: 'Minimalist rose gold band with delicate engravings. A timeless piece for everyday elegance.', images: ['https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=500'], goldType: '18K', weight: '3.2g', stock: 25, rating: 4.5, numReviews: 18, featured: true },
    { name: 'Vintage Emerald Ring', price: 62000, category: 'Rings', description: 'Handcrafted vintage-style ring with natural emerald centerpiece surrounded by micro-pave diamonds.', images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500'], goldType: '22K', weight: '5.8g', stock: 8, rating: 4.9, numReviews: 12, bestSeller: true },
    { name: 'Classic Gold Signet Ring', price: 22000, category: 'Rings', description: 'Traditional signet ring crafted in pure 22K gold with a polished finish.', images: ['https://images.unsplash.com/photo-1589674781759-c21c37956a44?w=500'], goldType: '22K', weight: '6.0g', stock: 20, rating: 4.3, numReviews: 15 },

    // Necklaces
    { name: 'Diamond Pendant Necklace', price: 75000, category: 'Necklaces', description: 'Exquisite diamond pendant on a delicate 22K gold chain. Features a teardrop diamond with exceptional clarity.', images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500'], goldType: '22K', weight: '8.5g', stock: 10, rating: 4.9, numReviews: 30, featured: true, bestSeller: true },
    { name: 'Pearl Strand Necklace', price: 35000, category: 'Necklaces', description: 'Lustrous freshwater pearl strand with 18K gold clasp. Timeless sophistication for any occasion.', images: ['https://images.unsplash.com/photo-1515562141589-67f0d569b4b7?w=500'], goldType: '18K', weight: '12.0g', stock: 12, rating: 4.6, numReviews: 22 },
    { name: 'Gold Chain Choker', price: 28000, category: 'Necklaces', description: 'Contemporary choker-style chain in polished 22K gold. Bold and modern statement piece.', images: ['https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=500'], goldType: '22K', weight: '15.0g', stock: 18, rating: 4.4, numReviews: 16, featured: true },
    { name: 'Ruby Gold Necklace Set', price: 95000, category: 'Necklaces', description: 'Magnificent ruby and gold necklace set with matching earrings. Bridal collection masterpiece.', images: ['https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=500'], goldType: '22K', weight: '25.0g', stock: 5, rating: 5.0, numReviews: 8, bestSeller: true },

    // Earrings
    { name: 'Diamond Stud Earrings', price: 32000, category: 'Earrings', description: 'Classic round brilliant diamond studs set in 18K white gold. Perfect everyday luxury.', images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500'], goldType: '18K', weight: '2.4g', stock: 30, rating: 4.7, numReviews: 35, featured: true, bestSeller: true },
    { name: 'Gold Jhumka Earrings', price: 24000, category: 'Earrings', description: 'Traditional Indian jhumka earrings in intricate 22K gold filigree work with pearl drops.', images: ['https://images.unsplash.com/photo-1630019852942-f89202989a59?w=500'], goldType: '22K', weight: '8.0g', stock: 20, rating: 4.8, numReviews: 28 },
    { name: 'Emerald Drop Earrings', price: 48000, category: 'Earrings', description: 'Elegant drop earrings featuring natural emeralds framed in 22K gold with diamond accents.', images: ['https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=500'], goldType: '22K', weight: '5.5g', stock: 10, rating: 4.6, numReviews: 14 },
    { name: 'Hoop Gold Earrings', price: 15000, category: 'Earrings', description: 'Sleek and modern hoop earrings in polished 18K gold. Versatile for any occasion.', images: ['https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=500'], goldType: '18K', weight: '3.0g', stock: 35, rating: 4.4, numReviews: 20, featured: true },

    // Bracelets
    { name: 'Diamond Tennis Bracelet', price: 85000, category: 'Bracelets', description: 'Stunning tennis bracelet with 3 carats of round brilliant diamonds in 18K white gold setting.', images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500'], goldType: '18K', weight: '12.0g', stock: 6, rating: 4.9, numReviews: 10, featured: true, bestSeller: true },
    { name: 'Gold Bangle Set', price: 42000, category: 'Bracelets', description: 'Set of 4 traditional 22K gold bangles with intricate carved patterns. Bridal essential.', images: ['https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=500'], goldType: '22K', weight: '32.0g', stock: 15, rating: 4.7, numReviews: 25 },
    { name: 'Chain Link Bracelet', price: 19000, category: 'Bracelets', description: 'Modern chain link bracelet in 18K gold. Minimalist design for everyday wear.', images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500'], goldType: '18K', weight: '7.5g', stock: 22, rating: 4.5, numReviews: 16 },
    { name: 'Pearl & Gold Bracelet', price: 27000, category: 'Bracelets', description: 'Delicate bracelet combining freshwater pearls with 22K gold links. Elegant and refined.', images: ['https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=500'], goldType: '22K', weight: '5.0g', stock: 18, rating: 4.3, numReviews: 12 },

    // Watches
    { name: 'Gold Luxury Watch', price: 125000, category: 'Watches', description: 'Premium automatic movement watch with 22K gold case and sapphire crystal. Swiss precision.', images: ['https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500'], goldType: '22K', weight: '85.0g', stock: 5, rating: 4.9, numReviews: 8, featured: true, bestSeller: true },
    { name: 'Diamond Bezel Watch', price: 180000, category: 'Watches', description: 'Luxury timepiece with diamond-studded bezel in 18K white gold. 42mm case with date display.', images: ['https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=500'], goldType: '18K', weight: '95.0g', stock: 3, rating: 5.0, numReviews: 5, bestSeller: true },
    { name: 'Classic Gold Watch', price: 65000, category: 'Watches', description: 'Timeless dress watch in polished 18K gold with leather strap. Elegant minimalist dial.', images: ['https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=500'], goldType: '18K', weight: '45.0g', stock: 12, rating: 4.6, numReviews: 18 },
    { name: 'Rose Gold Ladies Watch', price: 55000, category: 'Watches', description: 'Feminine rose gold watch with mother-of-pearl dial and diamond hour markers.', images: ['https://images.unsplash.com/photo-1549972574-8e3e1e6e6592?w=500'], goldType: '18K', weight: '35.0g', stock: 15, rating: 4.7, numReviews: 22, featured: true }
];

async function runSeed() {
    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});

    // Create admin user
    await User.create({
        name: 'Admin',
        email: 'admin@jewellery.com',
        password: 'admin123',
        phone: '9999999999',
        role: 'admin'
    });
    console.log('Admin user created: admin@jewellery.com / admin123');

    // Create sample user
    await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'user123',
        phone: '8888888888',
        role: 'user'
    });
    console.log('Sample user created: john@example.com / user123');

    // Create products
    await Product.insertMany(products);
    console.log(`${products.length} products seeded`);
}

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        await runSeed();

        console.log('Seed completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    seed();
} else {
    module.exports = { runSeed };
}
