const { sql } = require('../../config/database');

class TrainerAvailability {
    static async create(data) {
        const pool = await sql.connect();
        await pool.request()
            .input('tid', sql.BigInt, data.trainer_id)
            .input('bid', sql.Int, data.branch_id)
            .input('date', sql.Date, data.date)
            .input('start', sql.Time, data.start_time)
            .input('end', sql.Time, data.end_time)
            .input('recur', sql.Bit, data.is_recurring ? 1 : 0)
            .input('dow', sql.TinyInt, data.day_of_week)
            .query(`
                INSERT INTO trainer_availability (trainer_id, branch_id, date, start_time, end_time, is_recurring, day_of_week)
                VALUES (@tid, @bid, @date, @start, @end, @recur, @dow)
            `);
        return true;
    }

    static async findByTrainer(trainerId) {
        const pool = await sql.connect();
        const result = await pool.request()
            .input('tid', sql.BigInt, trainerId)
            .query("SELECT * FROM trainer_availability WHERE trainer_id = @tid AND is_blocked = 0");
        return result.recordset;
    }

    static async findByTrainerAndParams(trainerId, date, dayOfWeek) {
        const pool = await sql.connect();
        const result = await pool.request()
            .input('tid', sql.BigInt, trainerId)
            .input('date', sql.Date, date)
            .input('dow', sql.TinyInt, dayOfWeek)
            .query(`
                SELECT * FROM trainer_availability 
                WHERE trainer_id = @tid 
                AND is_blocked = 0
                AND (
                    (is_recurring = 1 AND day_of_week = @dow)
                    OR 
                    (is_recurring = 0 AND date = @date)
                )
            `);
        return result.recordset;
    }

    static async getTrainerBranch(userId) {
        const pool = await sql.connect();
        return pool.request()
            .input('uid', sql.BigInt, userId)
            .query("SELECT top 1 branch_id FROM user_branch WHERE user_id = @uid");
    }
}

module.exports = TrainerAvailability;
