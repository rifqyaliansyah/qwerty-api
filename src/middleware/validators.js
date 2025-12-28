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

    body('current_password')
        .optional()
        .if(body('new_password').exists())
        .notEmpty().withMessage('Password lama wajib diisi jika mengubah password'),

    body('new_password')
        .optional()
        .if(body('current_password').exists())
        .notEmpty().withMessage('Password baru wajib diisi')
        .isLength({ min: 6 }).withMessage('Password baru minimal 6 karakter')
        .isLength({ max: 100 }).withMessage('Password baru maksimal 100 karakter')
        .custom((value, { req }) => {
            if (value === req.body.current_password) {
                throw new Error('Password baru tidak boleh sama dengan password lama');
            }
            return true;
        }),

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

// const validateUpdatePassword = [
//     body('current_password')
//         .notEmpty().withMessage('Password lama wajib diisi'),

//     body('new_password')
//         .notEmpty().withMessage('Password baru wajib diisi')
//         .isLength({ min: 6 }).withMessage('Password baru minimal 6 karakter')
//         .isLength({ max: 100 }).withMessage('Password baru maksimal 100 karakter')
//         .custom((value, { req }) => {
//             if (value === req.body.current_password) {
//                 throw new Error('Password baru tidak boleh sama dengan password lama');
//             }
//             return true;
//         }),

//     (req, res, next) => {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Validasi gagal',
//                 errors: errors.array().map(err => ({
//                     field: err.path,
//                     message: err.msg
//                 }))
//             });
//         }
//         next();
//     }
// ];

module.exports = {
    validateRegister,
    validateLogin,
    validateUpdateProfile,
    // validateUpdatePassword
};