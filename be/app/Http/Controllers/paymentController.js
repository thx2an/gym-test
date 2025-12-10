const { sql } = require('../config/db');
const { createPaymentLink } = require('../services/payOSService');

const createPayment = async (req, res) => {
    try {
        const { paymentId, amount, description } = req.body;
        // In real PayOS, orderCode must be unique and numeric (usually). 
        // We can use paymentId as orderCode for simplicity.

        const orderData = {
            orderCode: paymentId,
            amount: amount,
            description: description || 'Gym Membership',
            cancelUrl: 'http://localhost:5173/payment/cancel',
            returnUrl: 'http://localhost:5173/payment/success'
        };

        const paymentLink = await createPaymentLink(orderData);
        res.json(paymentLink);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating payment link' });
    }
};

// Mock Confim Payment (Since we are using Mock Service)
const confirmPayment = async (req, res) => {
    try {
        const { paymentId } = req.body;

        const pool = await sql.connect();
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // Atomic Update: Only update if status is pending
            const updateRes = await transaction.request()
                .input('id', sql.BigInt, paymentId)
                .query("UPDATE payments SET status = 'success', method = 'PayOS' WHERE payment_id = @id AND status = 'pending'");

            if (updateRes.rowsAffected[0] === 0) {
                await transaction.commit();
                return res.json({ message: 'Payment already confirmed' });
            }

            // Update Membership Status
            // Get membership_id from payment
            const payResult = await transaction.request()
                .input('id', sql.BigInt, paymentId)
                .query("SELECT membership_id, amount FROM payments WHERE payment_id = @id");

            if (payResult.recordset.length > 0) {
                const { membership_id, amount } = payResult.recordset[0];
                await transaction.request()
                    .input('memId', sql.BigInt, membership_id)
                    .query("UPDATE memberships SET status = 'active' WHERE membership_id = @memId");

                // Create Invoice
                const invoiceNumber = `INV-${Date.now()}`;
                await transaction.request()
                    .input('payId', sql.BigInt, paymentId)
                    .input('invNum', sql.NVarChar, invoiceNumber)
                    .input('amount', sql.Decimal, amount)
                    .query(`
                        INSERT INTO invoices (payment_id, invoice_number, issued_at, total_amount)
                        VALUES (@payId, @invNum, GETDATE(), @amount)
                    `);
            }

            await transaction.commit();
            res.json({ message: 'Payment confirmed successfully' });

        } catch (err) {
            await transaction.rollback();
            throw err;
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const requestRefund = async (req, res) => {
    try {
        const { paymentId, reason } = req.body;
        const userId = req.user.id;

        const pool = await sql.connect();

        // Check if payment exists and belongs to user and is successful
        const payRes = await pool.request()
            .input('pid', sql.BigInt, paymentId)
            .input('uid', sql.BigInt, userId)
            .query("SELECT * FROM payments WHERE payment_id = @pid AND member_id = @uid AND status = 'success'");

        if (payRes.recordset.length === 0) {
            return res.status(400).json({ message: 'Invalid payment for refund' });
        }

        // Check if already requested
        const reqRes = await pool.request()
            .input('pid', sql.BigInt, paymentId)
            .query("SELECT * FROM refund_requests WHERE payment_id = @pid");

        if (reqRes.recordset.length > 0) {
            return res.status(400).json({ message: 'Refund already requested' });
        }

        // Create Request
        await pool.request()
            .input('pid', sql.BigInt, paymentId)
            .input('uid', sql.BigInt, userId)
            .input('reason', sql.NVarChar, reason)
            .query(`
                INSERT INTO refund_requests (payment_id, member_id, reason, status)
                VALUES (@pid, @uid, @reason, 'pending')
            `);

        res.json({ message: 'Refund request submitted' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getRefunds = async (req, res) => {
    try {
        const pool = await sql.connect();
        const result = await pool.request().query(`
            SELECT r.*, u.email, u.full_name, p.amount, pkg.name as package_name
            FROM refund_requests r
            JOIN users u ON r.member_id = u.user_id
            JOIN payments p ON r.payment_id = p.payment_id
            LEFT JOIN memberships m ON p.membership_id = m.membership_id
            LEFT JOIN membership_packages pkg ON m.package_id = pkg.package_id
            ORDER BY r.requested_at DESC
        `);
        res.json(result.recordset);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const processRefund = async (req, res) => {
    try {
        const { refundId, status } = req.body; // status: 'approved' or 'rejected'
        const adminId = req.user.id; // Corrected to use id from token

        const pool = await sql.connect();
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // Get Refund details
            const refRes = await transaction.request()
                .input('rid', sql.BigInt, refundId)
                .query("SELECT * FROM refund_requests WHERE refund_id = @rid");

            if (refRes.recordset.length === 0) return res.status(404).json({ message: 'Request not found' });
            const refund = refRes.recordset[0];

            if (refund.status !== 'pending') return res.status(400).json({ message: 'Request already processed' });

            // Update Refund Request
            await transaction.request()
                .input('rid', sql.BigInt, refundId)
                .input('status', sql.NVarChar, status)
                .input('by', sql.BigInt, adminId)
                .query(`
                    UPDATE refund_requests 
                    SET status = @status, processed_by = @by, processed_at = GETDATE()
                    WHERE refund_id = @rid
                `);

            if (status === 'approved') {
                // Update Payment Status
                await transaction.request()
                    .input('pid', sql.BigInt, refund.payment_id)
                    .query("UPDATE payments SET status = 'refunded' WHERE payment_id = @pid");

                // Cancel Membership if applicable
                // (Assumes 1 active membership per payment, logic might need adjustment if complex)
                const payRes = await transaction.request()
                    .input('pid', sql.BigInt, refund.payment_id)
                    .query("SELECT membership_id FROM payments WHERE payment_id = @pid");

                if (payRes.recordset.length > 0 && payRes.recordset[0].membership_id) {
                    await transaction.request()
                        .input('mid', sql.BigInt, payRes.recordset[0].membership_id)
                        .query("UPDATE memberships SET status = 'cancelled' WHERE membership_id = @mid");
                }
            }

            await transaction.commit();
            res.json({ message: `Refund request ${status}` });

        } catch (err) {
            await transaction.rollback();
            throw err;
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { createPayment, confirmPayment, requestRefund, getRefunds, processRefund };
