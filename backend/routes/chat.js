const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// @route   POST /api/chat/send
// @desc    Process AI Chat message
// @access  Public
router.post('/send', chatController.handleChat);

module.exports = router;
