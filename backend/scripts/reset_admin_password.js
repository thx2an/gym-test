const { sql, connectDB } = require('../src/config/db');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const resetPassword = async () => {
    try {
        await connectDB();

        const password = 'Admin@123';
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        console.log('Generated Hash:', hash);

        const pool = await sql.connect();
        await pool.request()
            .input('hash', sql.NVarChar, hash)
            .input('email', sql.NVarChar, 'admin@gymnexus.com')
            .query('UPDATE users SET password_hash = @hash WHERE email = @email');

        console.log('✅ Admin password has been reset successfully to: Admin@123');
        process.exit(0);
    } catch (err) {
        console.error('❌ Failed to reset password:', err);
        process.exit(1);
    }
};

resetPassword();
