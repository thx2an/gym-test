const User = require('../../Models/User');
const { sql } = require('../../../config/database');

class UserController {

    // Mimics NguoiDungController.thongTinNguoiDung
    async getProfile(req, res) {
        try {
            // req.user is set by middleware
            if (!req.user) {
                return res.status(401).json({ status: 0, message: 'Token invalid' });
            }

            const user = await User.findById(req.user.id);
            if (user) {
                return res.json({ status: 1, data: user });
            }
            return res.status(404).json({ status: 0, message: 'User not found' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ status: 0, message: 'Server Error' });
        }
    }

    // Mimics NguoiDungController.suaNguoiDung
    async updateProfile(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ status: 0, message: 'Token invalid' });
            }

            const userId = req.user.id;
            const { full_name, phone, gender, date_of_birth } = req.body;

            const pool = await sql.connect();
            await pool.request()
                .input('id', sql.BigInt, userId)
                .input('name', sql.NVarChar, full_name)
                .input('phone', sql.NVarChar, phone)
                .input('gender', sql.NVarChar, gender)
                .input('dob', sql.Date, date_of_birth)
                .query(`
                    UPDATE users 
                    SET full_name = @name, phone = @phone, gender = @gender, date_of_birth = @dob 
                    WHERE user_id = @id
                `);

            // Fetch updated
            const updatedUser = await User.findById(userId);

            res.json({
                status: true,
                message: 'Cập nhật thông tin thành công',
                data: updatedUser
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ status: 0, message: 'Server Error' });
        }
    }
}

module.exports = new UserController();
