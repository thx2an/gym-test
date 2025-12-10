const PDFDocument = require('pdfkit');
const fs = require('fs');

const generateInvoicePDF = (invoiceData, filePath) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        // Header
        doc.fontSize(25).text('GymNexus Invoice', { align: 'center' });
        doc.moveDown();

        // Invoice Details
        doc.fontSize(12).text(`Invoice Number: ${invoiceData.invoice_number}`);
        doc.text(`Date: ${new Date(invoiceData.issued_at).toLocaleDateString()}`);
        doc.text(`Customer: ${invoiceData.customer_name}`);
        doc.moveDown();

        // Items
        doc.text('Description', 100, 250);
        doc.text('Amount', 400, 250);
        doc.moveTo(100, 265).lineTo(500, 265).stroke();

        doc.text(invoiceData.description, 100, 280);
        doc.text(`${invoiceData.amount.toLocaleString()} VND`, 400, 280);

        // Footer
        doc.fontSize(10).text('Thank you for choosing GymNexus!', 100, 700, { align: 'center', width: 400 });

        doc.end();

        stream.on('finish', () => resolve(filePath));
        stream.on('error', (err) => reject(err));
    });
};

module.exports = { generateInvoicePDF };
