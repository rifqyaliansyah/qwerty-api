const pool = require('../config/database');

const UserModel = {
    // Create new user
    async create(username, email, hashedPassword) {
        const query = `
      INSERT INTO users (username, email, password)
      VALUES ($1, $2, $3)
      RETURNING id, username, email, created_at
    `;
        const values = [username, email, hashedPassword];
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

    // Find user by ID
    async findById(id) {
        const query = 'SELECT id, username, email, created_at FROM users WHERE id = $1';
        const result = await pool.query(query, [id]);
        return result.rows[0];
    },

    // Update user
    async update(id, data) {
        const query = `
      UPDATE users 
      SET username = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, username, email, updated_at
    `;
        const values = [data.username, id];
        const result = await pool.query(query, values);
        return result.rows[0];
    }
};

module.exports = UserModel;