const { body, validationResult } = require('express-validator');

const validateCreatePost = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title wajib diisi')
        .isLength({ max: 255 }).withMessage('Title maksimal 255 karakter'),

    body('content')
        .trim()
        .notEmpty().withMessage('Content wajib diisi')
        .isLength({ max: 10000 }).withMessage('Content maksimal 10000 karakter'),

    body('is_anonymous')
        .optional()
        .isBoolean().withMessage('is_anonymous harus boolean (true/false)'),

    body('styling')
        .optional()
        .isObject().withMessage('styling harus berupa object'),

    body('styling.background_color')
        .optional()
        .isString().withMessage('background_color harus string'),

    body('styling.border_width')
        .optional()
        .isString().withMessage('border_width harus string'),

    body('styling.border_style')
        .optional()
        .isString().withMessage('border_style harus string'),

    body('styling.border_color')
        .optional()
        .isString().withMessage('border_color harus string'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validasi gagal',
                errors: errors.array().map(err => ({
                    field: err.path,
                    message: err.msg
                }))
            });
        }
        next();
    }
];

const validateUpdatePost = [
    body('title')
        .optional()
        .trim()
        .isLength({ max: 255 }).withMessage('Title maksimal 255 karakter'),

    body('content')
        .optional()
        .trim()
        .isLength({ max: 10000 }).withMessage('Content maksimal 10000 karakter'),

    body('is_anonymous')
        .optional()
        .isBoolean().withMessage('is_anonymous harus boolean (true/false)'),

    body('styling')
        .optional()
        .isObject().withMessage('styling harus berupa object'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validasi gagal',
                errors: errors.array().map(err => ({
                    field: err.path,
                    message: err.msg
                }))
            });
        }
        next();
    }
];

module.exports = {
    validateCreatePost,
    validateUpdatePost
};