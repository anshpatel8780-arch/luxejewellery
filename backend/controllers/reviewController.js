const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

exports.createReview = async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;

        // Check if user has purchased and received this product
        const hasPurchased = await Order.findOne({
            userId: req.user._id,
            'products.productId': productId,
            status: 'Delivered'
        });

        if (!hasPurchased) {
            return res.status(403).json({ 
                message: 'You can only review products you have purchased and received.' 
            });
        }

        const existing = await Review.findOne({ userId: req.user._id, productId });
        if (existing) return res.status(400).json({ message: 'You already reviewed this product' });

        const review = await Review.create({ userId: req.user._id, productId, rating, comment });

        // Update product rating
        const reviews = await Review.find({ productId });
        const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
        await Product.findByIdAndUpdate(productId, { rating: Math.round(avgRating * 10) / 10, numReviews: reviews.length });

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.checkEligibility = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user._id;

        const hasPurchased = await Order.findOne({
            userId,
            'products.productId': productId,
            status: 'Delivered'
        });

        const hasReviewed = await Review.findOne({ userId, productId });

        res.json({
            isEligible: !!hasPurchased && !hasReviewed,
            reason: !hasPurchased ? 'NOT_PURCHASED' : (hasReviewed ? 'ALREADY_REVIEWED' : 'ELIGIBLE')
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getProductReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ productId: req.params.productId })
            .populate('userId', 'name')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
