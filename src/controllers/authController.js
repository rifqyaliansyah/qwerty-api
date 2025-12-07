const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const { validateEmail, validatePassword } = require('../utils/validators');

const authController = {
    // Register new user
    async register(req, res, next) {
        try {
            const { name, email, password } = req.body;

            // Validasi input
            if (!name || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Nama, email, dan password wajib diisi'
                });
            }

            if (!validateEmail(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Format email tidak valid'
                });
            }

            if (!validatePassword(password)) {
                return res.status(400).json({
                    success: false,
                    message: 'Password minimal 6 karakter'
                });
            }

            const existingUser = await UserModel.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email sudah terdaftar'
                });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create new user
            const newUser = await UserModel.create(name, email, hashedPassword);

            // Generate JWT token
            const token = jwt.sign(
                { id: newUser.id, email: newUser.email },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );

            res.status(201).json({
                success: true,
                message: 'Registrasi berhasil',
                data: {
                    user: newUser,
                    token
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // Login user
    async login(req, res, next) {
        try {
            const { email, password } = req.body;

            // Validasi input
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email dan password wajib diisi'
                });
            }

            // Check if user exists
            const user = await UserModel.findByEmail(email);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Email atau password salah'
                });
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Email atau password salah'
                });
            }

            // Generate JWT token
            const token = jwt.sign(
                { id: user.id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );

            // Remove password from user object before sending response
            delete user.password;

            res.status(200).json({
                success: true,
                message: 'Login berhasil',
                data: {
                    user,
                    token
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // Get user profile (protected)
    async getProfile(req, res, next) {
        try {
            const user = await UserModel.findById(req.user.id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User tidak ditemukan'
                });
            }

            res.status(200).json({
                success: true,
                data: { user }
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = authController;