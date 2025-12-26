const PostModel = require('../models/postModel');
const { formatAvatarUrl } = require('../helpers/urlHelper');

const postController = {
    // Create new post
    async createPost(req, res, next) {
        try {
            const { title, content, is_anonymous = false, styling = {} } = req.body;
            const userId = req.user.id;

            const newPost = await PostModel.create(
                userId,
                title,
                content,
                is_anonymous,
                styling
            );

            // Format avatar URL jika ada author
            if (newPost.author && newPost.author.avatar_url) {
                newPost.author.avatar_url = formatAvatarUrl(newPost.author.avatar_url);
            }

            res.status(201).json({
                success: true,
                message: 'Post berhasil dibuat',
                data: { post: newPost }
            });
        } catch (error) {
            next(error);
        }
    },

    // Get all posts
    async getAllPosts(req, res, next) {
        try {
            const limit = parseInt(req.query.limit) || 50;
            const page = parseInt(req.query.page) || 1;
            const offset = (page - 1) * limit;

            const posts = await PostModel.findAll(limit, offset);
            const total = await PostModel.count();

            // Format avatar URLs
            posts.forEach(post => {
                if (post.author && post.author.avatar_url) {
                    post.author.avatar_url = formatAvatarUrl(post.author.avatar_url);
                }
            });

            res.status(200).json({
                success: true,
                data: {
                    posts,
                    pagination: {
                        total,
                        page,
                        limit,
                        total_pages: Math.ceil(total / limit)
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // Get single post by SLUG
    async getPostBySlug(req, res, next) {
        try {
            const slug = req.params.slug;
            const post = await PostModel.findBySlug(slug);

            if (!post) {
                return res.status(404).json({
                    success: false,
                    message: 'Post tidak ditemukan'
                });
            }

            // Format avatar URL jika ada author
            if (post.author && post.author.avatar_url) {
                post.author.avatar_url = formatAvatarUrl(post.author.avatar_url);
            }

            res.status(200).json({
                success: true,
                data: { post }
            });
        } catch (error) {
            next(error);
        }
    },

    // Get user's own posts
    async getMyPosts(req, res, next) {
        try {
            const userId = req.user.id;
            const posts = await PostModel.findByUserId(userId);
            const total = await PostModel.countByUserId(userId);

            // Format avatar URLs
            posts.forEach(post => {
                if (post.author && post.author.avatar_url) {
                    post.author.avatar_url = formatAvatarUrl(post.author.avatar_url);
                }
            });

            res.status(200).json({
                success: true,
                data: {
                    posts,
                    total
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // Update post
    async updatePost(req, res, next) {
        try {
            const slug = req.params.slug;
            const userId = req.user.id;
            const { title, content, is_anonymous, styling } = req.body;

            const updateData = {};
            if (title !== undefined) updateData.title = title;
            if (content !== undefined) updateData.content = content;
            if (is_anonymous !== undefined) updateData.is_anonymous = is_anonymous;
            if (styling !== undefined) updateData.styling = styling;

            const updatedPost = await PostModel.update(slug, userId, updateData);

            if (!updatedPost) {
                return res.status(404).json({
                    success: false,
                    message: 'Post tidak ditemukan atau Anda tidak memiliki akses'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Post berhasil diupdate',
                data: { post: updatedPost }
            });
        } catch (error) {
            next(error);
        }
    },

    // Delete post
    async deletePost(req, res, next) {
        try {
            const slug = req.params.slug;
            const userId = req.user.id;

            const deletedPost = await PostModel.delete(slug, userId);

            if (!deletedPost) {
                return res.status(404).json({
                    success: false,
                    message: 'Post tidak ditemukan atau Anda tidak memiliki akses'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Post berhasil dihapus'
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = postController;