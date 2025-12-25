const formatAvatarUrl = (avatarUrl) => {
    if (!avatarUrl) return null;

    if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
        return avatarUrl;
    }

    const baseUrl = process.env.APP_URL || 'http://localhost:3000';
    return `${baseUrl}${avatarUrl}`;
};

module.exports = { formatAvatarUrl };