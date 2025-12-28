const express = require('express');
const router = express.Router();
const quoteController = require('../controllers/quoteController');
const authMiddleware = require('../middleware/authMiddleware');

// Generate random quote (butuh auth biar ga di-spam)
router.get('/generate', authMiddleware, quoteController.generateQuote);

// Generate custom quote by topic (butuh auth)
router.post('/generate/custom', authMiddleware, quoteController.generateCustomQuote);

module.exports = router;