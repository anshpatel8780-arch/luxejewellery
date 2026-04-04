const mongoose = require('mongoose');
const Order = require('./models/Order');
require('dotenv').config();

async function cleanupOrders() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const result = await Order.updateMany(
            { paymentMethod: 'Online', status: 'Pending' }, 
            { $set: { status: 'Confirmed' } }
        );
        console.log(`Successfully migrated ${result.modifiedCount} online orders to 'Confirmed' status.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

cleanupOrders();
