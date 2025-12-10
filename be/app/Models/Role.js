const { sql } = require('../../config/database');

class Role {
    static async all() {
        try {
            const pool = await sql.connect();
            const result = await pool.request().query('SELECT * FROM roles');
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
                .query('SELECT * FROM roles WHERE role_id = @id');
            return result.recordset[0] || null;
        } catch (error) {
            throw error;
        }
    }

    static async create(data) {
        try {
            const pool = await sql.connect();
            const result = await pool.request()
                .input('code', sql.NVarChar, data.code)
                .input('name', sql.NVarChar, data.name)
                .query(`
                    INSERT INTO roles (code, name)
                    OUTPUT INSERTED.role_id
                    VALUES (@code, @name)
                `);
            return result.recordset[0].role_id;
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
                .query(`
                    UPDATE roles
                    SET code = @code, name = @name
                    WHERE role_id = @id
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
                .query('DELETE FROM roles WHERE role_id = @id');
            return true;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Role;
