const Package = require('../../Models/Package');

class PackageController {
    async getData(req, res) {
        try {
            const data = await Package.all();
            res.json({ status: true, data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ status: false, message: 'Server Error' });
        }
    }

    async create(req, res) {
        try {
            // HiTravel-1 uses request body directly.
            // gym-nexus uses specific fields.
            await Package.create(req.body);
            res.json({ status: true, message: 'Thêm gói tập thành công' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ status: false, message: 'Server Error' });
        }
    }

    async update(req, res) {
        try {
            const id = req.params.id || req.body.id;
            await Package.update(id, req.body);
            res.json({ status: true, message: 'Cập nhật gói tập thành công' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ status: false, message: 'Server Error' });
        }
    }

    async destroy(req, res) {
        try {
            const id = req.params.id || req.body.id;
            await Package.delete(id);
            res.json({ status: true, message: 'Xóa gói tập thành công' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ status: false, message: 'Server Error' });
        }
    }
}

module.exports = new PackageController();
