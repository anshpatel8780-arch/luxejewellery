const axios = require('axios');
require('dotenv').config();

const testChat = async () => {
    try {
        console.log('Testing Chat API...');
        const response = await axios.post('http://localhost:5000/api/chat/send', {
            message: 'Hello, what gold rings do you have?',
            history: [
                { role: 'bot', content: 'Welcome to LuxeJewels! I am your AI Assistant. How can I help you discover our premium handcrafted jewellery today?' }
            ]
        });

        console.log('Response from AI:', response.data.response);
    } catch (error) {
        console.error('Chat API Test Failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
};

testChat();
