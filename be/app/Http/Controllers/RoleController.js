const Role = require('../../Models/Role');

class RoleController {
    async getData(req, res) {
        try {
            const data = await Role.all();
            res.json({ status: true, data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ status: false, message: 'Server Error' });
        }
    }

    async addData(req, res) {
        try {
            const { code, name } = req.body;
            // TODO: Add Authorization Logic (middleware preferred)

            await Role.create({ code, name });
            res.json({ status: true, message: 'Thêm chức vụ thành công' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ status: false, message: 'Server Error' });
        }
    }

    async update(req, res) {
        try {
            const { id, code, name } = req.body;
            await Role.update(id, { code, name });
            res.json({ status: true, message: 'Cập nhật chức vụ thành công' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ status: false, message: 'Server Error' });
        }
    }

    async destroy(req, res) {
        try {
            const { id } = req.body; // or req.params
            await Role.delete(id);
            res.json({ status: true, message: 'Xóa chức vụ thành công' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ status: false, message: 'Server Error' });
        }
    }
}

module.exports = new RoleController();
