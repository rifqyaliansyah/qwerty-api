const ViewModel = require('../models/viewModel');
const crypto = require('crypto');

class ViewController {
    // POST /view - Track page view
    static async trackView(req, res) {
        try {
            const { url, sessionId } = req.body;

            // Validasi URL
            if (!url) {
                return res.status(400).json({
                    success: false,
                    message: 'URL is required'
                });
            }

            // Generate session ID jika tidak ada
            const finalSessionId = sessionId || crypto.randomBytes(16).toString('hex');

            // Tracking data
            const trackingData = {
                url,
                sessionId: finalSessionId
            };

            // Simpan view
            const result = await ViewModel.addView(trackingData);

            // Jika skipped karena duplicate, tetap return success
            if (result.skipped) {
                return res.status(200).json({
                    success: true,
                    message: 'View already tracked',
                    data: {
                        url,
                        sessionId: finalSessionId,
                        skipped: true
                    }
                });
            }

            return res.status(201).json({
                success: true,
                message: 'View tracked successfully',
                data: {
                    url,
                    sessionId: finalSessionId,
                    timestamp: new Date()
                }
            });
        } catch (error) {
            console.error('Error tracking view:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to track view',
                error: error.message
            });
        }
    }

    // GET /stats - Get statistics
    static async getStats(req, res) {
        try {
            const { type, period, limit } = req.query;

            let data;

            switch (type) {
                case 'total':
                    data = {
                        total_views: await ViewModel.getTotalViews(),
                        unique_visitors: await ViewModel.getUniqueVisitors()
                    };
                    break;

                case 'pages':
                    data = {
                        pages: await ViewModel.getViewsByPage()
                    };
                    break;

                case 'top':
                    const topLimit = parseInt(limit) || 10;
                    data = {
                        top_pages: await ViewModel.getTopPages(topLimit)
                    };
                    break;

                case 'period':
                    const days = parseInt(period) || 7;
                    data = {
                        period: `${days} days`,
                        views: await ViewModel.getViewsByPeriod(days)
                    };
                    break;

                case 'today':
                    data = await ViewModel.getTodayStats();
                    break;

                case 'comprehensive':
                default:
                    data = await ViewModel.getComprehensiveStats();
                    break;
            }

            return res.status(200).json({
                success: true,
                data
            });
        } catch (error) {
            console.error('Error getting stats:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to get statistics',
                error: error.message
            });
        }
    }
}

module.exports = ViewController;