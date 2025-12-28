const aiHelper = require('../helpers/aiHelper');

const quoteController = {
    /**
     * Generate random quote
     * GET /api/quotes/generate
     */
    async generateQuote(req, res, next) {
        try {
            const quote = await aiHelper.generateRandomQuote();

            res.status(200).json({
                success: true,
                message: 'Quote berhasil digenerate',
                data: {
                    quote: quote,
                    generated_at: new Date().toISOString()
                }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Generate custom quote based on topic
     * POST /api/quotes/generate/custom
     * Body: { topic: "cinta" }
     */
    async generateCustomQuote(req, res, next) {
        try {
            const { topic } = req.body;

            if (!topic || topic.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Topic tidak boleh kosong'
                });
            }

            const quote = await aiHelper.generateCustomQuote(topic);

            res.status(200).json({
                success: true,
                message: 'Quote berhasil digenerate',
                data: {
                    quote: quote,
                    topic: topic,
                    generated_at: new Date().toISOString()
                }
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = quoteController;