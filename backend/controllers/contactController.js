const { sendContactEmail } = require('../utils/emailService');

exports.submitContactForm = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ message: 'Please provide name, email and message.' });
        }

        // Send email to admin in background
        sendContactEmail({ name, email, subject, message })
            .catch(err => console.error('Background contact email error:', err));

        res.status(200).json({ message: 'Thank you for your message. We will get back to you soon.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
