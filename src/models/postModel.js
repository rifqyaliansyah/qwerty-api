const pool = require('../config/database');
const slugHelper = require('../helpers/slugHelper');

const PostModel = {
    /**
     * Generate unique slug dari title
     * Handling duplicate dengan suffix -1, -2, -3, dst
     */
    async generateUniqueSlug(title, excludeSlug = null) {
        // Generate base slug dari title
        let baseSlug = slugHelper.generateSlug(title);

        // Jika slug kosong atau terlalu pendek, gunakan timestamp
        if (!baseSlug || baseSlug.length < 3) {
            baseSlug = slugHelper.generateSlugWithTimestamp(title);
        }

        // Truncate jika terlalu panjang
        baseSlug = slugHelper.truncateSlug(baseSlug, 250);

        let slug = baseSlug;
        let suffix = 1;

        // Loop sampai dapat slug yang unique
        while (true) {
            // Check apakah slug sudah ada (kecuali slug yang sedang di-update)
            const query = excludeSlug
                ? 'SELECT slug FROM posts WHERE slug = $1 AND slug != $2'
                : 'SELECT slug FROM posts WHERE slug = $1';

            const values = excludeSlug ? [slug, excludeSlug] : [slug];
            const result = await pool.query(query, values);

            // Jika tidak ada duplicate, slug ini bisa dipakai
            if (result.rows.length === 0) {
                break;
            }

            // Jika ada duplicate, tambahkan suffix
            slug = slugHelper.generateSlugWithSuffix(baseSlug, suffix);
            suffix++;
        }

        return slug;
    },

    // Create new post
    async create(userId, title, content, isAnonymous, styling) {
        // Generate unique slug
        const slug = await this.generateUniqueSlug(title);

        const query = `
            INSERT INTO posts (user_id, slug, title, content, is_anonymous, styling)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, user_id, slug, title, content, is_anonymous, styling, created_at, updated_at
        `;
        const values = [userId, slug, title, content, isAnonymous, JSON.stringify(styling)];
        const result = await pool.query(query, values);
        return result.rows[0];
    },

    // Get all posts (with user info, respect anonymous)
    async findAll(limit = 50, offset = 0) {
        const query = `
            SELECT 
                p.id,
                p.user_id,
                p.slug,
                p.title,
                p.content,
                p.is_anonymous,
                p.styling,
                p.created_at,
                p.updated_at,
                CASE 
                    WHEN p.is_anonymous = TRUE THEN NULL
                    ELSE json_build_object(
                        'id', u.id,
                        'username', u.username,
                        'avatar_url', u.avatar_url
                    )
                END as author
            FROM posts p
            LEFT JOIN users u ON p.user_id = u.id
            ORDER BY p.created_at DESC
            LIMIT $1 OFFSET $2
        `;
        const result = await pool.query(query, [limit, offset]);
        return result.rows;
    },

    // Get all posts WITH likes info (untuk authenticated user)
    async findAllWithLikes(limit = 50, offset = 0, userId = null) {
        const query = `
            SELECT 
                p.id,
                p.user_id,
                p.slug,
                p.title,
                p.content,
                p.is_anonymous,
                p.styling,
                p.created_at,
                p.updated_at,
                CASE 
                    WHEN p.is_anonymous = TRUE THEN NULL
                    ELSE json_build_object(
                        'id', u.id,
                        'username', u.username,
                        'avatar_url', u.avatar_url
                    )
                END as author,
                CAST(COALESCE(like_counts.likes_count, 0) AS INTEGER) as likes_count,
                CASE 
                    WHEN $3 IS NOT NULL AND user_likes.id IS NOT NULL THEN TRUE
                    ELSE FALSE
                END as is_liked_by_user
            FROM posts p
            LEFT JOIN users u ON p.user_id = u.id
            LEFT JOIN (
                SELECT post_id, COUNT(*) as likes_count
                FROM post_likes
                GROUP BY post_id
            ) like_counts ON p.id = like_counts.post_id
            LEFT JOIN post_likes user_likes ON p.id = user_likes.post_id AND user_likes.user_id = $3
            ORDER BY p.created_at DESC
            LIMIT $1 OFFSET $2
        `;
        const result = await pool.query(query, [limit, offset, userId]);
        return result.rows;
    },

    // Get posts sorted by most liked
    async findMostLikedWithLikes(limit = 50, offset = 0, userId = null) {
        const query = `
            SELECT 
                p.id,
                p.user_id,
                p.slug,
                p.title,
                p.content,
                p.is_anonymous,
                p.styling,
                p.created_at,
                p.updated_at,
                CASE 
                    WHEN p.is_anonymous = TRUE THEN NULL
                    ELSE json_build_object(
                        'id', u.id,
                        'username', u.username,
                        'avatar_url', u.avatar_url
                    )
                END as author,
                CAST(COALESCE(like_counts.likes_count, 0) AS INTEGER) as likes_count,
                CASE 
                    WHEN $3 IS NOT NULL AND user_likes.id IS NOT NULL THEN TRUE
                    ELSE FALSE
                END as is_liked_by_user
            FROM posts p
            LEFT JOIN users u ON p.user_id = u.id
            LEFT JOIN (
                SELECT post_id, COUNT(*) as likes_count
                FROM post_likes
                GROUP BY post_id
            ) like_counts ON p.id = like_counts.post_id
            LEFT JOIN post_likes user_likes ON p.id = user_likes.post_id AND user_likes.user_id = $3
            ORDER BY likes_count DESC, p.created_at DESC
            LIMIT $1 OFFSET $2
        `;
        const result = await pool.query(query, [limit, offset, userId]);
        return result.rows;
    },

    // Get post by SLUG (with user info, respect anonymous)
    async findBySlug(slug) {
        const query = `
            SELECT 
                p.id,
                p.user_id,
                p.slug,
                p.title,
                p.content,
                p.is_anonymous,
                p.styling,
                p.created_at,
                p.updated_at,
                CASE 
                    WHEN p.is_anonymous = TRUE THEN NULL
                    ELSE json_build_object(
                        'id', u.id,
                        'username', u.username,
                        'avatar_url', u.avatar_url
                    )
                END as author
            FROM posts p
            LEFT JOIN users u ON p.user_id = u.id
            WHERE p.slug = $1
        `;
        const result = await pool.query(query, [slug]);
        return result.rows[0];
    },

    // Get post by slug WITH likes info
    async findBySlugWithLikes(slug, userId = null) {
        const query = `
            SELECT 
                p.id,
                p.user_id,
                p.slug,
                p.title,
                p.content,
                p.is_anonymous,
                p.styling,
                p.created_at,
                p.updated_at,
                CASE 
                    WHEN p.is_anonymous = TRUE THEN NULL
                    ELSE json_build_object(
                        'id', u.id,
                        'username', u.username,
                        'avatar_url', u.avatar_url
                    )
                END as author,
                CAST(COALESCE(like_counts.likes_count, 0) AS INTEGER) as likes_count,
                CASE 
                    WHEN $2 IS NOT NULL AND user_likes.id IS NOT NULL THEN TRUE
                    ELSE FALSE
                END as is_liked_by_user
            FROM posts p
            LEFT JOIN users u ON p.user_id = u.id
            LEFT JOIN (
                SELECT post_id, COUNT(*) as likes_count
                FROM post_likes
                GROUP BY post_id
            ) like_counts ON p.id = like_counts.post_id
            LEFT JOIN post_likes user_likes ON p.id = user_likes.post_id AND user_likes.user_id = $2
            WHERE p.slug = $1
        `;
        const result = await pool.query(query, [slug, userId]);
        return result.rows[0];
    },

    // Get posts by user ID (show all posts including anonymous for owner)
    async findByUserId(userId, limit = 50, offset = 0) {
        const query = `
            SELECT 
                p.id,
                p.user_id,
                p.slug,
                p.title,
                p.content,
                p.is_anonymous,
                p.styling,
                p.created_at,
                p.updated_at,
                json_build_object(
                    'id', u.id,
                    'username', u.username,
                    'avatar_url', u.avatar_url
                ) as author
            FROM posts p
            LEFT JOIN users u ON p.user_id = u.id
            WHERE p.user_id = $1
            ORDER BY p.created_at DESC
            LIMIT $2 OFFSET $3
        `;
        const result = await pool.query(query, [userId, limit, offset]);
        return result.rows;
    },

    // Get posts by user ID WITH likes info
    async findByUserIdWithLikes(userId, limit = 50, offset = 0, currentUserId = null) {
        const query = `
            SELECT 
                p.id,
                p.user_id,
                p.slug,
                p.title,
                p.content,
                p.is_anonymous,
                p.styling,
                p.created_at,
                p.updated_at,
                json_build_object(
                    'id', u.id,
                    'username', u.username,
                    'avatar_url', u.avatar_url
                ) as author,
                CAST(COALESCE(like_counts.likes_count, 0) AS INTEGER) as likes_count,
                CASE 
                    WHEN $4 IS NOT NULL AND user_likes.id IS NOT NULL THEN TRUE
                    ELSE FALSE
                END as is_liked_by_user
            FROM posts p
            LEFT JOIN users u ON p.user_id = u.id
            LEFT JOIN (
                SELECT post_id, COUNT(*) as likes_count
                FROM post_likes
                GROUP BY post_id
            ) like_counts ON p.id = like_counts.post_id
            LEFT JOIN post_likes user_likes ON p.id = user_likes.post_id AND user_likes.user_id = $4
            WHERE p.user_id = $1
            ORDER BY p.created_at DESC
            LIMIT $2 OFFSET $3
        `;
        const result = await pool.query(query, [userId, limit, offset, currentUserId]);
        return result.rows;
    },

    // Update post
    async update(slug, userId, data) {
        const fields = [];
        const values = [];
        let paramCount = 1;

        if (data.title !== undefined) {
            fields.push(`title = $${paramCount}`);
            values.push(data.title);
            paramCount++;

            if (data.title) {
                const currentPost = await this.findBySlug(slug);
                const newSlug = await this.generateUniqueSlug(data.title, currentPost.slug);

                fields.push(`slug = $${paramCount}`);
                values.push(newSlug);
                paramCount++;
            }
        }

        if (data.content !== undefined) {
            fields.push(`content = $${paramCount}`);
            values.push(data.content);
            paramCount++;
        }

        if (data.is_anonymous !== undefined) {
            fields.push(`is_anonymous = $${paramCount}`);
            values.push(data.is_anonymous);
            paramCount++;
        }

        if (data.styling !== undefined) {
            fields.push(`styling = $${paramCount}`);
            values.push(JSON.stringify(data.styling));
            paramCount++;
        }

        if (fields.length === 0) {
            return null;
        }

        fields.push('updated_at = CURRENT_TIMESTAMP');
        values.push(slug, userId);

        const query = `
            UPDATE posts 
            SET ${fields.join(', ')}
            WHERE slug = $${paramCount} AND user_id = $${paramCount + 1}
            RETURNING id, user_id, slug, title, content, is_anonymous, styling, created_at, updated_at
        `;

        const result = await pool.query(query, values);
        return result.rows[0];
    },

    // Delete post
    async delete(slug, userId) {
        const query = `
            DELETE FROM posts 
            WHERE slug = $1 AND user_id = $2
            RETURNING id, slug
        `;
        const result = await pool.query(query, [slug, userId]);
        return result.rows[0];
    },

    // Count total posts
    async count() {
        const query = 'SELECT COUNT(*) as total FROM posts';
        const result = await pool.query(query);
        return parseInt(result.rows[0].total);
    },

    // Count user's posts
    async countByUserId(userId) {
        const query = 'SELECT COUNT(*) as total FROM posts WHERE user_id = $1';
        const result = await pool.query(query, [userId]);
        return parseInt(result.rows[0].total);
    }
};

module.exports = PostModel;