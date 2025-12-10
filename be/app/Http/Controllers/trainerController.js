const TrainerProfile = require('../../Models/TrainerProfile');
const TrainerAvailability = require('../../Models/TrainerAvailability');

class TrainerController {
    async updateProfile(req, res) {
        try {
            const { specialization, bio, experienceYears } = req.body;
            const userId = req.user.id;

            const existing = await TrainerProfile.findByUserId(userId);

            if (existing) {
                await TrainerProfile.update(userId, { specialization, bio, experience_years: experienceYears });
                return res.json({ status: true, message: 'Trainer profile updated' });
            } else {
                await TrainerProfile.create({ user_id: userId, specialization, bio, experience_years: experienceYears });
                return res.json({ status: true, message: 'Trainer profile created' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ status: false, message: 'Server Error' });
        }
    }

    async getTrainers(req, res) {
        try {
            const trainers = await TrainerProfile.getAllWithUser();
            res.json({ status: true, data: trainers });
        } catch (error) {
            console.error(error);
            res.status(500).json({ status: false, message: 'Server Error' });
        }
    }

    async setAvailability(req, res) {
        try {
            const { date, startTime, endTime, isRecurring, dayOfWeek } = req.body;
            const userId = req.user.id;

            const profile = await TrainerProfile.findByUserId(userId);
            if (!profile) return res.status(404).json({ status: false, message: 'Trainer profile not found' });

            const branchRes = await TrainerAvailability.getTrainerBranch(userId);
            if (branchRes.recordset.length === 0) return res.status(400).json({ status: false, message: 'Trainer not assigned to a branch' });

            const branchId = branchRes.recordset[0].branch_id;

            await TrainerAvailability.create({
                trainer_id: profile.trainer_id,
                branch_id: branchId,
                date,
                start_time: startTime,
                end_time: endTime,
                is_recurring: isRecurring,
                day_of_week: dayOfWeek
            });

            res.json({ status: true, message: 'Availability added' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ status: false, message: 'Server Error' });
        }
    }

    async getSchedule(req, res) {
        try {
            const { trainerId } = req.params;
            const schedule = await TrainerAvailability.findByTrainer(trainerId);
            res.json({ status: true, data: schedule });
        } catch (error) {
            console.error(error);
            res.status(500).json({ status: false, message: 'Server Error' });
        }
    }
}

module.exports = new TrainerController();
