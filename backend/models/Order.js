const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        price: Number,
        quantity: { type: Number, default: 1 },
        image: String
    }],
    totalPrice: { type: Number, required: true },
    address: {
        name: String,
        phone: String,
        street: String,
        city: String,
        pincode: String
    },
    paymentMethod: { type: String, enum: ['COD', 'Online'], default: 'COD' },
    couponCode: { type: String, default: null },
    discountAmount: { type: Number, default: 0 },
    status: { type: String, enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },
    cancellation: {
        reason: { type: String, default: '' },
        status: { type: String, enum: ['None', 'Pending', 'Approved', 'Rejected'], default: 'None' },
        requestedAt: { type: Date },
        processedAt: { type: Date }
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
