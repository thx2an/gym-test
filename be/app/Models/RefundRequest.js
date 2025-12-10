const { sql } = require('../../config/database');

class RefundRequest {
    static async create(data) {
        const pool = await sql.connect();
        await pool.request()
            .input('pid', sql.BigInt, data.payment_id)
            .input('uid', sql.BigInt, data.member_id)
            .input('reason', sql.NVarChar, data.reason)
            .query("INSERT INTO refund_requests (payment_id, member_id, reason, status) VALUES (@pid, @uid, @reason, 'pending')");
        return true;
    }

    static async findByPayment(paymentId) {
        const pool = await sql.connect();
        const res = await pool.request().input('pid', sql.BigInt, paymentId).query("SELECT * FROM refund_requests WHERE payment_id = @pid");
        return res.recordset;
    }

    static async getAllDetailed() {
        const pool = await sql.connect();
        const result = await pool.request().query(`
            SELECT r.*, u.email, u.full_name, p.amount, pkg.name as package_name
            FROM refund_requests r
            JOIN users u ON r.member_id = u.user_id
            JOIN payments p ON r.payment_id = p.payment_id
            LEFT JOIN memberships m ON p.membership_id = m.membership_id
            LEFT JOIN membership_packages pkg ON m.package_id = pkg.package_id
            ORDER BY r.requested_at DESC
        `);
        return result.recordset;
    }
}

module.exports = RefundRequest;
