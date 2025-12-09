import { useLocation, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useState } from 'react';

const CheckoutPage = () => {
    const { state } = useLocation();
    const pkg = state?.pkg;
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    if (!pkg) {
        return <div className="p-10 text-center text-red-500">No package selected. Please go back.</div>;
    }

    const handlePayment = async () => {
        setLoading(true);
        try {
            // 1. Create Order (Membership + Payment Pending)
            const orderRes = await axiosClient.post('/membership/purchase', { packageId: pkg.package_id });
            const { paymentId, amount, description } = orderRes.data;

            // 2. Get Payment Link (Mock PayOS)
            const payRes = await axiosClient.post('/payment/create-link', {
                paymentId,
                amount,
                description
            });

            // 3. Redirect to Fake Payment Gateway
            window.location.href = payRes.data.checkoutUrl;

        } catch (err) {
            console.error(err);
            alert('Failed to initiate payment');
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
            <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-xl">
                <h2 className="mb-6 text-2xl font-bold text-gray-800">Checkout</h2>

                <div className="mb-6 space-y-4">
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">Product</span>
                        <span className="font-semibold">{pkg.name}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">Duration</span>
                        <span className="font-semibold">{pkg.duration_days} days</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">Total Amount</span>
                        <span className="text-xl font-bold text-blue-600">{parseInt(pkg.price).toLocaleString()} VND</span>
                    </div>
                </div>

                <div className="mb-6 rounded bg-yellow-50 p-4 text-sm text-yellow-800 border-l-4 border-yellow-400">
                    <p>Note: This is a <strong>MOCK PAYMENT</strong> environment. No real money will be charged.</p>
                </div>

                <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full rounded-lg bg-green-600 py-3 font-bold text-white transition hover:bg-green-700 disabled:bg-gray-400"
                >
                    {loading ? 'Processing...' : 'Proceed to Payment (Mock)'}
                </button>

                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 w-full text-center text-sm text-gray-500 hover:underline"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default CheckoutPage;
