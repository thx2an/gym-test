const { sql, connectDB } = require('../src/config/db');
const bcrypt = require('bcryptjs');

async function seedTrainers() {
    try {
        console.log('Connecting to database...');
        await connectDB();

        // 1. Ensure Trainer Role Exists
        await new sql.Request().query(`
            IF NOT EXISTS (SELECT * FROM roles WHERE code = 'PT')
            INSERT INTO roles (code, name) VALUES ('PT', 'Personal Trainer')
        `);

        const ptRoleRes = await new sql.Request().query("SELECT role_id FROM roles WHERE code = 'PT'");
        const ptRoleId = ptRoleRes.recordset[0].role_id;

        // 2. Create Dummy Trainers
        const trainers = [
            { name: 'John Doe', email: 'john.trainer@gymnexus.com', phone: '0909000111', spec: 'Bodybuilding', bio: 'Expert in muscle gain.', exp: 5 },
            { name: 'Sarah Smith', email: 'sarah.trainer@gymnexus.com', phone: '0909000222', spec: 'Yoga & Pilates', bio: 'Certified Yoga instructor.', exp: 3 },
            { name: 'Mike Tyson', email: 'mike.trainer@gymnexus.com', phone: '0909000333', spec: 'Boxing', bio: 'Former champion.', exp: 10 }
        ];

        for (const t of trainers) {
            // Check if user exists
            const userCheck = await new sql.Request().input('email', sql.NVarChar, t.email).query("SELECT user_id FROM users WHERE email = @email");
            let userId;

            if (userCheck.recordset.length === 0) {
                const hash = await bcrypt.hash('password123', 10);
                const userRes = await new sql.Request()
                    .input('name', sql.NVarChar, t.name)
                    .input('email', sql.NVarChar, t.email)
                    .input('phone', sql.NVarChar, t.phone)
                    .input('hash', sql.NVarChar, hash)
                    .query(`
                        INSERT INTO users (full_name, email, phone, password_hash, status)
                        OUTPUT INSERTED.user_id
                        VALUES (@name, @email, @phone, @hash, 'active')
                    `);
                userId = userRes.recordset[0].user_id;
                console.log(`Created user: ${t.name}`);
            } else {
                userId = userCheck.recordset[0].user_id;
            }

            // Assign Role
            const roleCheck = await new sql.Request()
                .input('uid', sql.BigInt, userId)
                .input('rid', sql.Int, ptRoleId)
                .query("SELECT * FROM user_roles WHERE user_id = @uid AND role_id = @rid");

            if (roleCheck.recordset.length === 0) {
                await new sql.Request()
                    .input('uid', sql.BigInt, userId)
                    .input('rid', sql.Int, ptRoleId)
                    .query("INSERT INTO user_roles (user_id, role_id) VALUES (@uid, @rid)");
            }

            // Create Profile
            const profileCheck = await new sql.Request().input('uid', sql.BigInt, userId).query("SELECT * FROM trainer_profiles WHERE user_id = @uid");
            if (profileCheck.recordset.length === 0) {
                await new sql.Request()
                    .input('uid', sql.BigInt, userId)
                    .input('spec', sql.NVarChar, t.spec)
                    .input('bio', sql.NVarChar, t.bio)
                    .input('exp', sql.Int, t.exp)
                    .query(`
                        INSERT INTO trainer_profiles (user_id, specialization, bio, experience_years)
                        VALUES (@uid, @spec, @bio, @exp)
                    `);
                console.log(`Created profile for: ${t.name}`);
            }
        }

        console.log('Trainer Seeding Completed!');
        process.exit(0);

    } catch (err) {
        console.error('Seeding Failed:', err);
        process.exit(1);
    }
}

seedTrainers();
