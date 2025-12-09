const { sql } = require('../config/db');

// Registers a user as a trainer (or updates profile)
const updateTrainerProfile = async (req, res) => {
    try {
        const { specialization, bio, experienceYears } = req.body;
        const userId = req.user.id; // User must already be authorized

        const pool = await sql.connect();

        // Check if profile exists
        const checkRes = await pool.request()
            .input('uid', sql.BigInt, userId)
            .query("SELECT trainer_id FROM trainer_profiles WHERE user_id = @uid");

        if (checkRes.recordset.length > 0) {
            // Update
            await pool.request()
                .input('uid', sql.BigInt, userId)
                .input('spec', sql.NVarChar, specialization)
                .input('bio', sql.NVarChar, bio)
                .input('exp', sql.Int, experienceYears)
                .query(`
                    UPDATE trainer_profiles 
                    SET specialization = @spec, bio = @bio, experience_years = @exp
                    WHERE user_id = @uid
                `);
            res.json({ message: 'Trainer profile updated' });
        } else {
            // Create
            await pool.request()
                .input('uid', sql.BigInt, userId)
                .input('spec', sql.NVarChar, specialization)
                .input('bio', sql.NVarChar, bio)
                .input('exp', sql.Int, experienceYears)
                .query(`
                    INSERT INTO trainer_profiles (user_id, specialization, bio, experience_years)
                    VALUES (@uid, @spec, @bio, @exp)
                `);
            res.json({ message: 'Trainer profile created' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getTrainers = async (req, res) => {
    try {
        const pool = await sql.connect();
        const result = await pool.request().query(`
            SELECT t.trainer_id, t.specialization, t.bio, t.experience_years, u.full_name, u.email, b.name as branch_name
            FROM trainer_profiles t
            JOIN users u ON t.user_id = u.user_id
            LEFT JOIN user_branch ub ON u.user_id = ub.user_id
            LEFT JOIN branches b ON ub.branch_id = b.branch_id
        `);
        res.json(result.recordset);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const setAvailability = async (req, res) => {
    try {
        const { date, startTime, endTime, isRecurring, dayOfWeek } = req.body;
        const userId = req.user.id;

        const pool = await sql.connect();

        // Get Trainer ID
        const trainerRes = await pool.request()
            .input('uid', sql.BigInt, userId)
            .query("SELECT trainer_id FROM trainer_profiles WHERE user_id = @uid");

        if (trainerRes.recordset.length === 0) return res.status(404).json({ message: 'Trainer profile not found' });
        const trainerId = trainerRes.recordset[0].trainer_id;

        // Get Branch (Assuming 1 primary branch for now)
        const branchRes = await pool.request()
            .input('uid', sql.BigInt, userId)
            .query("SELECT branch_id FROM user_branch WHERE user_id = @uid");

        if (branchRes.recordset.length === 0) return res.status(400).json({ message: 'Trainer not assigned to a branch' });
        const branchId = branchRes.recordset[0].branch_id;

        await pool.request()
            .input('tid', sql.BigInt, trainerId)
            .input('bid', sql.Int, branchId)
            .input('date', sql.Date, date)
            .input('start', sql.Time, startTime)
            .input('end', sql.Time, endTime)
            .input('recur', sql.Bit, isRecurring || 0)
            .input('dow', sql.TinyInt, dayOfWeek)
            .query(`
                INSERT INTO trainer_availability (trainer_id, branch_id, date, start_time, end_time, is_recurring, day_of_week)
                VALUES (@tid, @bid, @date, @start, @end, @recur, @dow)
            `);

        res.json({ message: 'Availability added' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getTrainerSchedule = async (req, res) => {
    try {
        const { trainerId } = req.params;
        const pool = await sql.connect();

        const result = await pool.request()
            .input('tid', sql.BigInt, trainerId)
            .query("SELECT * FROM trainer_availability WHERE trainer_id = @tid AND is_blocked = 0");

        res.json(result.recordset);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { updateTrainerProfile, getTrainers, setAvailability, getTrainerSchedule };
