const { sql } = require('../config/db');

// Helper to check if a slot is booked
const isSlotBooked = async (pool, trainerId, date, startTime) => {
    // Check training_sessions for overlap
    // Assuming 1 hour sessions for simplicity, or we check exact start_time
    // In real app, we check ranges. Here, assume fixed slots.
    const res = await pool.request()
        .input('tid', sql.BigInt, trainerId)
        .input('start', sql.DateTime, startTime) // startTime acts as the unique slot identifier here
        .query(`
            SELECT session_id FROM training_sessions 
            WHERE trainer_id = @tid 
            AND status IN ('confirmed', 'pending')
            AND start_time = @start
        `);
    return res.recordset.length > 0;
};

const getAvailableSlots = async (req, res) => {
    try {
        const { trainerId, date } = req.query; // date format: YYYY-MM-DD
        if (!trainerId || !date) return res.status(400).json({ message: 'Missing trainerId or date' });

        const pool = await sql.connect();

        // 1. Get Trainer's Defined Availability for this day (or recurring)
        // Convert input date to DayOfWeek (0=Sun, 1=Mon, etc.)
        // SQL Server DATEPART(dw, date) returns 1 for Sunday by default (US), depends on SET DATEFIRST.
        // Let's rely on JS to get day of week.
        const inputDate = new Date(date);
        const dayOfWeek = inputDate.getDay(); // 0-6 (Sun-Sat)

        // Fetch availability ranges
        const availRes = await pool.request()
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

        const availabilityRanges = availRes.recordset;
        let availableSlots = [];

        // 2. Generate slots (hourly) from ranges
        for (const range of availabilityRanges) {
            // Assume start_time and end_time are Date objects (from driver) or strings
            // We need to parse time part. 
            // SQL Time type comes as Date object with 1970-01-01 usually.

            let start = new Date(range.start_time);
            let end = new Date(range.end_time);

            // Should normalize to purely time based loop
            let current = new Date(start);

            while (current < end) {
                // Determine slot actual datetime
                const slotTime = new Date(date);
                slotTime.setHours(current.getUTCHours(), current.getUTCMinutes(), 0, 0);

                // Slot end time (assume 60 min session)
                const slotEnd = new Date(slotTime);
                slotEnd.setHours(slotEnd.getHours() + 1);

                if (slotEnd <= new Date(date + 'T' + range.end_time.toISOString().split('T')[1])) {
                    // Just simple check logic: checks if slot is taken
                    // Need correct formatting for SQL query
                    const isBooked = await isSlotBooked(pool, trainerId, date, slotTime);

                    if (!isBooked) {
                        availableSlots.push({
                            time: current.toISOString().split('T')[1].substring(0, 5), // HH:MM
                            datetime: slotTime
                        });
                    }
                }

                // Increment 1 hour
                current.setHours(current.getHours() + 1);
            }
        }

        // Remove duplicates if any ranges overlap (basic safety)
        const uniqueSlots = [...new Map(availableSlots.map(item => [item.time, item])).values()];

        // Sort
        uniqueSlots.sort((a, b) => a.time.localeCompare(b.time));

        res.json(uniqueSlots);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const createBooking = async (req, res) => {
    try {
        const { trainerId, startTime, notes } = req.body; // startTime is full ISO datetime
        const memberId = req.user.id;

        const pool = await sql.connect();

        // Check availability again (race condition)
        const isTaken = await pool.request()
            .input('tid', sql.BigInt, trainerId)
            .input('start', sql.DateTime, startTime)
            .query(`
                SELECT session_id FROM training_sessions 
                WHERE trainer_id = @tid 
                AND status IN ('confirmed', 'pending')
                AND start_time = @start
            `);

        if (isTaken.recordset.length > 0) {
            return res.status(409).json({ message: 'Slot already booked' });
        }

        // Get Branch (assume Trainer's primary branch or pass in body)
        // For now, lookup trainer branch via availability or profile lookup
        // We'll just look up where the trainer generally works.
        const branchRes = await pool.request().input('tid', sql.BigInt, trainerId).query(`
            SELECT TOP 1 branch_id FROM trainer_availability WHERE trainer_id = @tid
        `);
        // If no availability set, maybe look at user_branch... fallback to 1
        const branchId = branchRes.recordset.length > 0 ? branchRes.recordset[0].branch_id : 1;

        // Calculate EndTime (Assume 1 hour)
        const start = new Date(startTime);
        const end = new Date(start);
        end.setHours(end.getHours() + 1);

        await pool.request()
            .input('memId', sql.BigInt, memberId)
            .input('tid', sql.BigInt, trainerId)
            .input('bid', sql.Int, branchId)
            .input('start', sql.DateTime, start)
            .input('end', sql.DateTime, end)
            .input('notes', sql.NVarChar, notes)
            .query(`
                INSERT INTO training_sessions (member_id, trainer_id, branch_id, start_time, end_time, status, notes)
                VALUES (@memId, @tid, @bid, @start, @end, 'confirmed', @notes)
            `);
        // Status confirmed immediately for simplicity, could be pending payment if needed.

        res.json({ message: 'Booking successful' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getMyBookings = async (req, res) => {
    try {
        const userId = req.user.id;
        const pool = await sql.connect();

        const result = await pool.request()
            .input('uid', sql.BigInt, userId)
            .query(`
                SELECT s.*, u.full_name as trainer_name 
                FROM training_sessions s
                JOIN trainer_profiles tp ON s.trainer_id = tp.trainer_id
                JOIN users u ON tp.user_id = u.user_id
                WHERE s.member_id = @uid
                ORDER BY s.start_time DESC
            `);

        res.json(result.recordset);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getAvailableSlots, createBooking, getMyBookings };
