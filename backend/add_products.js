const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

const newProducts = [
    { name: 'Rose Gold Heart Pendant', price: 1500, category: 'Necklaces', description: 'A delicate rose gold heart pendant, perfect for everyday elegance. High-quality polish and finish.', images: ['rose_gold_heart_pendant_1775154071326.png'], goldType: '18K', weight: '2.5g', stock: 25, rating: 4.8, numReviews: 12 },
    { name: 'Silver Infinity Bracelet', price: 2500, category: 'Bracelets', description: 'Sterling silver infinity bracelet symbolizing eternal love. Sleek and modern design.', images: ['silver_infinity_bracelet_1775154087542.png'], goldType: 'Silver', weight: '4.2g', stock: 15, rating: 4.7, numReviews: 8 },
    { name: 'Classic Pearl Earrings', price: 3500, category: 'Earrings', description: 'Elegant white freshwater pearls with 22K gold backings. A timeless addition to any collection.', images: ['classic_pearl_earrings_1775154103921.png'], goldType: '22K', weight: '3.8g', stock: 12, rating: 4.9, numReviews: 21 },
    { name: 'Diamond Studded Nose Pin', price: 5500, category: 'Rings', description: 'A brilliant single-stone diamond nose pin in a 22K gold setting. Minimalist and chic.', images: ['diamond_nose_pin_1775154124186.png'], goldType: '22K', weight: '0.5g', stock: 30, rating: 4.6, numReviews: 15 },
    { name: 'Elegant Gold Anklet', price: 8500, category: 'Bracelets', description: 'Beautifully crafted 22K gold anklet with delicate charms. Traditional yet contemporary.', images: ['elegant_gold_anklet_1775154145453.png'], goldType: '22K', weight: '6.5g', stock: 10, rating: 4.8, numReviews: 7 },
    { name: 'Minimalist Band Ring', price: 4500, category: 'Rings', description: 'A simple and elegant 22K gold band ring, perfect for stacking or wearing alone.', images: ['minimalist_band_ring_1775154161807.png'], goldType: '22K', weight: '3.2g', stock: 20, rating: 4.5, numReviews: 19 }
];

async function addProducts() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected successfully.');

        console.log('Adding 6 products...');
        await Product.insertMany(newProducts);
        
        console.log('Successfully added 6 products!');
        process.exit(0);
    } catch (err) {
        console.error('An error occurred:', err);
        process.exit(1);
    }
}

addProducts();
