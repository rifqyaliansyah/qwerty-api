const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');
const { validateRegister, validateLogin, validateUpdateProfile, validateUpdatePassword } = require('../middleware/validators');
const { upload, handleUploadError } = require('../middleware/uploadMiddleware');

// Public routes
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);

// Protected routes
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, validateUpdateProfile, authController.updateProfile);
// router.put('/password', authMiddleware, validateUpdatePassword, authController.updatePassword);

// Avatar routes
router.post('/avatar', authMiddleware, upload.single('avatar'), handleUploadError, authController.uploadAvatar);
router.delete('/avatar', authMiddleware, authController.deleteAvatar);

module.exports = router;