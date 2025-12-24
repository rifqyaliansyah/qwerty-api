const { body, validationResult } = require('express-validator');

const validateRegister = [
    body('username')
        .trim()
        .notEmpty().withMessage('Username wajib diisi')
        .isLength({ max: 50 }).withMessage('Username maksimal 50 karakter'),

    body('email')
        .trim()
        .notEmpty().withMessage('Email wajib diisi')
        .isEmail().withMessage('Format email tidak valid')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password wajib diisi')
        .isLength({ min: 6 }).withMessage('Password minimal 6 karakter')
        .isLength({ max: 100 }).withMessage('Password maksimal 100 karakter'),

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

const validateLogin = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email wajib diisi')
        .isEmail().withMessage('Format email tidak valid')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password wajib diisi'),

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

const validateUpdateProfile = [
    body('username')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('Username maksimal 50 karakter'),

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
    validateRegister,
    validateLogin,
    validateUpdateProfile
};