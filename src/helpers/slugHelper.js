/**
 * Helper untuk generate slug yang aman dan unique
 */

const slugHelper = {
    /**
     * Generate slug dari text
     * @param {string} text - Text yang akan dijadikan slug
     * @returns {string} - URL-friendly slug
     */
    generateSlug(text) {
        return text
            .toLowerCase() // Lowercase semua
            .trim() // Hapus spasi di awal/akhir
            .replace(/[^\w\s-]/g, '') // Hapus karakter special kecuali dash dan space
            .replace(/[\s_-]+/g, '-') // Replace spaces, underscore dengan dash
            .replace(/^-+|-+$/g, ''); // Hapus dash di awal/akhir
    },

    /**
     * Generate slug dengan timestamp (fallback jika title terlalu pendek)
     * @param {string} text - Text yang akan dijadikan slug
     * @returns {string} - Slug dengan timestamp
     */
    generateSlugWithTimestamp(text) {
        const baseSlug = this.generateSlug(text);
        const timestamp = Date.now();

        // Jika baseSlug kosong atau terlalu pendek
        if (!baseSlug || baseSlug.length < 3) {
            return `post-${timestamp}`;
        }

        return `${baseSlug}-${timestamp}`;
    },

    /**
     * Generate slug dengan suffix number untuk handle duplicate
     * @param {string} baseSlug - Base slug
     * @param {number} suffix - Suffix number (1, 2, 3, ...)
     * @returns {string} - Slug with suffix
     */
    generateSlugWithSuffix(baseSlug, suffix) {
        return `${baseSlug}-${suffix}`;
    },

    /**
     * Validasi slug format
     * @param {string} slug - Slug to validate
     * @returns {boolean} - Valid or not
     */
    isValidSlug(slug) {
        // Slug hanya boleh: lowercase letters, numbers, dash
        const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
        return slugRegex.test(slug);
    },

    /**
     * Truncate slug jika terlalu panjang
     * @param {string} slug - Original slug
     * @param {number} maxLength - Max length (default 250)
     * @returns {string} - Truncated slug
     */
    truncateSlug(slug, maxLength = 250) {
        if (slug.length <= maxLength) {
            return slug;
        }

        // Truncate dan pastikan tidak diakhiri dengan dash
        return slug.substring(0, maxLength).replace(/-+$/, '');
    }
};

module.exports = slugHelper;