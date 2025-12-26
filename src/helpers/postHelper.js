const { formatAvatarUrl } = require('./urlHelper');

const sanitizePost = (post, includeUserId = false) => {
    const sanitized = { ...post };

    if (!includeUserId) {
        delete sanitized.user_id;
    }

    if (sanitized.author && sanitized.author.avatar_url) {
        sanitized.author.avatar_url = formatAvatarUrl(sanitized.author.avatar_url);
    }

    return sanitized;
};

module.exports = { sanitizePost };