const { sql } = require('../../config/database');

class Payment {
    static async findById(id) {
        const pool = await sql.connect();
        const res = await pool.request().input('id', sql.BigInt, id).query("SELECT * FROM payments WHERE payment_id = @id");
        return res.recordset[0] || null;
    }

    static async updateStatus(id, status, method) {
        const pool = await sql.connect();
        const res = await pool.request()
            .input('id', sql.BigInt, id)
            .input('status', sql.NVarChar, status)
            .input('method', sql.NVarChar, method || 'PayOS')
            .query("UPDATE payments SET status = @status, method = @method WHERE payment_id = @id");
        return res.rowsAffected[0] > 0;
    }
}

module.exports = Payment;
