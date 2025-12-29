const db = require('../config/database'); // Sesuaikan dengan config DB Anda

class ViewModel {
    // Tambah view baru
    static async addView(url) {
        try {
            const query = `
        INSERT INTO page_views (url, viewed_at)
        VALUES ($1, NOW())
        RETURNING *
      `;
            const result = await db.query(query, [url]);

            // Update summary table
            await this.updatePageStats(url);

            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Update page stats (untuk performa query stats)
    static async updatePageStats(url) {
        try {
            const query = `
        INSERT INTO page_stats (url, total_views, last_viewed_at, updated_at)
        VALUES ($1, 1, NOW(), NOW())
        ON CONFLICT (url) 
        DO UPDATE SET 
          total_views = page_stats.total_views + 1,
          last_viewed_at = NOW(),
          updated_at = NOW()
      `;
            await db.query(query, [url]);
        } catch (error) {
            throw error;
        }
    }

    // Get total views semua halaman
    static async getTotalViews() {
        try {
            const query = 'SELECT COUNT(*) as total FROM page_views';
            const result = await db.query(query);
            return parseInt(result.rows[0].total);
        } catch (error) {
            throw error;
        }
    }

    // Get views per page
    static async getViewsByPage() {
        try {
            const query = `
        SELECT url, total_views, last_viewed_at
        FROM page_stats
        ORDER BY total_views DESC
      `;
            const result = await db.query(query);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    // Get views dalam periode tertentu
    static async getViewsByPeriod(days = 7) {
        try {
            const query = `
        SELECT 
          DATE(viewed_at) as date,
          COUNT(*) as views
        FROM page_views
        WHERE viewed_at >= NOW() - INTERVAL '${days} days'
        GROUP BY DATE(viewed_at)
        ORDER BY date DESC
      `;
            const result = await db.query(query);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    // Get top pages
    static async getTopPages(limit = 10) {
        try {
            const query = `
        SELECT url, total_views, last_viewed_at
        FROM page_stats
        ORDER BY total_views DESC
        LIMIT $1
      `;
            const result = await db.query(query, [limit]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    // Get stats hari ini
    static async getTodayStats() {
        try {
            const query = `
        SELECT COUNT(*) as views_today
        FROM page_views
        WHERE DATE(viewed_at) = CURRENT_DATE
      `;
            const result = await db.query(query);
            return parseInt(result.rows[0].views_today);
        } catch (error) {
            throw error;
        }
    }

    // Get comprehensive stats (untuk Discord)
    static async getComprehensiveStats() {
        try {
            const [totalViews, todayViews, topPages, weeklyViews] = await Promise.all([
                this.getTotalViews(),
                this.getTodayStats(),
                this.getTopPages(5),
                this.getViewsByPeriod(7)
            ]);

            return {
                total_views: totalViews,
                today_views: todayViews,
                top_pages: topPages,
                weekly_trend: weeklyViews
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = ViewModel;