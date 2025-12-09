const jwt = require('jsonwebtoken');
const { sql, connectDB } = require('../src/config/db');
require('dotenv').config();

const generateToken = async () => {
    try {
        await connectDB();

        const email = 'auto_test_112233@gmail.com';

        const userRes = await new sql.Request()
            .input('email', sql.NVarChar, email)
            .query("SELECT * FROM users WHERE email = @email");

        if (userRes.recordset.length === 0) {
            console.error('User not found');
            process.exit(1);
        }

        const user = userRes.recordset[0];

        // Fetch Roles
        const rolesRes = await new sql.Request()
            .input('uid', sql.BigInt, user.user_id)
            .query("SELECT r.code FROM roles r JOIN user_roles ur ON r.role_id = ur.role_id WHERE ur.user_id = @uid");

        const roles = rolesRes.recordset.map(r => r.code);

        const payload = {
            id: user.user_id,
            email: user.email,
            roles: roles
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        const fs = require('fs');
        fs.writeFileSync('token.txt', token);
        console.log('Token written to token.txt');
        process.exit(0);

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

generateToken();
