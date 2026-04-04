const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Models
const Product = require('./models/Product');

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const productsData = [
    {
        name: "The Imperial Rose Cut Diamond Ring",
        price: 145000,
        category: "Rings",
        goldType: "18K",
        weight: "4.2g",
        stock: 15,
        description: "A masterfully crafted rose-gold band featuring a rare rose-cut diamond center. Elegance meets heirloom quality in this timeless symbol of sophistication.",
        featured: true,
        bestSeller: false,
        localImages: [
            "C:/Users/Admin/.gemini/antigravity/brain/5d4edd90-0c3d-4047-a995-bcc7965dea32/imperial_rose_ring_front_1775328870436.png",
            "C:/Users/Admin/.gemini/antigravity/brain/5d4edd90-0c3d-4047-a995-bcc7965dea32/imperial_rose_ring_side_1775328893913.png",
            "C:/Users/Admin/.gemini/antigravity/brain/5d4edd90-0c3d-4047-a995-bcc7965dea32/imperial_rose_ring_zoom_1775328931567.png",
            "C:/Users/Admin/.gemini/antigravity/brain/5d4edd90-0c3d-4047-a995-bcc7965dea32/imperial_rose_ring_lifestyle_1775328955073.png"
        ]
    },
    {
        name: "Royal Emerald Cascade Necklace",
        price: 485000,
        category: "Necklaces",
        goldType: "22K",
        weight: "28.5g",
        stock: 0,
        description: "A breath-taking arrangement of Colombian emeralds set against handcrafted 22K gold filigree. Designed for the grandest occasions, reflecting heritage and luxury.",
        featured: true,
        bestSeller: true,
        localImages: [
            "C:/Users/Admin/.gemini/antigravity/brain/5d4edd90-0c3d-4047-a995-bcc7965dea32/royal_emerald_necklace_front_1775328985557.png",
            "C:/Users/Admin/.gemini/antigravity/brain/5d4edd90-0c3d-4047-a995-bcc7965dea32/royal_emerald_necklace_side_1775329023797.png",
            "C:/Users/Admin/.gemini/antigravity/brain/5d4edd90-0c3d-4047-a995-bcc7965dea32/royal_emerald_necklace_zoom_1775329045158.png",
            "C:/Users/Admin/.gemini/antigravity/brain/5d4edd90-0c3d-4047-a995-bcc7965dea32/royal_emerald_necklace_lifestyle_1775329071733.png"
        ]
    },
    {
        name: "Starlight Solitaire Diamond Studs",
        price: 85000,
        category: "Earrings",
        goldType: "Platinum",
        weight: "2.1g",
        stock: 3,
        description: "Brilliant-cut solitaire diamonds held in secure platinum claws for maximum radiance. The perfect everyday luxury for any occasion.",
        featured: false,
        bestSeller: true,
        localImages: [
            "C:/Users/Admin/.gemini/antigravity/brain/5d4edd90-0c3d-4047-a995-bcc7965dea32/solitaire_earrings_front_1775329123320.png",
            "C:/Users/Admin/.gemini/antigravity/brain/5d4edd90-0c3d-4047-a995-bcc7965dea32/solitaire_earrings_side_1775329145886.png",
            "C:/Users/Admin/.gemini/antigravity/brain/5d4edd90-0c3d-4047-a995-bcc7965dea32/solitaire_earrings_zoom_1775329180445.png",
            "C:/Users/Admin/.gemini/antigravity/brain/5d4edd90-0c3d-4047-a995-bcc7965dea32/solitaire_earrings_lifestyle_1775329208453.png"
        ]
    },
    {
        name: "The Celestial Infinity Bangle",
        price: 210000,
        category: "Bracelets",
        goldType: "18K",
        weight: "12.8g",
        stock: 12,
        description: "An architectural masterpiece featuring interlocking infinity loops pavé-set with micro-diamonds. A contemporary classic representing eternal grace.",
        featured: false,
        bestSeller: false,
        localImages: [
            "C:/Users/Admin/.gemini/antigravity/brain/5d4edd90-0c3d-4047-a995-bcc7965dea32/infinity_bangle_front_1775329240535.png",
            "C:/Users/Admin/.gemini/antigravity/brain/5d4edd90-0c3d-4047-a995-bcc7965dea32/infinity_bangle_side_1775329261212.png",
            "C:/Users/Admin/.gemini/antigravity/brain/5d4edd90-0c3d-4047-a995-bcc7965dea32/infinity_bangle_zoom_1775329286263.png",
            "C:/Users/Admin/.gemini/antigravity/brain/5d4edd90-0c3d-4047-a995-bcc7965dea32/infinity_bangle_lifestyle_1775329306932.png"
        ]
    },
    {
        name: "Heritage Gold Chronograph",
        price: 950000,
        category: "Watches",
        goldType: "18K",
        weight: "95g",
        stock: 8,
        description: "A fusion of Swiss horology and high jewellery, featuring a gold-skeletonized dial. A statement of legacy and technical perfection.",
        featured: true,
        bestSeller: false,
        localImages: [
            "C:/Users/Admin/.gemini/antigravity/brain/5d4edd90-0c3d-4047-a995-bcc7965dea32/heritage_chronograph_front_1775329334298.png"
        ]
    }
];

async function addProducts() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        for (const prod of productsData) {
            console.log(`Uploading images for: ${prod.name}`);
            const imageUrls = [];
            
            for (const imgPath of prod.localImages) {
                if (fs.existsSync(imgPath)) {
                    const result = await cloudinary.uploader.upload(imgPath, {
                        folder: 'luxejewels/products'
                    });
                    imageUrls.push(result.secure_url);
                    console.log(`Uploaded: ${result.secure_url}`);
                } else {
                    console.warn(`File not found: ${imgPath}`);
                }
            }

            // Fallback for watch placeholder images if needed
            if (prod.category === 'Watches' && imageUrls.length < 4) {
               while (imageUrls.length < 4) imageUrls.push(imageUrls[0]);
            }

            const newProduct = new Product({
                ...prod,
                images: imageUrls,
                rating: 4.5 + Math.random() * 0.5,
                numReviews: Math.floor(Math.random() * 20) + 5
            });

            await newProduct.save();
            console.log(`Successfully added: ${prod.name}`);
        }

        console.log('All products added successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error adding products:', err);
        process.exit(1);
    }
}

addProducts();
