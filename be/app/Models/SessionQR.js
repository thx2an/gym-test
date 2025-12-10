const { sql } = require('../../config/database');

class SessionQR {
    static async findActiveToken(sessionId) {
        const pool = await sql.connect();
        const result = await pool.request()
            .input('sid', sql.BigInt, sessionId)
            .query("SELECT token FROM session_qr_tokens WHERE session_id = @sid AND is_used = 0 AND expires_at > GETDATE()");
        return result.recordset[0] || null;
    }

    static async create(sessionId, token, expiresAt) {
        const pool = await sql.connect();
        await pool.request()
            .input('sid', sql.BigInt, sessionId)
            .input('token', sql.NVarChar, token)
            .input('exp', sql.DateTime, expiresAt)
            .query(`
                INSERT INTO session_qr_tokens (session_id, token, generated_at, expires_at, is_used)
                VALUES (@sid, @token, GETDATE(), @exp, 0)
            `);
        return true;
    }

    static async findByToken(token) {
        const pool = await sql.connect();
        const result = await pool.request()
            .input('token', sql.NVarChar, token)
            .query(`
                SELECT t.*, s.member_id, s.trainer_id 
                FROM session_qr_tokens t
                JOIN training_sessions s ON t.session_id = s.session_id
                WHERE t.token = @token AND t.is_used = 0 AND t.expires_at > GETDATE()
            `);
        return result.recordset[0] || null;
    }

    static async markUsed(qrId) {
        const pool = await sql.connect();
        await pool.request()
            .input('tid', sql.BigInt, qrId)
            .query("UPDATE session_qr_tokens SET is_used = 1 WHERE qr_id = @tid");
        return true;
    }
}

module.exports = SessionQR;
