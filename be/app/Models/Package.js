const { sql } = require('../../config/database');

class Package {
    static async all() {
        try {
            const pool = await sql.connect();
            const result = await pool.request().query('SELECT * FROM membership_packages ORDER BY price ASC');
            return result.recordset;
        } catch (error) {
            throw error;
        }
    }

    static async find(id) {
        try {
            const pool = await sql.connect();
            const result = await pool.request()
                .input('id', sql.Int, id)
                .query('SELECT * FROM membership_packages WHERE package_id = @id');
            return result.recordset[0] || null;
        } catch (error) {
            throw error;
        }
    }

    static async create(data) {
        try {
            const pool = await sql.connect();
            await pool.request()
                .input('code', sql.NVarChar, data.code)
                .input('name', sql.NVarChar, data.name)
                .input('desc', sql.NVarChar, data.description)
                .input('dur', sql.Int, data.duration_days)
                .input('price', sql.Decimal, data.price)
                .input('ben', sql.NVarChar, data.benefits)
                .query(`
                    INSERT INTO membership_packages (code, name, description, duration_days, price, benefits)
                    VALUES (@code, @name, @desc, @dur, @price, @ben)
                `);
            return true;
        } catch (error) {
            throw error;
        }
    }

    static async update(id, data) {
        try {
            const pool = await sql.connect();
            await pool.request()
                .input('id', sql.Int, id)
                .input('code', sql.NVarChar, data.code)
                .input('name', sql.NVarChar, data.name)
                .input('desc', sql.NVarChar, data.description)
                .input('dur', sql.Int, data.duration_days)
                .input('price', sql.Decimal, data.price)
                .input('ben', sql.NVarChar, data.benefits)
                .query(`
                    UPDATE membership_packages 
                    SET code = @code, name = @name, description = @desc, duration_days = @dur, price = @price, benefits = @ben
                    WHERE package_id = @id
                `);
            return true;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        try {
            const pool = await sql.connect();
            await pool.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM membership_packages WHERE package_id = @id');
            return true;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Package;
