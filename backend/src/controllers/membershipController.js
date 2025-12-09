const { sql } = require('../config/db');

// Get all available packages (Already in packageController, but useful here if needed specially)

// Get Current User's Membership
const getMyMembership = async (req, res) => {
    try {
        const userId = req.user.id;
        const pool = await sql.connect();

        const result = await pool.request()
            .input('userId', sql.BigInt, userId)
            .query(`
                SELECT m.membership_id, m.start_date, m.end_date, m.status, 
                       p.name as package_name, p.benefits
                FROM memberships m
                JOIN membership_packages p ON m.package_id = p.package_id
                WHERE m.user_id = @userId AND m.status IN ('active', 'pending')
                ORDER BY 
                    CASE WHEN m.status = 'active' THEN 0 ELSE 1 END,
                    m.end_date DESC
            `);

        res.json(result.recordset);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Purchase a Package (Create Pending Membership & Payment)
const purchasePackage = async (req, res) => {
    try {
        const userId = req.user.id;
        const { packageId } = req.body;

        const pool = await sql.connect();

        // 1. Get Package Details
        const pkgResult = await pool.request()
            .input('pkgId', sql.Int, packageId)
            .query('SELECT * FROM membership_packages WHERE package_id = @pkgId');

        if (pkgResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Package not found' });
        }
        const pkg = pkgResult.recordset[0];

        // 2. Create Transaction
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // 3. Create Pending Membership
            // Start date = today, End date = today + duration
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(startDate.getDate() + pkg.duration_days);

            const memResult = await transaction.request()
                .input('userId', sql.BigInt, userId)
                .input('pkgId', sql.Int, packageId)
                .input('start', sql.Date, startDate)
                .input('end', sql.Date, endDate)
                .input('status', sql.NVarChar, 'pending') // Pending payment
                .query(`
                    INSERT INTO memberships (user_id, package_id, start_date, end_date, status)
                    OUTPUT INSERTED.membership_id
                    VALUES (@userId, @pkgId, @start, @end, @status)
                `);
            const membershipId = memResult.recordset[0].membership_id;

            // 4. Create Pending Payment
            const payResult = await transaction.request()
                .input('memberId', sql.BigInt, userId)
                .input('amount', sql.Decimal(18, 2), pkg.price)
                .input('currency', sql.NVarChar, 'VND')
                .input('status', sql.NVarChar, 'pending')
                .input('memId', sql.BigInt, membershipId)
                .input('desc', sql.NVarChar, `Pay for ${pkg.name}`)
                .query(`
                    INSERT INTO payments (member_id, amount, currency, status, membership_id, gateway_transaction_id)
                    OUTPUT INSERTED.payment_id
                    VALUES (@memberId, @amount, @currency, @status, @memId, @desc) 
                `);
            // Note: gateway_transaction_id used as description placeholder initially or generated code

            const paymentId = payResult.recordset[0].payment_id;

            await transaction.commit();
            res.status(201).json({
                message: 'Order created',
                membershipId,
                paymentId,
                amount: pkg.price,
                description: `Payment for ${pkg.name}`
            });

        } catch (err) {
            await transaction.rollback();
            throw err;
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get all packages (Public/Member)
const getPackages = async (req, res) => {
    try {
        const pool = await sql.connect();
        const result = await pool.request()
            .query('SELECT * FROM membership_packages WHERE is_active = 1');
        res.json(result.recordset);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getMyMembership, purchasePackage, getPackages };
