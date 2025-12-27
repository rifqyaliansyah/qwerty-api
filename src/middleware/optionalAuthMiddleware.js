const jwt = require('jsonwebtoken');

/**
 * Optional Auth Middleware
 * Berbeda dengan authMiddleware biasa, ini TIDAK return 401 jika token tidak ada
 * Jika token ada dan valid -> set req.user
 * Jika token tidak ada atau invalid -> req.user = null (continue)
 */
const optionalAuthMiddleware = (req, res, next) => {
    try {
        // Ambil token dari header
        const authHeader = req.headers.authorization;

        // Jika tidak ada token, lanjutkan tanpa error
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            req.user = null;
            return next();
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user info ke request
        req.user = decoded;
        next();
    } catch (error) {
        // Jika token invalid, tetap lanjutkan (set req.user = null)
        req.user = null;
        next();
    }
};

module.exports = optionalAuthMiddleware;