const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    category: { type: String, required: true, enum: ['Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Watches'] },
    description: { type: String, required: true },
    images: [{ type: String }],
    goldType: { type: String, enum: ['18K', '22K', '24K', 'Silver', 'Platinum'], default: '22K' },
    weight: { type: String, default: '' },
    stock: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    bestSeller: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

productSchema.index({ name: 'text', description: 'text', category: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });

module.exports = mongoose.model('Product', productSchema);
