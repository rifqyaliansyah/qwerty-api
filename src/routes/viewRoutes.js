const express = require('express');
const router = express.Router();
const ViewController = require('../controllers/viewController');

// POST /api/view - Track page view
router.post('/view', ViewController.trackView);

// GET /api/stats - Get statistics
// Query params:
// - type: 'total', 'pages', 'top', 'period', 'today', 'comprehensive' (default)
// - period: jumlah hari untuk stats period (default: 7)
// - limit: limit untuk top pages (default: 10)
router.get('/stats', ViewController.getStats);

module.exports = router;