const db = require('../config/database');

class ViewModel {
    // Tambah view baru
    static async addView(data) {
        const { url, sessionId } = data;

        try {
            // Cek duplicate dalam 30 detik
            const duplicateCheck = await db.query(`
                SELECT id FROM page_views
                WHERE session_id = $1 AND url = $2
                AND viewed_at > NOW() - INTERVAL '30 seconds'
                LIMIT 1
            `, [sessionId, url]);

            if (duplicateCheck.rows.length > 0) {
                return { skipped: true, reason: 'duplicate' };
            }

            // Insert view
            const result = await db.query(`
                INSERT INTO page_views (url, session_id, viewed_at)
                VALUES ($1, $2, NOW())
                RETURNING *
            `, [url, sessionId]);

            // Update summary tables
            await this.updatePageStats(url, sessionId);
            await this.updateDailyStats(sessionId);

            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Update page stats
    static async updatePageStats(url, sessionId) {
        try {
            // Check if this session already viewed this page before
            const isNewVisitor = await db.query(`
                SELECT COUNT(*) as count
                FROM page_views
                WHERE session_id = $1 AND url = $2
            `, [sessionId, url]);

            const uniqueIncrement = parseInt(isNewVisitor.rows[0].count) === 1 ? 1 : 0;

            await db.query(`
                INSERT INTO page_stats (url, total_views, unique_visitors, last_viewed_at, updated_at)
                VALUES ($1, 1, $2, NOW(), NOW())
                ON CONFLICT (url) 
                DO UPDATE SET 
                    total_views = page_stats.total_views + 1,
                    unique_visitors = page_stats.unique_visitors + $2,
                    last_viewed_at = NOW(),
                    updated_at = NOW()
            `, [url, uniqueIncrement]);
        } catch (error) {
            throw error;
        }
    }

    // Update daily stats
    static async updateDailyStats(sessionId) {
        try {
            // Check if this session already counted today
            const isNewVisitorToday = await db.query(`
                SELECT COUNT(*) as count
                FROM page_views
                WHERE session_id = $1 AND DATE(viewed_at) = CURRENT_DATE
            `, [sessionId]);

            const uniqueIncrement = parseInt(isNewVisitorToday.rows[0].count) === 1 ? 1 : 0;

            await db.query(`
                INSERT INTO daily_stats (date, total_views, unique_visitors)
                VALUES (CURRENT_DATE, 1, $1)
                ON CONFLICT (date)
                DO UPDATE SET
                    total_views = daily_stats.total_views + 1,
                    unique_visitors = daily_stats.unique_visitors + $1
            `, [uniqueIncrement]);
        } catch (error) {
            throw error;
        }
    }

    // Get total views
    static async getTotalViews() {
        try {
            const result = await db.query('SELECT COUNT(*) as total FROM page_views');
            return parseInt(result.rows[0].total);
        } catch (error) {
            throw error;
        }
    }

    // Get unique visitors
    static async getUniqueVisitors() {
        try {
            const result = await db.query(`
                SELECT COUNT(DISTINCT session_id) as unique_visitors
                FROM page_views
            `);
            return parseInt(result.rows[0].unique_visitors);
        } catch (error) {
            throw error;
        }
    }

    // Get views by page
    static async getViewsByPage() {
        try {
            const result = await db.query(`
                SELECT url, total_views, unique_visitors, last_viewed_at
                FROM page_stats
                ORDER BY total_views DESC
            `);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    // Get top pages
    static async getTopPages(limit = 10) {
        try {
            const result = await db.query(`
                SELECT url, total_views, unique_visitors, last_viewed_at
                FROM page_stats
                ORDER BY total_views DESC
                LIMIT $1
            `, [limit]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    // Get stats hari ini
    static async getTodayStats() {
        try {
            const result = await db.query(`
                SELECT total_views, unique_visitors
                FROM daily_stats
                WHERE date = CURRENT_DATE
            `);

            if (result.rows.length === 0) {
                return { views_today: 0, unique_visitors_today: 0 };
            }

            return {
                views_today: parseInt(result.rows[0].total_views),
                unique_visitors_today: parseInt(result.rows[0].unique_visitors)
            };
        } catch (error) {
            throw error;
        }
    }

    // Get views dalam periode tertentu
    static async getViewsByPeriod(days = 7) {
        try {
            const result = await db.query(`
                SELECT date, total_views, unique_visitors
                FROM daily_stats
                WHERE date >= CURRENT_DATE - INTERVAL '${days} days'
                ORDER BY date DESC
            `);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    // Get comprehensive stats
    static async getComprehensiveStats() {
        try {
            const [
                totalViews,
                uniqueVisitors,
                todayStats,
                topPages,
                weeklyViews
            ] = await Promise.all([
                this.getTotalViews(),
                this.getUniqueVisitors(),
                this.getTodayStats(),
                this.getTopPages(5),
                this.getViewsByPeriod(7)
            ]);

            return {
                total_views: totalViews,
                unique_visitors: uniqueVisitors,
                today_stats: todayStats,
                top_pages: topPages,
                weekly_trend: weeklyViews
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = ViewModel;