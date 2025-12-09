const { sql } = require('../config/db');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../middleware/authMiddleware');

const register = async (req, res) => {
    try {
        const { full_name, email, phone, password } = req.body;

        // Validate input
        if (!full_name || !email || !password || !phone) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Connect to DB
        const pool = await sql.connect();

        // Check if user exists
        const checkUser = await pool.request()
            .input('email', sql.NVarChar, email)
            .input('phone', sql.NVarChar, phone)
            .query('SELECT user_id FROM users WHERE email = @email OR phone = @phone');

        if (checkUser.recordset.length > 0) {
            return res.status(400).json({ message: 'User with this email or phone already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Insert User
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            const userResult = await transaction.request()
                .input('full_name', sql.NVarChar, full_name)
                .input('email', sql.NVarChar, email)
                .input('phone', sql.NVarChar, phone)
                .input('password_hash', sql.NVarChar, password_hash)
                .input('status', sql.NVarChar, 'active')
                .query(`
                INSERT INTO users (full_name, email, phone, password_hash, status)
                OUTPUT INSERTED.user_id
                VALUES (@full_name, @email, @phone, @password_hash, @status)
            `);

            const userId = userResult.recordset[0].user_id;

            // Assign 'MEMBER' role by default
            const roleResult = await transaction.request()
                .query("SELECT role_id FROM roles WHERE code = 'MEMBER'");

            if (roleResult.recordset.length > 0) {
                const roleId = roleResult.recordset[0].role_id;
                await transaction.request()
                    .input('user_id', sql.BigInt, userId)
                    .input('role_id', sql.Int, roleId)
                    .query('INSERT INTO user_roles (user_id, role_id) VALUES (@user_id, @role_id)');
            }

            await transaction.commit();
            res.status(201).json({ message: 'User registered successfully', userId });

        } catch (err) {
            await transaction.rollback();
            throw err;
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const pool = await sql.connect();

        // Get user and their roles
        const result = await pool.request()
            .input('email', sql.NVarChar, email)
            .query(`
                SELECT u.user_id, u.full_name, u.email, u.password_hash, u.status, r.code as role_code
                FROM users u
                LEFT JOIN user_roles ur ON u.user_id = ur.user_id
                LEFT JOIN roles r ON ur.role_id = r.role_id
                WHERE u.email = @email
            `);

        if (result.recordset.length === 0) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const userRecord = result.recordset[0];

        // Aggregate roles if user has multiple
        const roles = result.recordset.map(r => r.role_code).filter(r => r !== null);

        // Check password
        const validPassword = await bcrypt.compare(password, userRecord.password_hash);

        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        if (userRecord.status !== 'active') {
            return res.status(403).json({ message: 'Account is not active' });
        }

        // Generate Token
        const token = generateToken({
            user_id: userRecord.user_id,
            email: userRecord.email,
            roles: roles
        });

        res.json({
            message: 'Login Successful',
            token,
            user: {
                id: userRecord.user_id,
                name: userRecord.full_name,
                email: userRecord.email,
                roles: roles
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { register, login };
