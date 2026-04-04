const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const user = await User.create({ name, email, password, phone });
        const token = generateToken(user._id, user.role);

        res.status(201).json({
            token,
            user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, image: user.image }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid email or password' });
        if (user.isSuspended) return res.status(403).json({ message: 'Your account has been suspended. Please contact support.' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

        user.lastLogin = new Date();
        await user.save();

        const token = generateToken(user._id, user.role);
        res.json({
            token,
            user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, image: user.image, isSuspended: user.isSuspended, lastLogin: user.lastLogin }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getProfile = async (req, res) => {
    res.json(req.user);
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.toggleSuspension = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        user.isSuspended = !user.isSuspended;
        await user.save();
        
        res.json({ message: `User ${user.isSuspended ? 'suspended' : 'activated'} successfully`, isSuspended: user.isSuspended });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { name, phone } = req.body;
        if (name) user.name = name;
        if (phone) user.phone = phone;

        await user.save();
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            addresses: user.addresses,
            image: user.image,
            createdAt: user.createdAt
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateProfileImage = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'Please upload a file' });
        console.log('UPLOADED FILE:', req.file);

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const imagePath = req.file.path;
        user.image = imagePath;
        await user.save();

        res.json({ image: imagePath });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
