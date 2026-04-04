const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ userId: req.user._id }).populate('products.productId');
        if (!cart) {
            cart = { products: [] };
        } else {
            // Clean orphans: products that were deleted from DB
            const initialCount = cart.products.length;
            cart.products = cart.products.filter(item => item.productId !== null);
            if (cart.products.length < initialCount) {
                cart.markModified('products');
                await cart.save();
            }
        }
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        let cart = await Cart.findOne({ userId: req.user._id });

        if (!cart) {
            if (quantity > product.stock) return res.status(400).json({ message: `Only ${product.stock} items left in stock.` });
            cart = await Cart.create({ userId: req.user._id, products: [{ productId, quantity }] });
        } else {
            const existing = cart.products.find(p => p.productId.toString() === productId);
            if (existing) {
                if (existing.quantity + quantity > product.stock) {
                    return res.status(400).json({ message: `Cannot add more. You already have ${existing.quantity} in cart and only ${product.stock} are available.` });
                }
                existing.quantity += quantity;
            } else {
                if (quantity > product.stock) return res.status(400).json({ message: `Only ${product.stock} items left in stock.` });
                cart.products.push({ productId, quantity });
            }
            await cart.save();
        }

        cart = await Cart.findOne({ userId: req.user._id }).populate('products.productId');
        // Clean orphans after population
        const initialCount = cart.products.length;
        cart.products = cart.products.filter(p => p.productId !== null);
        if (cart.products.length < initialCount) {
            cart.markModified('products');
            await cart.save();
        }

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateQuantity = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        
        if (quantity > product.stock) {
            return res.status(400).json({ message: `Only ${product.stock} items left in stock.` });
        }

        const cart = await Cart.findOne({ userId: req.user._id });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        const item = cart.products.find(p => p.productId.toString() === productId);
        if (item) {
            item.quantity = quantity;
            await cart.save();
        }

        const updatedCart = await Cart.findOne({ userId: req.user._id }).populate('products.productId');
        // Clean orphans after population
        const initialCount = updatedCart.products.length;
        updatedCart.products = updatedCart.products.filter(p => p.productId !== null);
        if (updatedCart.products.length < initialCount) {
            updatedCart.markModified('products');
            await updatedCart.save();
        }

        res.json(updatedCart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user._id });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        // Safe removal matching by Product ID OR the internal Item ID (for orphans)
        cart.products = cart.products.filter(p => 
            (p.productId && p.productId.toString() !== req.params.productId) && 
            (p._id.toString() !== req.params.productId)
        );
        await cart.save();

        const updatedCart = await Cart.findOne({ userId: req.user._id }).populate('products.productId');
        // Clean orphans after population
        const initialCount = updatedCart.products.length;
        updatedCart.products = updatedCart.products.filter(p => p.productId !== null);
        if (updatedCart.products.length < initialCount) {
            updatedCart.markModified('products');
            await updatedCart.save();
        }

        res.json(updatedCart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.clearCart = async (req, res) => {
    try {
        await Cart.findOneAndDelete({ userId: req.user._id });
        res.json({ message: 'Cart cleared' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
