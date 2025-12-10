const { sql } = require('../../config/database');

class BlogPost {
    static async all() {
        const pool = await sql.connect();
        const res = await pool.request().query(`
            SELECT p.*, c.name as category_name, u.full_name as author_name
            FROM blog_posts p
            JOIN blog_categories c ON p.category_id = c.id
            JOIN users u ON p.author_id = u.user_id
            ORDER BY p.created_at DESC
        `);
        return res.recordset;
    }

    static async create(data) {
        const pool = await sql.connect();
        await pool.request()
            .input('title', sql.NVarChar, data.title)
            .input('content', sql.NVarChar, data.content)
            .input('catId', sql.Int, data.category_id)
            .input('uid', sql.BigInt, data.author_id)
            .input('img', sql.NVarChar, data.image_url) // Assuming image upload handled
            .query(`
                INSERT INTO blog_posts (title, content, category_id, author_id, image_url, created_at)
                VALUES (@title, @content, @catId, @uid, @img, GETDATE())
            `);
        return true;
    }

    static async findById(id) {
        const pool = await sql.connect();
        const res = await pool.request().input('id', sql.Int, id).query("SELECT * FROM blog_posts WHERE id = @id");
        return res.recordset[0] || null;
    }
}

module.exports = BlogPost;
