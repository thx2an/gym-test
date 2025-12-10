const { sql, connectDB } = require('../src/config/db');

async function seedAvailability() {
    try {
        console.log('Connecting to database...');
        await connectDB();

        // Get all trainer IDs
        const trainers = await new sql.Request().query("SELECT trainer_id FROM trainer_profiles");

        // Get a valid Branch ID (default 1)
        const branchRes = await new sql.Request().query("SELECT TOP 1 branch_id FROM branches");
        if (branchRes.recordset.length === 0) {
            // Seed a branch if none
            await new sql.Request().query("INSERT INTO branches (name, address) VALUES ('Main Branch', '123 Gym St')");
        }
        const branchId = 1; // Assume 1 exists now

        for (const t of trainers.recordset) {
            const tid = t.trainer_id;

            // Check if availability exists
            const check = await new sql.Request().input('tid', sql.BigInt, tid).query("SELECT * FROM trainer_availability WHERE trainer_id = @tid");

            if (check.recordset.length === 0) {
                // Add Mon-Fri 9AM-5PM Recurring
                for (let day = 1; day <= 5; day++) {
                    await new sql.Request()
                        .input('tid', sql.BigInt, tid)
                        .input('bid', sql.Int, branchId)
                        .input('dow', sql.TinyInt, day)
                        .query(`
                            INSERT INTO trainer_availability (trainer_id, branch_id, start_time, end_time, is_recurring, day_of_week)
                            VALUES (@tid, @bid, '09:00:00', '17:00:00', 1, @dow)
                        `);
                }
                console.log(`Availability seeded for Trainer ID: ${tid}`);
            }
        }

        console.log('Availability Seeding Completed!');
        process.exit(0);

    } catch (err) {
        console.error('Seeding Failed:', err);
        process.exit(1);
    }
}

seedAvailability();
