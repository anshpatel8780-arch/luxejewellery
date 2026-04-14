const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const User = require('../models/User');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { sendCouponAnnouncementEmail } = require('../utils/emailService');

// @route   GET /api/coupons
// @desc    Get all active coupons for users
// @access  Public
router.get('/', async (req, res) => {
    try {
        const coupons = await Coupon.find({ isActive: true, expiryDate: { $gt: new Date() } });
        res.json(coupons);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/coupons
// @desc    Create a coupon
// @access  Private/Admin
router.post('/', auth, admin, async (req, res) => {
    try {
        const { code, discountType, discountValue, minOrderAmount, expiryDate, scope, productId, description } = req.body;
        
        const existing = await Coupon.findOne({ code: code.toUpperCase() });
        if (existing) return res.status(400).json({ message: 'Coupon code already exists' });

        const newCoupon = new Coupon({
            code: code.toUpperCase(),
            discountType,
            discountValue,
            minOrderAmount,
            expiryDate,
            scope,
            productId: scope === 'product' ? productId : null,
            description
        });

        const coupon = await newCoupon.save();
        res.json(coupon);

        // Send email to all users if it's a global coupon
        if (coupon.scope === 'all') {
            (async () => {
                try {
                    const users = await User.find({}, 'name email');
                    console.log(`📡 Group Email for coupon ${coupon.code}: Targeting ${users.length} users.`);
                    
                    let successCount = 0;
                    let failCount = 0;

                    for (const user of users) {
                        try {
                            await sendCouponAnnouncementEmail(user, coupon);
                            successCount++;
                        } catch (err) {
                            console.error(`❌ Failed to send coupon email to ${user.email}:`, err.message);
                            failCount++;
                        }
                    }
                    console.log(`✅ Coupon broadcast finished: ${successCount} sent, ${failCount} failed.`);
                } catch (err) {
                    console.error('❌ Error in mass coupon email broadcast:', err);
                }
            })();
        }
    } catch (err) {
        console.error('Coupon Creation Error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/coupons/:id
// @desc    Delete a coupon
// @access  Private/Admin
router.delete('/:id', auth, admin, async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) return res.status(404).json({ message: 'Coupon not found' });

        await coupon.deleteOne();
        res.json({ message: 'Coupon removed' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/coupons/validate
// @desc    Validate a coupon code
// @access  Private
router.post('/validate', auth, async (req, res) => {
    try {
        const { code, cartItems, subtotal } = req.body;
        const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

        if (!coupon) return res.status(404).json({ message: 'Invalid coupon code' });
        if (new Date() > coupon.expiryDate) return res.status(400).json({ message: 'Coupon has expired' });
        if (subtotal < coupon.minOrderAmount) return res.status(400).json({ message: `Minimum purchase of ₹${coupon.minOrderAmount} required` });

        let discount = 0;
        if (coupon.scope === 'all') {
            discount = coupon.discountType === 'percentage' 
                ? (subtotal * coupon.discountValue) / 100 
                : coupon.discountValue;
        } else if (coupon.scope === 'product') {
            const item = cartItems.find(i => i.productId === coupon.productId.toString() || i._id === coupon.productId.toString());
            if (!item) return res.status(400).json({ message: 'Coupon is not applicable to any item in your cart' });
            
            const itemTotal = item.price * item.quantity;
            discount = coupon.discountType === 'percentage' 
                ? (itemTotal * coupon.discountValue) / 100 
                : coupon.discountValue;
        }

        res.json({ 
            valid: true, 
            discount: Math.round(discount), 
            code: coupon.code,
            message: `Coupon applied: ₹${Math.round(discount)} off!`
        });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
