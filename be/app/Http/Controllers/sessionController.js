const SessionQR = require('../../Models/SessionQR');
const TrainingSession = require('../../Models/TrainingSession');
const crypto = require('crypto');
const { sql } = require('../../../config/database');

class SessionController {

    async getSessionQR(req, res) {
        try {
            const { sessionId } = req.params;
            const userId = req.user.id;

            const session = await TrainingSession.findByIdAndUser(sessionId, userId);
            if (!session) return res.status(403).json({ status: false, message: 'Session not found or unauthorized' });

            const activeToken = await SessionQR.findActiveToken(sessionId);
            if (activeToken) {
                return res.json({ status: true, token: activeToken.token });
            }

            const token = crypto.randomBytes(16).toString('hex');
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 24);

            await SessionQR.create(sessionId, token, expiresAt);

            res.json({ status: true, token });
        } catch (error) {
            console.error(error);
            res.status(500).json({ status: false, message: 'Server Error' });
        }
    }

    async verifyCheckIn(req, res) {
        try {
            const { token } = req.body;
            // TODO: check req.user is Trainer/Admin

            const qrData = await SessionQR.findByToken(token);
            if (!qrData) return res.status(400).json({ status: false, message: 'Invalid or Expired QR Code' });

            // Transactional Check-in
            const pool = await sql.connect();
            const transaction = new sql.Transaction(pool);
            await transaction.begin();

            try {
                await transaction.request().input('tid', sql.BigInt, qrData.qr_id).query("UPDATE session_qr_tokens SET is_used = 1 WHERE qr_id = @tid");
                await transaction.request().input('sid', sql.BigInt, qrData.session_id).query("UPDATE training_sessions SET status = 'completed' WHERE session_id = @sid");
                await transaction.request()
                    .input('sid', sql.BigInt, qrData.session_id)
                    .input('mid', sql.BigInt, qrData.member_id)
                    .query("INSERT INTO checkins (session_id, member_id, scanned_at, is_valid) VALUES (@sid, @mid, GETDATE(), 1)");

                await transaction.commit();
                res.json({ status: true, message: 'Check-in Successful!' });
            } catch (err) {
                await transaction.rollback();
                throw err;
            }

        } catch (error) {
            console.error(error);
            res.status(500).json({ status: false, message: 'Server Error' });
        }
    }
}

module.exports = new SessionController();
