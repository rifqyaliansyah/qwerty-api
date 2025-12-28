const Groq = require('groq-sdk');

// Validasi API key saat startup
if (!process.env.GROQ_API_KEY) {
    console.error('❌ GROQ_API_KEY tidak ditemukan di .env');
}

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const aiHelper = {
    /**
     * Generate random motivational quote using Groq AI
     * @returns {Promise<string>} Generated quote
     */
    async generateRandomQuote() {
        try {
            // Cek API key
            if (!process.env.GROQ_API_KEY) {
                throw new Error('API key tidak dikonfigurasi');
            }

            const prompts = [
                "Buatkan 1 kata-kata motivasi singkat dalam bahasa Indonesia tentang kehidupan, maksimal 2 kalimat, tanpa tanda petik, langsung isi kata-katanya saja.",
                "Buatkan 1 quote inspiratif singkat dalam bahasa Indonesia tentang kesuksesan, maksimal 2 kalimat, tanpa tanda petik, langsung isi kata-katanya saja.",
                "Buatkan 1 kata-kata bijak singkat dalam bahasa Indonesia tentang kebahagiaan, maksimal 2 kalimat, tanpa tanda petik, langsung isi kata-katanya saja.",
                "Buatkan 1 quote singkat dalam bahasa Indonesia tentang mimpi dan harapan, maksimal 2 kalimat, tanpa tanda petik, langsung isi kata-katanya saja.",
                "Buatkan 1 kata-kata penyemangat singkat dalam bahasa Indonesia tentang usaha dan kerja keras, maksimal 2 kalimat, tanpa tanda petik, langsung isi kata-katanya saja."
            ];

            // Random pilih prompt biar lebih variatif
            const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];

            const chatCompletion = await groq.chat.completions.create({
                messages: [
                    {
                        role: "user",
                        content: randomPrompt
                    }
                ],
                model: "llama-3.3-70b-versatile", // Model gratis & bagus
                temperature: 0.8, // Lebih kreatif
                max_tokens: 150,
            });

            // Extract text dari response
            const quote = chatCompletion.choices[0]?.message?.content?.trim() || '';

            if (!quote) {
                throw new Error('AI tidak menghasilkan response');
            }

            // Remove quotes jika ada
            return quote.replace(/^["']|["']$/g, '');
        } catch (error) {

            // Better error messages
            if (error.status === 401) {
                throw new Error('API key tidak valid');
            } else if (error.status === 429) {
                throw new Error('Terlalu banyak request, coba lagi nanti');
            } else if (error.status === 400) {
                throw new Error('Request tidak valid');
            } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
                throw new Error('Koneksi ke AI service gagal');
            } else if (error.message === 'API key tidak dikonfigurasi') {
                throw error;
            }

            throw new Error('Gagal menggenerate kata-kata: ' + error.message);
        }
    },

    /**
     * Generate custom quote based on topic
     * @param {string} topic - Topic for the quote
     * @returns {Promise<string>} Generated quote
     */
    async generateCustomQuote(topic) {
        try {
            if (!process.env.GROQ_API_KEY) {
                throw new Error('API key tidak dikonfigurasi');
            }

            const chatCompletion = await groq.chat.completions.create({
                messages: [
                    {
                        role: "user",
                        content: `Buatkan 1 kata-kata inspiratif singkat dalam bahasa Indonesia tentang ${topic}, maksimal 2 kalimat, tanpa tanda petik, langsung isi kata-katanya saja.`
                    }
                ],
                model: "llama-3.3-70b-versatile",
                temperature: 0.8,
                max_tokens: 150,
            });

            const quote = chatCompletion.choices[0]?.message?.content?.trim() || '';

            if (!quote) {
                throw new Error('AI tidak menghasilkan response');
            }

            return quote.replace(/^["']|["']$/g, '');
        } catch (error) {
            console.error('❌ Error generating custom quote:', error);

            if (error.status === 401) {
                throw new Error('API key tidak valid');
            } else if (error.status === 429) {
                throw new Error('Terlalu banyak request, coba lagi nanti');
            } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
                throw new Error('Koneksi ke AI service gagal');
            }

            throw new Error('Gagal menggenerate kata-kata: ' + error.message);
        }
    }
};

module.exports = aiHelper;