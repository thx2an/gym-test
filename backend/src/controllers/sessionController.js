const { sql } = require('../config/db');
const crypto = require('crypto');

// Generate a simpler unique token
const generateToken = () => {
    return crypto.randomBytes(16).toString('hex');
};

const getSessionQR = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;

        const pool = await sql.connect();

        // 1. Verify Session belongs to user
        const sessionRes = await pool.request()
            .input('sid', sql.BigInt, sessionId)
            .input('uid', sql.BigInt, userId)
            .query("SELECT * FROM training_sessions WHERE session_id = @sid AND member_id = @uid");

        if (sessionRes.recordset.length === 0) return res.status(403).json({ message: 'Session not found or unauthorized' });

        const session = sessionRes.recordset[0];

        // 2. Check if active token exists
        const tokenRes = await pool.request()
            .input('sid', sql.BigInt, sessionId)
            .query("SELECT token FROM session_qr_tokens WHERE session_id = @sid AND is_used = 0 AND expires_at > GETDATE()");

        if (tokenRes.recordset.length > 0) {
            return res.json({ token: tokenRes.recordset[0].token });
        }

        // 3. Generate New Token
        const token = generateToken();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // Valid for 24 hours

        await pool.request()
            .input('sid', sql.BigInt, sessionId)
            .input('token', sql.NVarChar, token)
            .input('exp', sql.DateTime, expiresAt)
            .query(`
                INSERT INTO session_qr_tokens (session_id, token, generated_at, expires_at, is_used)
                VALUES (@sid, @token, GETDATE(), @exp, 0)
            `);

        res.json({ token });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const verifyCheckIn = async (req, res) => {
    try {
        const { token } = req.body;
        // Trainer or Admin checks in the user
        // Ideally verify req.user.role is PT/ADMIN

        const pool = await sql.connect();

        // 1. Find Token
        const tokenRes = await pool.request()
            .input('token', sql.NVarChar, token)
            .query(`
                SELECT t.*, s.member_id, s.trainer_id 
                FROM session_qr_tokens t
                JOIN training_sessions s ON t.session_id = s.session_id
                WHERE t.token = @token AND t.is_used = 0 AND t.expires_at > GETDATE()
            `);

        if (tokenRes.recordset.length === 0) return res.status(400).json({ message: 'Invalid or Expired QR Code' });

        const qrData = tokenRes.recordset[0];

        // 2. Mark Token as Used
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            await transaction.request()
                .input('tid', sql.BigInt, qrData.qr_id)
                .query("UPDATE session_qr_tokens SET is_used = 1 WHERE qr_id = @tid");

            // 3. Mark Session as Completed (or Confirmed Check-in)
            await transaction.request()
                .input('sid', sql.BigInt, qrData.session_id)
                .query("UPDATE training_sessions SET status = 'completed' WHERE session_id = @sid");

            // 4. Create Check-in Record
            await transaction.request()
                .input('sid', sql.BigInt, qrData.session_id)
                .input('mid', sql.BigInt, qrData.member_id)
                .query(`
                    INSERT INTO checkins (session_id, member_id, scanned_at, is_valid)
                    VALUES (@sid, @mid, GETDATE(), 1)
                `);

            await transaction.commit();
            res.json({ message: 'Check-in Successful!' });

        } catch (err) {
            await transaction.rollback();
            throw err;
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getSessionQR, verifyCheckIn };
