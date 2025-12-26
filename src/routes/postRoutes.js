const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateCreatePost, validateUpdatePost } = require('../middleware/postValidators');

// Public routes - bisa diakses tanpa login
router.get('/', postController.getAllPosts);
router.get('/:slug', postController.getPostBySlug);

// Protected routes - butuh authentication
router.post('/', authMiddleware, validateCreatePost, postController.createPost);
router.get('/user/me', authMiddleware, postController.getMyPosts);
router.put('/:slug', authMiddleware, validateUpdatePost, postController.updatePost);
router.delete('/:slug', authMiddleware, postController.deletePost);

module.exports = router;