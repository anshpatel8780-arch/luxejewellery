const User = require('../models/User');

exports.getAddresses = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.status(200).json(user.addresses || []);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const { name, phone, street, city, pincode, isDefault } = req.body;

        if (!user.addresses) {
            user.addresses = [];
        }

        // If setting as default, unset others
        if (isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }

        user.addresses.push({ name, phone, street, city, pincode, isDefault });
        await user.save();
        
        res.status(201).json(user.addresses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const address = user.addresses.id(req.params.id);
        
        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        const { name, phone, street, city, pincode, isDefault } = req.body;

        if (isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }

        if (name) address.name = name;
        if (phone) address.phone = phone;
        if (street) address.street = street;
        if (city) address.city = city;
        if (pincode) address.pincode = pincode;
        if (isDefault !== undefined) address.isDefault = isDefault;

        await user.save();
        res.status(200).json(user.addresses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.addresses.pull(req.params.id);
        await user.save();
        res.status(200).json(user.addresses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
