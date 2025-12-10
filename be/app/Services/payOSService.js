const crypto = require('crypto');

// Mock PayOS Service for Development
const createPaymentLink = async (orderData) => {
    // In a real app, you would call PayOS API here.
    // For now, we simulate a successful link creation.

    // Generate a fake checkout URL (Directly to Success Page for Mock)
    // In real PayOS, this would be the PayOS Gateway URL.
    const checkoutUrl = `http://localhost:5173/payment/success?orderCode=${orderData.orderCode}`;

    return {
        checkoutUrl,
        orderCode: orderData.orderCode,
        amount: orderData.amount,
        description: orderData.description,
        status: 'PENDING'
    };
};

const verifyPaymentWebhook = (webhookData) => {
    // Simulate signature verification
    return true;
};

module.exports = { createPaymentLink, verifyPaymentWebhook };
