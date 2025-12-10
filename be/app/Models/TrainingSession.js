const { sql } = require('../../config/database');

class TrainingSession {
    static async findByTrainerAndStart(trainerId, startTime) {
        const pool = await sql.connect();
        const result = await pool.request()
            .input('tid', sql.BigInt, trainerId)
            .input('start', sql.DateTime, startTime)
            .query(`
                SELECT session_id FROM training_sessions 
                WHERE trainer_id = @tid 
                AND status IN ('confirmed', 'pending')
                AND start_time = @start
            `);
        return result.recordset;
    }

    static async create(data) {
        const pool = await sql.connect();
        await pool.request()
            .input('memId', sql.BigInt, data.member_id)
            .input('tid', sql.BigInt, data.trainer_id)
            .input('bid', sql.Int, data.branch_id)
            .input('start', sql.DateTime, data.start_time)
            .input('end', sql.DateTime, data.end_time)
            .input('notes', sql.NVarChar, data.notes)
            .query(`
                INSERT INTO training_sessions (member_id, trainer_id, branch_id, start_time, end_time, status, notes)
                VALUES (@memId, @tid, @bid, @start, @end, 'confirmed', @notes)
            `);
        return true;
    }

    static async getByMember(memberId) {
        const pool = await sql.connect();
        const result = await pool.request()
            .input('uid', sql.BigInt, memberId)
            .query(`
                SELECT s.*, u.full_name as trainer_name 
                FROM training_sessions s
                JOIN trainer_profiles tp ON s.trainer_id = tp.trainer_id
                JOIN users u ON tp.user_id = u.user_id
                WHERE s.member_id = @uid
                ORDER BY s.start_time DESC
            `);
        return result.recordset;
    }

    static async findByIdAndUser(sessionId, userId) {
        const pool = await sql.connect();
        const result = await pool.request()
            .input('sid', sql.BigInt, sessionId)
            .input('uid', sql.BigInt, userId)
            .query("SELECT * FROM training_sessions WHERE session_id = @sid AND member_id = @uid");
        return result.recordset[0] || null;
    }

    static async markCompleted(sessionId) {
        const pool = await sql.connect();
        await pool.request()
            .input('sid', sql.BigInt, sessionId)
            .query("UPDATE training_sessions SET status = 'completed' WHERE session_id = @sid");
        return true;
    }
}

module.exports = TrainingSession;
