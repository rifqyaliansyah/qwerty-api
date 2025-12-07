const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        // Ambil token dari header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token tidak ditemukan. Silakan login terlebih dahulu'
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user info ke request
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token tidak valid'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token sudah expired. Silakan login kembali'
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada server'
        });
    }
};

module.exports = authMiddleware;