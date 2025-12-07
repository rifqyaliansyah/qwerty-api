const { body, validationResult } = require('express-validator');

const validateRegister = [
    body('name')
        .trim()
        .notEmpty().withMessage('Nama wajib diisi')
        .isLength({ min: 2 }).withMessage('Nama minimal 2 karakter')
        .isLength({ max: 100 }).withMessage('Nama maksimal 100 karakter')
        .matches(/^[a-zA-Z\s]+$/).withMessage('Nama hanya boleh berisi huruf dan spasi'),

    body('email')
        .trim()
        .notEmpty().withMessage('Email wajib diisi')
        .isEmail().withMessage('Format email tidak valid')
        .normalizeEmail()
        .isLength({ max: 100 }).withMessage('Email maksimal 100 karakter'),

    body('password')
        .notEmpty().withMessage('Password wajib diisi')
        .isLength({ min: 8 }).withMessage('Password minimal 8 karakter')
        .isLength({ max: 128 }).withMessage('Password maksimal 128 karakter')
        .matches(/[a-z]/).withMessage('Password harus mengandung huruf kecil')
        .matches(/[A-Z]/).withMessage('Password harus mengandung huruf besar')
        .matches(/[0-9]/).withMessage('Password harus mengandung angka')
        .matches(/[@$!%*?&#]/).withMessage('Password harus mengandung karakter spesial (@$!%*?&#)'),

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
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2 }).withMessage('Nama minimal 2 karakter')
        .isLength({ max: 100 }).withMessage('Nama maksimal 100 karakter')
        .matches(/^[a-zA-Z\s]+$/).withMessage('Nama hanya boleh berisi huruf dan spasi'),

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