const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authMiddleware = require('../middleware/authMiddleware');
const optionalAuthMiddleware = require('../middleware/optionalAuthMiddleware');
const { validateCreatePost, validateUpdatePost } = require('../middleware/postValidators');

// IMPORTANT: Specific routes MUST come BEFORE parameterized routes!
// Route /user/me must be before /:slug

// Protected routes - butuh authentication
router.post('/', authMiddleware, validateCreatePost, postController.createPost);
router.get('/user/me', authMiddleware, postController.getMyPosts);

// Public routes
router.get('/', optionalAuthMiddleware, postController.getAllPosts);
router.get('/:slug', optionalAuthMiddleware, postController.getPostBySlug);

// Update/Delete routes - butuh authentication
router.put('/:slug', authMiddleware, validateUpdatePost, postController.updatePost);
router.delete('/:slug', authMiddleware, postController.deletePost);

// Like route - butuh authentication
router.post('/:slug/like', authMiddleware, postController.toggleLike);

module.exports = router;