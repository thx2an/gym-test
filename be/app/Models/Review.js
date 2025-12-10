const { sql } = require('../../config/database');

class Review {
    static async create(data) {
        const pool = await sql.connect();
        await pool.request()
            .input('uid', sql.BigInt, data.user_id)
            .input('tid', sql.BigInt, data.trainer_id)
            .input('rate', sql.Int, data.rating)
            .input('com', sql.NVarChar, data.comment)
            .query(`
                INSERT INTO reviews (user_id, trainer_id, rating, comment, created_at)
                VALUES (@uid, @tid, @rate, @com, GETDATE())
            `);
        return true;
    }

    static async getByTrainer(trainerId) {
        const pool = await sql.connect();
        const result = await pool.request()
            .input('tid', sql.BigInt, trainerId)
            .query(`
                SELECT r.*, u.full_name, u.email 
                FROM reviews r
                JOIN users u ON r.user_id = u.user_id
                WHERE r.trainer_id = @tid
                ORDER BY r.created_at DESC
            `);
        return result.recordset;
    }

    static async hasCompletedSession(userId, trainerId) {
        const pool = await sql.connect();
        const result = await pool.request()
            .input('uid', sql.BigInt, userId)
            .input('tid', sql.BigInt, trainerId)
            .query(`
                SELECT session_id FROM training_sessions 
                WHERE member_id = @uid 
                AND trainer_id = @tid 
                AND status = 'completed'
            `);
        return result.recordset.length > 0;
    }
}

module.exports = Review;
