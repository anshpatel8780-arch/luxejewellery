const Wishlist = require('../models/Wishlist');

exports.getWishlist = async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ userId: req.user._id }).populate('products');
        if (!wishlist) wishlist = { products: [] };
        res.json(wishlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        let wishlist = await Wishlist.findOne({ userId: req.user._id });

        if (!wishlist) {
            wishlist = await Wishlist.create({ userId: req.user._id, products: [productId] });
        } else {
            if (!wishlist.products.includes(productId)) {
                wishlist.products.push(productId);
                await wishlist.save();
            }
        }

        wishlist = await Wishlist.findOne({ userId: req.user._id }).populate('products');
        res.json(wishlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.removeFromWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ userId: req.user._id });
        if (!wishlist) return res.status(404).json({ message: 'Wishlist not found' });

        wishlist.products = wishlist.products.filter(p => p.toString() !== req.params.productId);
        await wishlist.save();

        const updated = await Wishlist.findOne({ userId: req.user._id }).populate('products');
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
