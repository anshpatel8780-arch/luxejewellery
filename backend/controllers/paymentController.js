const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { generateInvoicePDF } = require('../utils/pdfGenerator');
const { sendOrderConfirmationEmail } = require('../utils/emailService');

exports.createPaymentOrder = async (req, res) => {
    try {
        const { amount } = req.body;
        
        if (!amount) {
            return res.status(400).json({ message: 'Amount is required' });
        }

        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const options = {
            amount: Math.round(amount * 100), // convert to paise
            currency: 'INR',
            receipt: 'receipt_order_' + Date.now()
        };

        const order = await instance.orders.create(options);

        if (!order) {
            return res.status(500).json({ message: 'Error originating order.' });
        }

        res.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency
        });
    } catch (error) {
        console.error('Razorpay Order error:', error);
        res.status(500).json({ message: error.message || 'Something went wrong' });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            products,
            totalPrice,
            address,
            paymentMethod
        } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Validate stock before saving order
            const productDocs = await Promise.all(
                products.map(item => Product.findById(item.productId).select('stock name').lean())
            );
            for (let i = 0; i < products.length; i++) {
                const doc = productDocs[i];
                if (!doc) return res.status(404).json({ message: 'Product not found.' });
                if (doc.stock < products[i].quantity) {
                    return res.status(400).json({ message: `"${doc.name}" has only ${doc.stock} items in stock.` });
                }
            }

            // Save order with valid enum paymentMethod value
            const order = await Order.create({
                userId: req.user._id,
                products,
                totalPrice,
                address,
                paymentMethod: 'Online',
                status: 'Confirmed'
            });

            // Decrement stock and clear cart in parallel
            const stockUpdates = products.map(item => ({
                updateOne: {
                    filter: { _id: item.productId },
                    update: { $inc: { stock: -item.quantity } }
                }
            }));
            await Promise.all([
                Product.bulkWrite(stockUpdates),
                Cart.findOneAndDelete({ userId: req.user._id })
            ]);

            // Generate Invoice and Send Email (Asynchronous)
            (async () => {
                try {
                    if (req.user && req.user.email) {
                        console.log(`📡 [Order #${order._id}] Starting background task for online invoice email...`);
                        
                        // Convert Mongoose Doc to Plain Object
                        const orderObj = order.toObject();
                        const pdfBuffer = await generateInvoicePDF(orderObj);
                        
                        console.log(`📜 [Order #${order._id}] Online Invoice PDF generated (Buffer size: ${pdfBuffer.length} bytes)`);
                        
                        await sendOrderConfirmationEmail(req.user, orderObj, pdfBuffer);
                        console.log(`📧 [Order #${order._id}] Online order confirmation email triggered successfully!`);
                    } else {
                        console.warn(`⚠️ [Order #${order._id}] No user or email found for online order! Email will not be sent.`);
                    }
                } catch (emailErr) {
                    console.error(`❌ [Order #${order._id}] Critical failure in online email background task:`, emailErr);
                }
            })();

            res.status(201).json(order);
        } else {
            res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
