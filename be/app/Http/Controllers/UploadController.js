const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../../public/uploads');
        // Ensure directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

class UploadController {

    // Middleware getter
    get uploader() {
        return upload.single('image'); // Expects form-data field 'image'
    }

    uploadImage(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ status: false, message: 'No file uploaded' });
            }

            // Construct URL (assuming static serve setup)
            // Need to set up static serve in server.js
            const imageUrl = `/uploads/${req.file.filename}`;

            res.json({ status: true, message: 'Upload successful', url: imageUrl });
        } catch (error) {
            console.error(error);
            res.status(500).json({ status: false, message: 'Server Error' });
        }
    }
}

module.exports = new UploadController();
