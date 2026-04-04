const router = require('express').Router();
const { sendOtp, verifyOtp, resetPassword } = require('../controllers/otpController');

router.post('/send', sendOtp);
router.post('/verify', verifyOtp);
router.post('/reset-password', resetPassword);

module.exports = router;
