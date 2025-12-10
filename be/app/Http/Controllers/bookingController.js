const TrainingSession = require('../../Models/TrainingSession');
const TrainerAvailability = require('../../Models/TrainerAvailability');
const TrainerProfile = require('../../Models/TrainerProfile');
const { sql } = require('../../config/database');

class BookingController {

    // Logic from gym-nexus getAvailableSlots
    async getAvailableSlots(req, res) {
        try {
            const { trainerId, date } = req.query;
            if (!trainerId || !date) return res.status(400).json({ status: false, message: 'Missing trainerId or date' });

            const inputDate = new Date(date);
            const dayOfWeek = inputDate.getDay();

            // 1. Get Availability
            const availRanges = await TrainerAvailability.findByTrainerAndParams(trainerId, date, dayOfWeek);
            let availableSlots = [];

            // 2. Generate slots
            for (const range of availRanges) {
                let start = new Date(range.start_time);
                let end = new Date(range.end_time);
                let current = new Date(start);

                while (current < end) {
                    const slotTime = new Date(date);
                    slotTime.setHours(current.getUTCHours(), current.getUTCMinutes(), 0, 0);

                    const slotEnd = new Date(slotTime);
                    slotEnd.setHours(slotEnd.getHours() + 1);

                    // Boundary Check
                    if (slotEnd <= new Date(date + 'T' + range.end_time.toISOString().split('T')[1])) {

                        // Check if booked
                        const booked = await TrainingSession.findByTrainerAndStart(trainerId, slotTime);

                        if (booked.length === 0) {
                            availableSlots.push({
                                time: current.toISOString().split('T')[1].substring(0, 5),
                                datetime: slotTime
                            });
                        }
                    }
                    current.setHours(current.getHours() + 1);
                }
            }

            const uniqueSlots = [...new Map(availableSlots.map(item => [item.time, item])).values()];
            uniqueSlots.sort((a, b) => a.time.localeCompare(b.time));

            res.json({ status: true, data: uniqueSlots });

        } catch (error) {
            console.error(error);
            res.status(500).json({ status: false, message: 'Server Error' });
        }
    }

    async createBooking(req, res) {
        try {
            const { trainerId, startTime, notes } = req.body;
            const memberId = req.user.id; // User from token

            // Check availability
            const isTaken = await TrainingSession.findByTrainerAndStart(trainerId, startTime);
            if (isTaken.length > 0) {
                return res.status(409).json({ status: false, message: 'Slot already booked' });
            }

            // Get Branch
            const branchRes = await TrainerAvailability.getTrainerBranch(trainerId); // Assumes userId logic in Model needs Fix or trainerId->UserId lookup
            // Actually, TrainerAvailability.getTrainerBranch takes userId. 
            // We need a way to get UserID from TrainerID or just query availability table for branch.
            // Simplified: Query Trainer Profiles/Availability to find branch.

            // Fix: Re-query for branch using TrainerID from availability table directly or just use default 1
            const pool = await sql.connect();
            const branchQ = await pool.request().input('tid', sql.BigInt, trainerId).query("SELECT TOP 1 branch_id FROM trainer_availability WHERE trainer_id = @tid");
            const branchId = branchQ.recordset.length > 0 ? branchQ.recordset[0].branch_id : 1;

            const start = new Date(startTime);
            const end = new Date(start);
            end.setHours(end.getHours() + 1);

            await TrainingSession.create({
                member_id: memberId,
                trainer_id: trainerId,
                branch_id: branchId, // found or default
                start_time: start,
                end_time: end,
                notes: notes
            });

            res.json({ status: true, message: 'Booking successful' });

        } catch (error) {
            console.error(error);
            res.status(500).json({ status: false, message: 'Server Error' });
        }
    }

    async getMyBookings(req, res) {
        try {
            const userId = req.user.id;
            const bookings = await TrainingSession.getByMember(userId);
            res.json({ status: true, data: bookings });
        } catch (error) {
            console.error(error);
            res.status(500).json({ status: false, message: 'Server Error' });
        }
    }
}

module.exports = new BookingController();
