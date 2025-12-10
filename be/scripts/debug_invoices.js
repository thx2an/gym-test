const { sql, connectDB } = require('../src/config/db');
require('dotenv').config();

const debugInvoices = async () => {
    try {
        await connectDB();
        const pool = await sql.connect();

        // 1. Check all invoices
        const invRes = await pool.request().query("SELECT * FROM invoices");
        console.log('All Invoices:', invRes.recordset);

        // 2. Check all payments
        const payRes = await pool.request().query("SELECT * FROM payments");
        console.log('All Payments:', payRes.recordset);

        // 3. Check query logic from invoiceController
        // Get the latest user ID to test the query
        const userRes = await pool.request().query("SELECT TOP 1 user_id FROM users ORDER BY user_id DESC");
        if (userRes.recordset.length > 0) {
            const userId = userRes.recordset[0].user_id;
            console.log('Testing Query for User ID:', userId);

            const queryRes = await pool.request()
                .input('userId', sql.BigInt, userId)
                .query(`
                    SELECT i.invoice_id, i.invoice_number, i.issued_at, i.total_amount, 
                           p.payment_id, pkg.name as package_name
                    FROM invoices i
                    JOIN payments p ON i.payment_id = p.payment_id
                    JOIN memberships m ON p.member_id = m.user_id AND p.membership_id = m.membership_id
                    JOIN membership_packages pkg ON m.package_id = pkg.package_id
                    WHERE p.member_id = @userId
                `);
            console.log('Controller Query Result:', queryRes.recordset);
        }

        process.exit(0);
    } catch (err) {
        console.error('Debug Error:', err);
        process.exit(1);
    }
};

debugInvoices();
