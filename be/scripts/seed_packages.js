const { sql, connectDB } = require('../config/database');

async function seedPackages() {
    try {
        await connectDB();
        const pool = await sql.connect();

        console.log('Seeding Packages...');

        const packages = [
            { code: 'BASIC_1M', name: 'Basic Monthly', description: 'Access to gym equipment, 1 branch', duration_days: 30, price: 500000, benefits: 'Gym access' },
            { code: 'PREMIUM_1M', name: 'Premium Monthly', description: 'Access to all branches, Sauna', duration_days: 30, price: 800000, benefits: 'All branches, Sauna, Towel' },
            { code: 'BASIC_6M', name: 'Basic 6 Months', description: 'Access to gym equipment, 1 branch', duration_days: 180, price: 2500000, benefits: 'Gym access' },
            { code: 'VIP_1Y', name: 'VIP Year', description: 'All Access + 12 PT Sessions', duration_days: 365, price: 10000000, benefits: 'All privileges' }
        ];

        for (const pkg of packages) {
            // Check if exists
            const check = await pool.request()
                .input('code', sql.NVarChar, pkg.code)
                .query('SELECT package_id FROM membership_packages WHERE code = @code');

            if (check.recordset.length === 0) {
                await pool.request()
                    .input('code', sql.NVarChar, pkg.code)
                    .input('name', sql.NVarChar, pkg.name)
                    .input('description', sql.NVarChar, pkg.description)
                    .input('duration_days', sql.Int, pkg.duration_days)
                    .input('price', sql.Decimal, pkg.price)
                    .input('benefits', sql.NVarChar, pkg.benefits)
                    .query(`
                        INSERT INTO membership_packages (code, name, description, duration_days, price, benefits)
                        VALUES (@code, @name, @description, @duration_days, @price, @benefits)
                    `);
                console.log(`Inserted: ${pkg.name}`);
            } else {
                console.log(`Skipped (Exists): ${pkg.name}`);
            }
        }
        console.log('Seeding Complete.');
        process.exit(0);
    } catch (err) {
        console.error('Seeding Failed:', err);
        process.exit(1);
    }
}

seedPackages();
