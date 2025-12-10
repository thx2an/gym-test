const { sql, connectDB } = require('../src/config/db');
require('dotenv').config();

const debugSprint2 = async () => {
    try {
        await connectDB();
        const pool = await sql.connect();

        // 1. Get the latest user (Final Auto Test)
        const userRes = await pool.request()
            .query("SELECT TOP 1 * FROM users ORDER BY user_id DESC");

        const user = userRes.recordset[0];
        console.log('Latest User:', { id: user.user_id, email: user.email });

        // 2. Get Memberships
        const memRes = await pool.request()
            .input('uid', sql.BigInt, user.user_id)
            .query(`
                SELECT m.membership_id, m.status, p.name as package_name, m.start_date
                FROM memberships m
                JOIN membership_packages p ON m.package_id = p.package_id
                WHERE m.user_id = @uid
            `);
        console.log('Memberships:', memRes.recordset);

        // 3. Get Payments
        const payRes = await pool.request()
            .input('uid', sql.BigInt, user.user_id)
            .query(`
                SELECT payment_id, status, amount, membership_id
                FROM payments
                WHERE member_id = @uid
            `);
        console.log('Payments:', payRes.recordset);

        process.exit(0);
    } catch (err) {
        console.error('Debug Error:', err);
        process.exit(1);
    }
};

debugSprint2();
