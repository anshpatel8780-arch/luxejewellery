const User = require('../models/User');
const Otp = require('../models/Otp');
const { generateOTP, sendOTPEmail } = require('../utils/emailService');

const OTP_RATE_WINDOW_MS = 15 * 60 * 1000;
const OTP_MAX_PER_WINDOW = 3;

const checkRateLimit = async (email, purpose) => {
    const since = new Date(Date.now() - OTP_RATE_WINDOW_MS);
    const recentCount = await Otp.countDocuments({
        email,
        purpose,
        createdAt: { $gte: since },
    });
    return recentCount >= OTP_MAX_PER_WINDOW;
};

exports.sendOtp = async (req, res) => {
    try {
        const { email, purpose = 'register-verify' } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        const validPurposes = ['register-verify', 'forgot-password', 'login-verify'];
        if (!validPurposes.includes(purpose)) {
            return res.status(400).json({ message: 'Invalid OTP purpose' });
        }

        if (purpose === 'forgot-password') {
            const user = await User.findOne({ email });
            if (!user) return res.status(404).json({ message: 'No account found with this email' });
        }

        if (purpose === 'register-verify') {
            const user = await User.findOne({ email });
            if (user) return res.status(400).json({ message: 'An account with this email already exists' });
        }

        const rateLimited = await checkRateLimit(email, purpose);
        if (rateLimited) {
            return res.status(429).json({
                message: 'Too many OTP requests. Please wait 15 minutes before trying again.',
            });
        }

        await Otp.deleteMany({ email, purpose });

        const otpCode = generateOTP();
        await Otp.create({
            email,
            purpose,
            otp: otpCode,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        });

        await sendOTPEmail(email, otpCode, purpose);

        return res.status(200).json({
            message: `OTP sent successfully to ${email}. It is valid for 10 minutes.`,
        });
    } catch (error) {
        console.error('sendOtp error:', error.message);
        let message = 'Failed to send OTP. Please try again.';
        if (error.code === 'EAUTH' || error.message.includes('credentials')) {
            message = 'Email authentication failed. Please check your App Password on Render.';
        }
        return res.status(500).json({ message });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp, purpose = 'register-verify' } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        const record = await Otp.findOne({ email, purpose });
        if (!record) {
            return res.status(400).json({ message: 'OTP not found or has expired. Please request a new one.' });
        }

        if (record.attempts >= 5) {
            await Otp.deleteOne({ _id: record._id });
            return res.status(400).json({
                message: 'Too many incorrect attempts. Please request a new OTP.',
            });
        }

        if (record.otp !== otp.toString().trim()) {
            record.attempts += 1;
            await record.save();
            const remaining = 5 - record.attempts;
            return res.status(400).json({
                message: `Incorrect OTP. ${remaining} attempt(s) remaining.`,
            });
        }

        if (purpose !== 'forgot-password') {
            await Otp.deleteOne({ _id: record._id });
        }

        return res.status(200).json({
            message: 'OTP verified successfully.',
            verified: true,
        });
    } catch (error) {
        console.error('verifyOtp error:', error);
        return res.status(500).json({ message: 'OTP verification failed. Please try again.' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: 'email, otp, and newPassword are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const record = await Otp.findOne({ email, purpose: 'forgot-password' });
        if (!record) {
            return res.status(400).json({ message: 'OTP not found or has expired. Please request a new one.' });
        }

        if (record.attempts >= 5) {
            await Otp.deleteOne({ _id: record._id });
            return res.status(400).json({ message: 'Too many incorrect attempts. Please request a new OTP.' });
        }

        if (record.otp !== otp.toString().trim()) {
            record.attempts += 1;
            await record.save();
            const remaining = 5 - record.attempts;
            return res.status(400).json({
                message: `Incorrect OTP. ${remaining} attempt(s) remaining.`,
            });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.password = newPassword;
        await user.save();

        await Otp.deleteOne({ _id: record._id });

        return res.status(200).json({ message: 'Password reset successfully. You can now log in.' });
    } catch (error) {
        console.error('resetPassword error:', error);
        return res.status(500).json({ message: 'Password reset failed. Please try again.' });
    }
};
