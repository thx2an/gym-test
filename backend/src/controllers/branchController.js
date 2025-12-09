const { sql } = require('../config/db');

// Get all branches
const getAllBranches = async (req, res) => {
    try {
        const pool = await sql.connect();
        const result = await pool.request().query('SELECT * FROM branches ORDER BY branch_id DESC');
        res.json(result.recordset);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Create a new branch
const createBranch = async (req, res) => {
    try {
        const { name, address, phone } = req.body;

        if (!name || !address) {
            return res.status(400).json({ message: 'Name and Address are required' });
        }

        const pool = await sql.connect();
        await pool.request()
            .input('name', sql.NVarChar, name)
            .input('address', sql.NVarChar, address)
            .input('phone', sql.NVarChar, phone)
            .query('INSERT INTO branches (name, address, phone) VALUES (@name, @address, @phone)');

        res.status(201).json({ message: 'Branch created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Update a branch
const updateBranch = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, address, phone, is_active } = req.body;

        const pool = await sql.connect();
        await pool.request()
            .input('id', sql.Int, id)
            .input('name', sql.NVarChar, name)
            .input('address', sql.NVarChar, address)
            .input('phone', sql.NVarChar, phone)
            .input('is_active', sql.Bit, is_active)
            .query(`
                UPDATE branches 
                SET name = @name, address = @address, phone = @phone, is_active = @is_active 
                WHERE branch_id = @id
            `);

        res.json({ message: 'Branch updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Delete a branch (Soft delete recommended, but per requirements or admin rights)
const deleteBranch = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await sql.connect();

        // Check for dependencies (optional but good practice)
        // const check = await pool.request().input('id', sql.Int, id).query('SELECT TOP 1 * FROM user_branch WHERE branch_id = @id');
        // if (check.recordset.length > 0) return res.status(400).json({message: 'Cannot delete branch with assigned users'});

        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM branches WHERE branch_id = @id');

        res.json({ message: 'Branch deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getAllBranches, createBranch, updateBranch, deleteBranch };
