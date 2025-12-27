const pool = require('../config/database');

const LikeModel = {
    // Toggle like (like/unlike)
    async toggleLike(postId, userId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Check if already liked
            const checkQuery = 'SELECT id FROM post_likes WHERE post_id = $1 AND user_id = $2';
            const checkResult = await client.query(checkQuery, [postId, userId]);

            let isLiked;
            if (checkResult.rows.length > 0) {
                // Unlike
                await client.query('DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2', [postId, userId]);
                isLiked = false;
            } else {
                // Like
                await client.query('INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)', [postId, userId]);
                isLiked = true;
            }

            // Get updated likes count
            const countQuery = 'SELECT COUNT(*) as count FROM post_likes WHERE post_id = $1';
            const countResult = await client.query(countQuery, [postId]);
            const likesCount = parseInt(countResult.rows[0].count);

            await client.query('COMMIT');

            return { isLiked, likesCount };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    // Get likes count for a post
    async getLikesCount(postId) {
        const query = 'SELECT COUNT(*) as count FROM post_likes WHERE post_id = $1';
        const result = await pool.query(query, [postId]);
        return parseInt(result.rows[0].count);
    },

    // Check if user liked a post
    async isLikedByUser(postId, userId) {
        const query = 'SELECT id FROM post_likes WHERE post_id = $1 AND user_id = $2';
        const result = await pool.query(query, [postId, userId]);
        return result.rows.length > 0;
    }
};

module.exports = LikeModel;