const Payment = require('../../Models/Payment');
const RefundRequest = require('../../Models/RefundRequest');
const PayOSService = require('../../Services/PayOSService');
const { sql } = require('../../config/database');

class PaymentController {

    async createPayment(req, res) {
        try {
            const { paymentId, amount, description } = req.body;
            // paymentId comes from client/DB creation

            const orderData = {
                orderCode: paymentId,
                amount: amount,
                description: description || 'Gym Membership',
            };

            const paymentLink = await PayOSService.createPaymentLink(orderData);
            res.json(paymentLink);
        } catch (error) {
            console.error(error);
            res.status(500).json({ status: false, message: 'Error creating payment link' });
        }
    }

    async confirmPayment(req, res) {
        try {
            const { paymentId } = req.body;
            // Use Transaction for atomic updates
            const pool = await sql.connect();
            const transaction = new sql.Transaction(pool);
            await transaction.begin();

            try {
                // Update Payment
                const updateRes = await transaction.request()
                    .input('id', sql.BigInt, paymentId)
                    .query("UPDATE payments SET status = 'success', method = 'PayOS' WHERE payment_id = @id AND status = 'pending'");

                if (updateRes.rowsAffected[0] === 0) {
                    await transaction.commit();
                    return res.json({ status: true, message: 'Payment already confirmed or invalid' }); // Or false? logic depends
                }

                // Activate Membership
                const payResult = await transaction.request().input('id', sql.BigInt, paymentId).query("SELECT membership_id, amount FROM payments WHERE payment_id = @id");

                if (payResult.recordset.length > 0) {
                    const { membership_id, amount } = payResult.recordset[0];
                    await transaction.request().input('memId', sql.BigInt, membership_id).query("UPDATE memberships SET status = 'active' WHERE membership_id = @memId");

                    // Create Invoice
                    const invoiceNumber = `INV-${Date.now()}`;
                    await transaction.request()
                        .input('payId', sql.BigInt, paymentId)
                        .input('invNum', sql.NVarChar, invoiceNumber)
                        .input('amount', sql.Decimal, amount)
                        .query("INSERT INTO invoices (payment_id, invoice_number, issued_at, total_amount) VALUES (@payId, @invNum, GETDATE(), @amount)");
                }

                await transaction.commit();
                res.json({ status: true, message: 'Payment confirmed successfully' });

            } catch (err) {
                await transaction.rollback();
                throw err;
            }

        } catch (error) {
            console.error(error);
            res.status(500).json({ status: false, message: 'Server Error' });
        }
    }

    async requestRefund(req, res) {
        try {
            const { paymentId, reason } = req.body;
            const userId = req.user.id;

            const payment = await Payment.findById(paymentId);
            if (!payment || payment.member_id != userId || payment.status !== 'success') {
                return res.status(400).json({ status: false, message: 'Invalid payment for refund' });
            }

            const existing = await RefundRequest.findByPayment(paymentId);
            if (existing.length > 0) {
                return res.status(400).json({ status: false, message: 'Refund already requested' });
            }

            await RefundRequest.create({ payment_id: paymentId, member_id: userId, reason });
            res.json({ status: true, message: 'Refund request submitted' });

        } catch (error) {
            console.error(error);
            res.status(500).json({ status: false, message: 'Server Error' });
        }
    }

    async getRefunds(req, res) {
        try {
            const refunds = await RefundRequest.getAllDetailed();
            res.json({ status: true, data: refunds });
        } catch (error) {
            console.error(error);
            res.status(500).json({ status: false, message: 'Server Error' });
        }
    }

    // async processRefund(req, res) ... implement if needed.
}

module.exports = new PaymentController();
