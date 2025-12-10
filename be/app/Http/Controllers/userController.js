const { sql } = require('../config/db');

// Get current user profile
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const pool = await sql.connect();

        const result = await pool.request()
            .input('id', sql.BigInt, userId)
            .query('SELECT user_id, full_name, email, phone, gender, date_of_birth, created_at FROM users WHERE user_id = @id');

        if (result.recordset.length === 0) return res.status(404).json({ message: 'User not found' });

        res.json(result.recordset[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Update profile
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { full_name, phone, gender, date_of_birth } = req.body;

        const pool = await sql.connect();
        await pool.request()
            .input('id', sql.BigInt, userId)
            .input('name', sql.NVarChar, full_name)
            .input('phone', sql.NVarChar, phone)
            .input('gender', sql.NVarChar, gender)
            .input('dob', sql.Date, date_of_birth) // Format YYYY-MM-DD
            .query(`
                UPDATE users 
                SET full_name = @name, phone = @phone, gender = @gender, date_of_birth = @dob 
                WHERE user_id = @id
            `);

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getProfile, updateProfile };
