const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Database error
    if (err.code === '23505') {
        return res.status(400).json({
            success: false,
            message: 'Data sudah ada (duplicate entry)'
        });
    }

    // Default error
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Terjadi kesalahan pada server',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;