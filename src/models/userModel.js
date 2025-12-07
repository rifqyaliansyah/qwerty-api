const pool = require('../config/database');

const UserModel = {
    // Create new user
    async create(name, email, hashedPassword) {
        const query = `
      INSERT INTO users (name, email, password)
      VALUES ($1, $2, $3)
      RETURNING id, name, email, created_at
    `;
        const values = [name, email, hashedPassword];
        const result = await pool.query(query, values);
        return result.rows[0];
    },

    // Find user by email
    async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await pool.query(query, [email]);
        return result.rows[0];
    },

    // Find user by ID
    async findById(id) {
        const query = 'SELECT id, name, email, created_at FROM users WHERE id = $1';
        const result = await pool.query(query, [id]);
        return result.rows[0];
    },

    // Update user
    async update(id, data) {
        const query = `
      UPDATE users 
      SET name = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, name, email, updated_at
    `;
        const values = [data.name, id];
        const result = await pool.query(query, values);
        return result.rows[0];
    }
};

module.exports = UserModel;