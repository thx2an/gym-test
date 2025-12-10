const { sql } = require('../../config/database');

class User {
    static async findByEmail(email) {
        try {
            const pool = await sql.connect();
            const result = await pool.request()
                .input('email', sql.NVarChar, email)
                .query(`
                    SELECT u.user_id, u.full_name, u.email, u.password_hash, u.status, r.code as role_code
                    FROM users u
                    LEFT JOIN user_roles ur ON u.user_id = ur.user_id
                    LEFT JOIN roles r ON ur.role_id = r.role_id
                    WHERE u.email = @email
                `);

            if (result.recordset.length === 0) return null;

            const userRecord = result.recordset[0];
            // Aggregate roles
            const roles = result.recordset.map(r => r.role_code).filter(r => r !== null);

            return {
                ...userRecord,
                roles: roles
            };
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        try {
            const pool = await sql.connect();
            const result = await pool.request()
                .input('id', sql.BigInt, id)
                .query(`
                    SELECT u.user_id, u.full_name, u.email, u.status, r.code as role_code
                    FROM users u
                    LEFT JOIN user_roles ur ON u.user_id = ur.user_id
                    LEFT JOIN roles r ON ur.role_id = r.role_id
                    WHERE u.user_id = @id
                `);

            if (result.recordset.length === 0) return null;

            const userRecord = result.recordset[0];
            const roles = result.recordset.map(r => r.role_code).filter(r => r !== null);

            return {
                ...userRecord,
                roles: roles
            };
        } catch (error) {
            throw error;
        }
    }

    static async checkExists(email, phone) {
        try {
            const pool = await sql.connect();
            const result = await pool.request()
                .input('email', sql.NVarChar, email)
                .input('phone', sql.NVarChar, phone)
                .query('SELECT user_id FROM users WHERE email = @email OR phone = @phone');
            return result.recordset.length > 0;
        } catch (error) {
            throw error;
        }
    }

    static async create(data) {
        // data: { full_name, email, phone, password_hash, status }
        const pool = await sql.connect();
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            const userResult = await transaction.request()
                .input('full_name', sql.NVarChar, data.full_name)
                .input('email', sql.NVarChar, data.email)
                .input('phone', sql.NVarChar, data.phone)
                .input('password_hash', sql.NVarChar, data.password_hash)
                .input('status', sql.NVarChar, data.status || 'active')
                .query(`
                    INSERT INTO users (full_name, email, phone, password_hash, status)
                    OUTPUT INSERTED.user_id
                    VALUES (@full_name, @email, @phone, @password_hash, @status)
                `);

            const userId = userResult.recordset[0].user_id;

            // Assign Default Role (Member)
            const roleResult = await transaction.request()
                .query("SELECT role_id FROM roles WHERE code = 'MEMBER'");

            if (roleResult.recordset.length > 0) {
                const roleId = roleResult.recordset[0].role_id;
                await transaction.request()
                    .input('user_id', sql.BigInt, userId)
                    .input('role_id', sql.Int, roleId)
                    .query('INSERT INTO user_roles (user_id, role_id) VALUES (@user_id, @role_id)');
            }

            await transaction.commit();
            return userId;
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
}

module.exports = User;
