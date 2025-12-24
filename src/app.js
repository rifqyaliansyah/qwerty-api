const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');
const sanitizeInput = require('./middleware/sanitizer');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(sanitizeInput);

// app.use(generalLimiter);

app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the Qwerty API',
        endpoints: {
            register: 'POST /api/auth/register',
            login: 'POST /api/auth/login',
            profile: 'GET /api/auth/profile',
            updateProfile: 'PUT /api/auth/profile'
        }
    });
});

app.use('/api/auth', authRoutes);

app.use(errorHandler);

module.exports = app;