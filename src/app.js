const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the Qwerty API!',
        endpoints: {
            register: 'POST /api/auth/register',
            login: 'POST /api/auth/login',
            profile: 'GET /api/auth/profile'
        }
    });
});

app.use('/api/auth', authRoutes);

// Error Handling Middleware
app.use(errorHandler);

module.exports = app;