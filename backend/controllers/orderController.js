const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');
const Product = require('../models/Product');
const AuditLog = require('../models/AuditLog');
const { generateInvoicePDF } = require('../utils/pdfGenerator');
const { sendOrderCancellationEmail, sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } = require('../utils/emailService');

exports.createOrder = async (req, res) => {
    try {
        const { products, totalPrice, address, paymentMethod, couponCode, discountAmount } = req.body;

        // Validate stock availability
        const stockChecks = products.map(item =>
            Product.findById(item.productId).select('stock name').lean()
        );
        const productDocs = await Promise.all(stockChecks);
        for (let i = 0; i < products.length; i++) {
            const doc = productDocs[i];
            if (!doc) return res.status(404).json({ message: `Product not found.` });
            if (doc.stock < products[i].quantity) {
                return res.status(400).json({ message: `"${doc.name}" has only ${doc.stock} items in stock.` });
            }
        }

        // Create order
        const order = await Order.create({
            userId: req.user._id,
            products,
            totalPrice,
            address,
            paymentMethod,
            couponCode: couponCode || null,
            discountAmount: discountAmount || 0
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
                // req.user is already populated by auth middleware
                if (req.user && req.user.email) {
                    console.log(`📡 [Order #${order._id}] Starting background task for invoice email...`);
                    
                    // Convert Mongoose Doc to Plain Object to avoid proxy/rehydration issues in PDFKit
                    const orderObj = order.toObject();
                    const pdfBuffer = await generateInvoicePDF(orderObj);
                    
                    console.log(`📜 [Order #${order._id}] Invoice PDF generated (Buffer size: ${pdfBuffer.length} bytes)`);
                    
                    await sendOrderConfirmationEmail(req.user, orderObj, pdfBuffer);
                    console.log(`📧 [Order #${order._id}] Order confirmation email triggered successfully!`);
                } else {
                    console.warn(`⚠️ [Order #${order._id}] No user or email found! Email will not be sent.`);
                }
            } catch (emailErr) {
                console.error(`❌ [Order #${order._id}] Critical failure in email background task:`, emailErr);
            }
        })();

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('userId', 'name email').sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // If status is being changed to Cancelled, and it wasn't already Cancelled
        if (status === 'Cancelled' && order.status !== 'Cancelled') {
            const stockUpdates = order.products.map(item => ({
                updateOne: {
                    filter: { _id: item.productId },
                    update: { $inc: { stock: item.quantity } }
                }
            }));
            await Product.bulkWrite(stockUpdates);
        }

        order.status = status;
        await order.save();
        
        // Trigger Status Update Email (Asynchronous)
        (async () => {
            try {
                const user = await User.findById(order.userId);
                if (user && user.email) {
                    await sendOrderStatusUpdateEmail(user, order);
                }
            } catch (err) {
                console.error('Failed to trigger status update email:', err);
            }
        })();
        
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getOrderStats = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const totalRevenue = await Order.aggregate([
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);
        const totalUsers = await User.countDocuments({ role: 'user' });
        
        // Status Distribution
        const statusCounts = await Order.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Monthly Sales (for bar chart)
        const monthlySales = await Order.aggregate([
            { $group: { _id: { $month: '$createdAt' }, total: { $sum: '$totalPrice' }, count: { $sum: 1 } } },
            { $sort: { '_id': 1 } }
        ]);

        // Daily Sales Trend (Last 30 Days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const salesTrend = await Order.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, total: { $sum: '$totalPrice' } } },
            { $sort: { '_id': 1 } }
        ]);

        // Top Selling Products (Aggregated Quantities)
        const topProducts = await Order.aggregate([
            { $unwind: '$products' },
            { $group: { _id: '$products.name', quantity: { $sum: '$products.quantity' } } },
            { $match: { quantity: { $gt: 0 } } },
            { $sort: { quantity: -1 } },
            { $limit: 10 }
        ]);

        res.json({
            totalOrders,
            totalRevenue: totalRevenue[0]?.total || 0,
            totalUsers,
            statusCounts,
            monthlySales,
            salesTrend: salesTrend.length > 0 ? salesTrend : [{ _id: new Date().toISOString().split('T')[0], total: 0 }],
            topProducts: topProducts.length > 0 ? topProducts : [{ _id: 'No Sales Yet', quantity: 0 }]
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// USER: Cancel Order (Instant or Request)
exports.cancelOrderAction = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const order = await Order.findById(id);

        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.status === 'Cancelled') return res.status(400).json({ message: 'Order already cancelled' });
        if (order.status === 'Delivered') return res.status(400).json({ message: 'Delivered orders cannot be cancelled' });

        // Rule for Instant Cancellation (Pending/Confirmed/Processing)
        if (order.status === 'Pending' || order.status === 'Confirmed' || order.status === 'Processing') {
            order.status = 'Cancelled';
            order.cancellation = {
                reason,
                status: 'Approved',
                processedAt: Date.now()
            };

            // Restore Stock
            const stockUpdates = order.products.map(item => ({
                updateOne: {
                    filter: { _id: item.productId },
                    update: { $inc: { stock: item.quantity } }
                }
            }));
            await Product.bulkWrite(stockUpdates);

            await order.save();

            // Log activity
            await AuditLog.create({
                orderId: id,
                userId: req.user._id,
                action: 'CANCEL_INSTANT',
                details: `Reason: ${reason}`
            });

            // Send Email
            try {
                const user = await User.findById(order.userId);
                if (user) await sendOrderCancellationEmail(user, order, 'CANCEL_INSTANT');
            } catch (err) {
                console.error('Email error:', err);
            }

            let message = 'Order cancelled successfully';
            if (order.paymentMethod === 'Online') {
                message += '. Your payment will be refunded soon.';
            }
            return res.json({ message, order });
        }

        // Rule for Cancellation Request (Shipped)
        if (order.status === 'Shipped') {
            order.cancellation = {
                reason,
                status: 'Pending',
                requestedAt: Date.now()
            };

            await order.save();

            // Log activity
            await AuditLog.create({
                orderId: id,
                userId: req.user._id,
                action: 'CANCEL_REQUESTED',
                details: `Reason: ${reason}`
            });

            // Send Email
            try {
                const user = await User.findById(order.userId);
                if (user) await sendOrderCancellationEmail(user, order, 'CANCEL_REQUESTED');
            } catch (err) {
                console.error('Email error:', err);
            }

            let message = 'Cancellation request submitted';
            if (order.paymentMethod === 'Online') {
                message += '. If approved, your payment will be refunded.';
            }
            return res.json({ message, order });
        }

        res.status(400).json({ message: 'Invalid order status for cancellation' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ADMIN: Fetch Cancellation Requests
exports.getCancellationRequests = async (req, res) => {
    try {
        const requests = await Order.find({ 'cancellation.status': 'Pending' })
            .populate('userId', 'name email')
            .sort({ 'cancellation.requestedAt': -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ADMIN: Process Cancellation Request
exports.processCancellationRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, adminNote } = req.body; // action: 'Approved' or 'Rejected'
        const order = await Order.findById(id);

        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.cancellation.status !== 'Pending') return res.status(400).json({ message: 'No pending request found' });

        if (action === 'Approved') {
            order.status = 'Cancelled';
            order.cancellation.status = 'Approved';
            order.cancellation.processedAt = Date.now();
            order.cancellation.adminNote = adminNote;

            // Restore Stock
            const stockUpdates = order.products.map(item => ({
                updateOne: {
                    filter: { _id: item.productId },
                    update: { $inc: { stock: item.quantity } }
                }
            }));
            await Product.bulkWrite(stockUpdates);

            await order.save();

            // Log activity
            await AuditLog.create({
                orderId: id,
                userId: req.user._id,
                action: 'CANCEL_APPROVED',
                details: adminNote || 'Admin approved cancellation'
            });

            // Send Email
            try {
                const user = await User.findById(order.userId);
                if (user) await sendOrderCancellationEmail(user, order, 'CANCEL_APPROVED');
            } catch (err) {
                console.error('Email error:', err);
            }

            let message = 'Order cancellation approved';
            if (order.paymentMethod === 'Online') {
                message += '. Refund will be processed.';
            }
            return res.json({ message, order });
        } else if (action === 'Rejected') {
            order.cancellation.status = 'Rejected';
            order.cancellation.processedAt = Date.now();
            order.cancellation.adminNote = adminNote;
            
            await order.save();

            // Log activity
            await AuditLog.create({
                orderId: id,
                userId: req.user._id,
                action: 'CANCEL_REJECTED',
                details: adminNote || 'Admin rejected cancellation'
            });

            // Send Email
            try {
                const user = await User.findById(order.userId);
                if (user) await sendOrderCancellationEmail(user, order, 'CANCEL_REJECTED');
            } catch (err) {
                console.error('Email error:', err);
            }

            return res.json({ message: 'Order cancellation rejected', order });
        }

        res.status(400).json({ message: 'Invalid action' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.generateInvoice = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('userId', 'name email');
        if (!order) return res.status(404).json({ message: 'Order not found' });
        
        // Prevent invoice download for cancelled orders
        if (order.status === 'Cancelled') {
            return res.status(403).json({ message: 'Invoice cannot be generated for cancelled orders.' });
        }

        const pdfBuffer = await generateInvoicePDF(order);
        let filename = `Invoice_${order._id.toString().slice(-8).toUpperCase()}.pdf`;
        
        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');
        res.send(pdfBuffer);
    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({ message: error.message });
        }
    }
};
