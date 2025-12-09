const { sql } = require('../config/db');
const { generateInvoicePDF } = require('../utils/pdfGenerator');
const path = require('path');
const fs = require('fs');

const getMyInvoices = async (req, res) => {
    try {
        const pool = await sql.connect();
        const result = await pool.request()
            .input('userId', sql.BigInt, req.user.id)
            .query(`
                SELECT i.invoice_id, i.invoice_number, i.issued_at, i.total_amount, 
                       p.payment_id, pkg.name as package_name
                FROM invoices i
                JOIN payments p ON i.payment_id = p.payment_id
                JOIN memberships m ON p.member_id = m.user_id AND p.membership_id = m.membership_id
                JOIN membership_packages pkg ON m.package_id = pkg.package_id
                WHERE p.member_id = @userId
                ORDER BY i.issued_at DESC
            `);

        console.log(`[DEBUG] GetInvoices User: ${req.user.user_id}, Found: ${result.recordset.length} invoices`);

        // If query returns multiple rows due to joins (unlikely with this schema but possible), distinct might be needed.
        // For now, assuming 1 payment -> 1 invoice.

        res.json(result.recordset);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const downloadInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await sql.connect();

        // 1. Get Invoice Details
        const result = await pool.request()
            .input('invoiceId', sql.BigInt, id)
            .input('userId', sql.BigInt, req.user.id)
            .query(`
                SELECT i.*, u.full_name as customer_name, pkg.name as package_name, p.payment_id
                FROM invoices i
                JOIN payments p ON i.payment_id = p.payment_id
                JOIN users u ON p.member_id = u.user_id
                JOIN memberships m ON p.membership_id = m.membership_id
                JOIN membership_packages pkg ON m.package_id = pkg.package_id
                WHERE i.invoice_id = @invoiceId AND u.user_id = @userId
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        const invoice = result.recordset[0];

        // 2. Define File Path
        const fileName = `invoice_${invoice.invoice_number}.pdf`;
        const invoicesDir = path.join(__dirname, '../../invoices');
        if (!fs.existsSync(invoicesDir)) {
            fs.mkdirSync(invoicesDir, { recursive: true });
        }
        const filePath = path.join(invoicesDir, fileName);

        // 3. Generate PDF if it doesn't exist
        // For simplicity in this mock, simply regenerate to ensure updated content
        const invoiceData = {
            invoice_number: invoice.invoice_number,
            issued_at: invoice.issued_at,
            customer_name: invoice.customer_name,
            description: `Payment for package: ${invoice.package_name}`,
            amount: invoice.total_amount
        };

        await generateInvoicePDF(invoiceData, filePath);

        // 4. Download
        res.download(filePath, fileName);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error generating invoice' });
    }
};

module.exports = { getMyInvoices, downloadInvoice };
