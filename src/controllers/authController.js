const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const avatarHelper = require('../helpers/avatarHelper');
const { formatAvatarUrl } = require('../helpers/urlHelper');

const authController = {
    async register(req, res, next) {
        try {
            const { username, email, password } = req.body;

            const existingUser = await UserModel.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email sudah terdaftar'
                });
            }

            const existingUsername = await UserModel.findByUsername(username);
            if (existingUsername) {
                return res.status(400).json({
                    success: false,
                    message: 'Username sudah digunakan'
                });
            }

            if (!process.env.JWT_SECRET) {
                throw new Error('JWT_SECRET tidak dikonfigurasi');
            }

            // Generate avatar URL menggunakan username sebagai seed
            const avatarUrl = avatarHelper.generateAvatarUrl(username);

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newUser = await UserModel.create(username, email, hashedPassword, avatarUrl);

            const token = jwt.sign(
                { id: newUser.id, email: newUser.email },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
            );

            newUser.avatar_url = formatAvatarUrl(newUser.avatar_url);

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

    async login(req, res, next) {
        try {
            const { email, password } = req.body;

            const user = await UserModel.findByEmail(email);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Email atau password salah'
                });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Email atau password salah'
                });
            }

            const token = jwt.sign(
                { id: user.id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
            );

            delete user.password;
            user.avatar_url = formatAvatarUrl(user.avatar_url);

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

    async getProfile(req, res, next) {
        try {
            const user = await UserModel.findById(req.user.id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User tidak ditemukan'
                });
            }

            user.avatar_url = formatAvatarUrl(user.avatar_url);

            res.status(200).json({
                success: true,
                data: { user }
            });
        } catch (error) {
            next(error);
        }
    },

    async updateProfile(req, res, next) {
        try {
            const { username, regenerate_avatar, current_password, new_password } = req.body;

            const updateData = {};
            let passwordUpdated = false;

            // Jika ada perubahan password
            if (current_password && new_password) {
                // Get user dengan password
                const user = await UserModel.findByIdWithPassword(req.user.id);

                if (!user) {
                    return res.status(404).json({
                        success: false,
                        message: 'User tidak ditemukan'
                    });
                }

                // Verify current password
                const isPasswordValid = await bcrypt.compare(current_password, user.password);
                if (!isPasswordValid) {
                    return res.status(401).json({
                        success: false,
                        message: 'Password lama salah'
                    });
                }

                // Hash new password
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(new_password, salt);

                // Update password
                await UserModel.updatePassword(req.user.id, hashedPassword);
                passwordUpdated = true;
            }

            // Update username jika ada
            if (username) {
                updateData.username = username;
            }

            // Jika user minta regenerate avatar (kembali ke Open Peeps)
            if (regenerate_avatar === true) {
                const currentUser = await UserModel.findById(req.user.id);
                updateData.avatar_url = avatarHelper.generateRandomAvatar(currentUser.username);
            }

            // Update profile data jika ada perubahan
            let updatedUser;
            if (Object.keys(updateData).length > 0) {
                updatedUser = await UserModel.update(req.user.id, updateData);
            } else {
                updatedUser = await UserModel.findById(req.user.id);
            }

            if (!updatedUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User tidak ditemukan'
                });
            }

            updatedUser.avatar_url = formatAvatarUrl(updatedUser.avatar_url);

            // Build success message
            const updates = [];
            if (username) updates.push('Profile');
            if (passwordUpdated) updates.push('Password');
            if (regenerate_avatar) updates.push('Avatar');

            const message = updates.length > 0
                ? `${updates.join(' dan ')} berhasil diupdate`
                : 'Tidak ada perubahan';

            res.status(200).json({
                success: true,
                message: message,
                data: { user: updatedUser }
            });
        } catch (error) {
            next(error);
        }
    },

    // async updatePassword(req, res, next) {
    //     try {
    //         const { current_password, new_password } = req.body;

    //         // Get user dengan password
    //         const user = await UserModel.findByIdWithPassword(req.user.id);

    //         if (!user) {
    //             return res.status(404).json({
    //                 success: false,
    //                 message: 'User tidak ditemukan'
    //             });
    //         }

    //         // Verify current password
    //         const isPasswordValid = await bcrypt.compare(current_password, user.password);
    //         if (!isPasswordValid) {
    //             return res.status(401).json({
    //                 success: false,
    //                 message: 'Password lama salah'
    //             });
    //         }

    //         // Hash new password
    //         const salt = await bcrypt.genSalt(10);
    //         const hashedPassword = await bcrypt.hash(new_password, salt);

    //         // Update password
    //         await UserModel.updatePassword(req.user.id, hashedPassword);

    //         res.status(200).json({
    //             success: true,
    //             message: 'Password berhasil diubah'
    //         });
    //     } catch (error) {
    //         next(error);
    //     }
    // },

    async uploadAvatar(req, res, next) {
        try {

            if (process.env.NODE_ENV === 'production') {
                return res.status(400).json({
                    success: false,
                    message: 'Upload avatar belum tersedia di production'
                });
            }

            // Cek apakah file ada
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Tidak ada file yang diupload'
                });
            }

            // Get current user untuk delete old avatar jika ada
            const currentUser = await UserModel.findById(req.user.id);

            // Delete old avatar file jika bukan dari DiceBear
            const { deleteOldAvatar } = require('../middleware/uploadMiddleware');
            if (currentUser.avatar_url) {
                deleteOldAvatar(currentUser.avatar_url);
            }

            // Generate URL untuk avatar baru
            const avatarUrl = `/uploads/avatars/${req.file.filename}`;

            // Update database
            const updatedUser = await UserModel.update(req.user.id, { avatar_url: avatarUrl });

            if (!updatedUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User tidak ditemukan'
                });
            }

            updatedUser.avatar_url = formatAvatarUrl(updatedUser.avatar_url);

            res.status(200).json({
                success: true,
                message: 'Avatar berhasil diupload',
                data: {
                    user: updatedUser,
                    file: {
                        filename: req.file.filename,
                        size: req.file.size,
                        mimetype: req.file.mimetype
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    },

    async deleteAvatar(req, res, next) {
        try {
            const currentUser = await UserModel.findById(req.user.id);

            if (!currentUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User tidak ditemukan'
                });
            }

            // Delete old avatar file
            const { deleteOldAvatar } = require('../middleware/uploadMiddleware');
            if (currentUser.avatar_url) {
                deleteOldAvatar(currentUser.avatar_url);
            }

            // Generate avatar RANDOM baru dengan Open Peeps
            const newAvatarUrl = avatarHelper.generateRandomAvatar(currentUser.username);

            // Update database
            const updatedUser = await UserModel.update(req.user.id, { avatar_url: newAvatarUrl });

            updatedUser.avatar_url = formatAvatarUrl(updatedUser.avatar_url);

            res.status(200).json({
                success: true,
                message: 'Avatar dihapus, kembali ke avatar default',
                data: { user: updatedUser }
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = authController;