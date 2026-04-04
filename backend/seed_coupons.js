const mongoose = require('mongoose');
const Coupon = require('./models/Coupon');
require('dotenv').config();

const coupons = [
    {
        code: 'LUXE10',
        discountType: 'percentage',
        discountValue: 10,
        minOrderAmount: 0,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        description: 'Get 10% off on all orders!'
    },
    {
        code: 'WELCOME500',
        discountType: 'fixed',
        discountValue: 500,
        minOrderAmount: 5000,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        description: 'New user special: ₹500 off on orders over ₹5,000.'
    },
    {
        code: 'FESTIVE25',
        discountType: 'percentage',
        discountValue: 25,
        minOrderAmount: 10000,
        expiryDate: new Date('2026-12-31'),
        description: 'Festive Season Special: 25% off on orders above ₹10,000.'
    }
];

async function seedCoupons() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB.');

        for (const couponData of coupons) {
            const existing = await Coupon.findOne({ code: couponData.code });
            if (existing) {
                console.log(`Coupon ${couponData.code} already exists.`);
                continue;
            }
            await Coupon.create(couponData);
            console.log(`Created coupon: ${couponData.code}`);
        }

        console.log('Seed completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding coupons:', err);
        process.exit(1);
    }
}

seedCoupons();
