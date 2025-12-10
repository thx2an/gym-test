const { sql } = require('../../config/database');

class BlogCategory {
    static async all() {
        const pool = await sql.connect();
        const res = await pool.request().query("SELECT * FROM blog_categories");
        return res.recordset;
    }

    static async create(name) {
        const pool = await sql.connect();
        await pool.request().input('name', sql.NVarChar, name).query("INSERT INTO blog_categories (name) VALUES (@name)");
        return true;
    }
}

module.exports = BlogCategory;
