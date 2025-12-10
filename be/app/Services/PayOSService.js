class PayOSService {
    static async createPaymentLink(orderData) {
        // Mocking PayOS response
        return {
            status: true,
            data: {
                checkoutUrl: `http://localhost:5173/payment/checkout?code=${orderData.orderCode}`,
                qrCode: 'mock-qr-code-data',
                amount: orderData.amount
            }
        };
    }

    static async getPaymentLinkInformation(orderCode) {
        return {
            status: true,
            data: {
                status: 'PAID', // Always paid for mock
                amount: 100000
            }
        };
    }
}

module.exports = PayOSService;
