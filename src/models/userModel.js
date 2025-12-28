const pool = require('../config/database');

const UserModel = {
    // Create new user
    async create(username, email, hashedPassword, avatarUrl) {
        const query = `
            INSERT INTO users (username, email, password, avatar_url)
            VALUES ($1, $2, $3, $4)
            RETURNING id, username, email, avatar_url, created_at
        `;
        const values = [username, email, hashedPassword, avatarUrl];
        const result = await pool.query(query, values);
        return result.rows[0];
    },

    // Find user by email
    async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await pool.query(query, [email]);
        return result.rows[0];
    },

    // Find user by username
    async findByUsername(username) {
        const query = 'SELECT * FROM users WHERE username = $1';
        const result = await pool.query(query, [username]);
        return result.rows[0];
    },

    // Find user by ID (without password)
    async findById(id) {
        const query = 'SELECT id, username, email, avatar_url, created_at FROM users WHERE id = $1';
        const result = await pool.query(query, [id]);
        return result.rows[0];
    },

    // Find user by ID with password (for password update)
    async findByIdWithPassword(id) {
        const query = 'SELECT id, username, email, password, avatar_url, created_at FROM users WHERE id = $1';
        const result = await pool.query(query, [id]);
        return result.rows[0];
    },

    // Update user profile
    async update(id, data) {
        const fields = [];
        const values = [];
        let paramCount = 1;

        if (data.username) {
            fields.push(`username = $${paramCount}`);
            values.push(data.username);
            paramCount++;
        }

        if (data.avatar_url) {
            fields.push(`avatar_url = $${paramCount}`);
            values.push(data.avatar_url);
            paramCount++;
        }

        if (fields.length === 0) {
            return null;
        }

        fields.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);

        const query = `
            UPDATE users 
            SET ${fields.join(', ')}
            WHERE id = $${paramCount}
            RETURNING id, username, email, avatar_url, updated_at
        `;

        const result = await pool.query(query, values);
        return result.rows[0];
    },

    // Update user password
    async updatePassword(id, hashedPassword) {
        const query = `
            UPDATE users 
            SET password = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING id, username, email, avatar_url, updated_at
        `;
        const result = await pool.query(query, [hashedPassword, id]);
        return result.rows[0];
    }
};

module.exports = UserModel;