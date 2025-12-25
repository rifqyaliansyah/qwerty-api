// Helper untuk generate avatar URL menggunakan DiceBear API

const avatarHelper = {
    /**
     * Generate avatar URL menggunakan monochrome style
     * @param {string} seed - Username atau string unik untuk generate avatar
     * @param {object} options - Customization options
     * @returns {string} - Avatar URL
     */
    generateAvatarUrl(seed, options = {}) {
        // Pakai 'notionists' untuk style paling minimalis hitam putih
        const baseUrl = 'https://api.dicebear.com/9.x/notionists/svg';

        // Default options - Pure Black & White
        const defaultOptions = {
            seed: seed,
            backgroundColor: 'ffffff', // White background
            ...options
        };

        // Build query string
        const params = new URLSearchParams(defaultOptions);

        return `${baseUrl}?${params.toString()}`;
    },

    /**
     * Generate avatar URL dengan random customization
     * @param {string} seed - Username atau string unik
     * @returns {string} - Avatar URL dengan random style
     */
    generateRandomAvatar(seed) {
        // Berbagai style background hitam putih
        const backgrounds = [
            'ffffff', // Pure white (paper)
            'f5f5f5', // Off white
            'e8e8e8', // Light gray
            'f0f0f0', // Very light gray
            'd3d3d3'  // Light gray
        ];

        const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];

        return this.generateAvatarUrl(seed, {
            backgroundColor: randomBg
        });
    },

    /**
     * Get avatar styles available
     * @returns {array} - List of available DiceBear styles
     */
    getAvailableStyles() {
        return [
            'lorelei',         // Female sketches (recommended for B&W)
            'notionists',      // Notion-style minimal
            'thumbs',          // Thumbs up style
            'bottts-neutral',  // Neutral robots
            'shapes',          // Abstract shapes
            'initials',        // Initial letters
        ];
    },

    /**
     * Generate avatar dengan style berbeda
     * @param {string} seed - Username
     * @param {string} style - Avatar style (default: open-peeps)
     * @returns {string} - Avatar URL
     */
    generateWithStyle(seed, style = 'open-peeps') {
        const baseUrl = `https://api.dicebear.com/7.x/${style}/svg`;
        const params = new URLSearchParams({
            seed: seed,
            backgroundColor: 'transparent'
        });

        return `${baseUrl}?${params.toString()}`;
    }
};

module.exports = avatarHelper;