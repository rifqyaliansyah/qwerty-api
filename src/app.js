const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const errorHandler = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');
const sanitizeInput = require('./middleware/sanitizer');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static('uploads'));

app.use(sanitizeInput);
// app.use(generalLimiter);

app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the Qwerty API',
        version: '1.0.0',
        endpoints: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                profile: 'GET /api/auth/profile',
                updateProfile: 'PUT /api/auth/profile',
                uploadAvatar: 'POST /api/auth/avatar',
                deleteAvatar: 'DELETE /api/auth/avatar'
            },
            posts: {
                getAllPosts: 'GET /api/posts',
                getPostBySlug: 'GET /api/posts/:slug',
                createPost: 'POST /api/posts (auth required)',
                getMyPosts: 'GET /api/posts/user/me (auth required)',
                updatePost: 'PUT /api/posts/:slug (auth required)',
                deletePost: 'DELETE /api/posts/:slug (auth required)'
            }
        }
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

app.use(errorHandler);

module.exports = app;