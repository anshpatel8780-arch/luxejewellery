const Product = require('../models/Product');

exports.getProducts = async (req, res) => {
    try {
        const { category, goldType, minPrice, maxPrice, rating, sort, search, page = 1, limit = 12, featured, bestSeller } = req.query;
        let query = {};

        if (category) query.category = category;
        if (goldType) query.goldType = goldType;
        if (rating) query.rating = { $gte: Number(rating) };
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }
        if (featured === 'true') query.featured = true;
        if (bestSeller === 'true') query.bestSeller = true;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ];
        }

        let sortOption = { createdAt: -1 };
        if (sort === 'price_asc') sortOption = { price: 1 };
        else if (sort === 'price_desc') sortOption = { price: -1 };
        else if (sort === 'rating') sortOption = { rating: -1 };

        const total = await Product.countDocuments(query);
        const products = await Product.find(query)
            .sort(sortOption)
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        res.json({ products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const productData = { ...req.body };
        
        let images = [];
        if (req.body.images) {
            images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
        }

        if (req.files && req.files.length > 0) {
            const uploadedImages = req.files.map(file => file.path);
            images = [...images, ...uploadedImages];
        }

        productData.images = images;
        const product = await Product.create(productData);
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const productData = { ...req.body };
        
        let images = [];
        if (req.body.images) {
            images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
        }

        if (req.files && req.files.length > 0) {
            const uploadedImages = req.files.map(file => file.path);
            images = [...images, ...uploadedImages];
        }

        if (images.length > 0) {
            productData.images = images;
        }

        const product = await Product.findByIdAndUpdate(req.params.id, productData, { new: true });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getStats = async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const categories = await Product.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        res.json({ totalProducts, categories });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
