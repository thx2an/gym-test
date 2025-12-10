const { sql } = require('../../config/database');

class TrainerProfile {
    static async findByUserId(userId) {
        const pool = await sql.connect();
        const res = await pool.request()
            .input('uid', sql.BigInt, userId)
            .query("SELECT * FROM trainer_profiles WHERE user_id = @uid");
        return res.recordset[0] || null;
    }

    static async create(data) {
        const pool = await sql.connect();
        await pool.request()
            .input('uid', sql.BigInt, data.user_id)
            .input('spec', sql.NVarChar, data.specialization)
            .input('bio', sql.NVarChar, data.bio)
            .input('exp', sql.Int, data.experience_years)
            .query(`
                INSERT INTO trainer_profiles (user_id, specialization, bio, experience_years)
                VALUES (@uid, @spec, @bio, @exp)
            `);
        return true;
    }

    static async update(userId, data) {
        const pool = await sql.connect();
        await pool.request()
            .input('uid', sql.BigInt, userId)
            .input('spec', sql.NVarChar, data.specialization)
            .input('bio', sql.NVarChar, data.bio)
            .input('exp', sql.Int, data.experience_years)
            .query(`
                UPDATE trainer_profiles 
                SET specialization = @spec, bio = @bio, experience_years = @exp
                WHERE user_id = @uid
            `);
        return true;
    }

    static async getAllWithUser() {
        const pool = await sql.connect();
        const result = await pool.request().query(`
            SELECT t.trainer_id, t.specialization, t.bio, t.experience_years, u.full_name, u.email
            FROM trainer_profiles t
            JOIN users u ON t.user_id = u.user_id
        `);
        return result.recordset;
    }
}

module.exports = TrainerProfile;
