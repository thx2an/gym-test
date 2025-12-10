const { sql } = require('../config/db');

// Get all packages
const getAllPackages = async (req, res) => {
    try {
        const pool = await sql.connect();
        const result = await pool.request().query('SELECT * FROM membership_packages ORDER BY price ASC');
        res.json(result.recordset);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Create Package
const createPackage = async (req, res) => {
    try {
        const { code, name, description, duration_days, price, benefits } = req.body;

        const pool = await sql.connect();
        await pool.request()
            .input('code', sql.NVarChar, code)
            .input('name', sql.NVarChar, name)
            .input('desc', sql.NVarChar, description)
            .input('dur', sql.Int, duration_days)
            .input('price', sql.Decimal, price)
            .input('ben', sql.NVarChar, benefits)
            .query(`
                INSERT INTO membership_packages (code, name, description, duration_days, price, benefits)
                VALUES (@code, @name, @desc, @dur, @price, @ben)
            `);

        res.status(201).json({ message: 'Package created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getAllPackages, createPackage };
