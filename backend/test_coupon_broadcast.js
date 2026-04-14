const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { sendCouponAnnouncementEmail } = require('./utils/emailService');

dotenv.config();

const testBroadcast = async () => {
    try {
        // Connect to DB if needed, but here we'll just mock a user and coupon
        const mockUser = {
            name: 'Test Customer',
            email: process.env.EMAIL_FROM // Send to self for testing
        };

        const mockCoupon = {
            code: 'KAIRO_TEST_CODE',
            discountType: 'percentage',
            discountValue: 15,
            description: 'This is a test broadcast to verify branding and delivery.'
        };

        console.log('🧪 Starting test broadcast for coupon...');
        await sendCouponAnnouncementEmail(mockUser, mockCoupon);
        console.log('✅ Test email sent check your inbox!');
        
        process.exit(0);
    } catch (err) {
        console.error('❌ Test failed:', err);
        process.exit(1);
    }
};

testBroadcast();
