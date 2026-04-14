require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

async function runTest() {
    console.log('--- Email Delivery Test ---');
    console.log(`Connecting to: ${process.env.EMAIL_HOST}:${process.env.EMAIL_PORT}`);
    console.log(`User: ${process.env.EMAIL_USER}`);

    try {
        console.log('1. Verifying SMTP Connection...');
        await transporter.verify();
        console.log('✓ SMTP Connection OK');

        console.log('2. Sending Test Email...');
        const info = await transporter.sendMail({
            from: `"Kairo Test" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Send to self
            subject: '📦 SMTP Delivery Test',
            text: 'Your email server is configured correctly!',
            html: '<h3>Success!</h3><p>Your email server is configured correctly for <b>Kairo Jewellery</b>.</p>',
        });

        console.log('✓ Email Sent Successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Accepted Recipients:', info.accepted);
    } catch (err) {
        console.error('✘ Error:', err.message);
        if (err.code === 'EAUTH') {
            console.error('Advice: Authentication failed. Please check your EMAIL_PASS (App Password).');
        } else if (err.code === 'ESOCKET') {
            console.error('Advice: Connection timed out. Check firewall or port (587/465).');
        }
    }
}

runTest();
