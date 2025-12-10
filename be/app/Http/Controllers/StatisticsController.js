const { sql } = require('../../../config/database');

class StatisticsController {

    async getDashboardStats(req, res) {
        try {
            const pool = await sql.connect();

            // 1. Total Members
            const memberQ = await pool.request().query("SELECT COUNT(*) as count FROM users WHERE role = 'MEMBER'");
            const totalMembers = memberQ.recordset[0].count;

            // 2. Total Trainers
            const trainerQ = await pool.request().query("SELECT COUNT(*) as count FROM users WHERE role = 'TRAINER'");
            const totalTrainers = trainerQ.recordset[0].count;

            // 3. Monthly Revenue (Current Month)
            // Assumes 'payments' table has 'amount' and 'payment_date' or 'created_at'
            // Using 'created_at' in payments for now
            const revenueQ = await pool.request().query(`
                SELECT SUM(amount) as total 
                FROM payments 
                WHERE status = 'success' 
                AND MONTH(created_at) = MONTH(GETDATE()) 
                AND YEAR(created_at) = YEAR(GETDATE())
            `);
            const monthlyRevenue = revenueQ.recordset[0].total || 0;

            // 4. Top 5 Trainers by Session Count
            const topTrainersQ = await pool.request().query(`
                SELECT TOP 5 u.full_name, COUNT(s.session_id) as session_count
                FROM training_sessions s
                JOIN trainer_profiles tp ON s.trainer_id = tp.trainer_id
                JOIN users u ON tp.user_id = u.user_id
                WHERE s.status = 'completed'
                GROUP BY u.full_name
                ORDER BY session_count DESC
            `);
            const topTrainers = topTrainersQ.recordset;

            res.json({
                status: true,
                data: {
                    totalMembers,
                    totalTrainers,
                    monthlyRevenue,
                    topTrainers
                }
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ status: false, message: 'Server Error' });
        }
    }
}

module.exports = new StatisticsController();
