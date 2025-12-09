const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { getMyInvoices, downloadInvoice } = require('../controllers/invoiceController');

router.use(verifyToken);

router.get('/my-invoices', getMyInvoices);
router.get('/download/:id', downloadInvoice);

module.exports = router;
