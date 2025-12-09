const { sql } = require('../config/db');
const bcrypt = require('bcryptjs');

// Get all staff (Managers and PTs)
const getAllStaff = async (req, res) => {
    try {
        const pool = await sql.connect();
        const result = await pool.request().query(`
            SELECT u.user_id, u.full_name, u.email, u.phone, u.status, r.name as role_name, r.code as role_code
            FROM users u
            JOIN user_roles ur ON u.user_id = ur.user_id
            JOIN roles r ON ur.role_id = r.role_id
            WHERE r.code IN ('MANAGER', 'PT')
            ORDER BY u.user_id DESC
        `);
        res.json(result.recordset);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Create a new staff member
const createStaff = async (req, res) => {
    try {
        const { full_name, email, phone, password, role_code } = req.body;

        if (!full_name || !email || !password || !role_code) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        if (!['MANAGER', 'PT'].includes(role_code)) {
            return res.status(400).json({ message: 'Invalid role for staff' });
        }

        const pool = await sql.connect();

        // Check user existence
        const check = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT user_id FROM users WHERE email = @email');
        if (check.recordset.length > 0) return res.status(400).json({ message: 'Email already exists' });

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // 1. Create User
            const userRes = await transaction.request()
                .input('name', sql.NVarChar, full_name)
                .input('email', sql.NVarChar, email)
                .input('phone', sql.NVarChar, phone)
                .input('hash', sql.NVarChar, password_hash)
                .query(`
                    INSERT INTO users (full_name, email, phone, password_hash, status) 
                    OUTPUT INSERTED.user_id 
                    VALUES (@name, @email, @phone, @hash, 'active')
                `);

            const userId = userRes.recordset[0].user_id;

            // 2. Get Role ID
            const roleRes = await transaction.request()
                .input('code', sql.NVarChar, role_code)
                .query('SELECT role_id FROM roles WHERE code = @code');

            if (roleRes.recordset.length === 0) throw new Error('Role not found');
            const roleId = roleRes.recordset[0].role_id;

            // 3. Assign Role
            await transaction.request()
                .input('uid', sql.BigInt, userId)
                .input('rid', sql.Int, roleId)
                .query('INSERT INTO user_roles (user_id, role_id) VALUES (@uid, @rid)');

            // 4. Create Trainer Profile if PT
            if (role_code === 'PT') {
                await transaction.request()
                    .input('uid', sql.BigInt, userId)
                    .query('INSERT INTO trainer_profiles (user_id) VALUES (@uid)');
            }

            await transaction.commit();
            res.status(201).json({ message: 'Staff created successfully' });

        } catch (err) {
            await transaction.rollback();
            throw err;
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = { getAllStaff, createStaff };
