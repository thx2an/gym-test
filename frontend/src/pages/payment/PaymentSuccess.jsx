import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const orderCode = searchParams.get('orderCode');
    const navigate = useNavigate();
    const [status, setStatus] = useState('processing');

    useEffect(() => {
        const confirmOrder = async () => {
            if (!orderCode) {
                setStatus('error');
                return;
            }

            try {
                // Call backend to confirm payment
                await axiosClient.post('/payment/confirm', { paymentId: orderCode });
                setStatus('success');
            } catch (err) {
                console.error(err);
                setStatus('error');
            }
        };

        if (status === 'processing') {
            confirmOrder();
        }
    }, [orderCode, status]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
            <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-xl">
                {status === 'processing' && (
                    <div className="text-xl font-semibold text-gray-600">Processing Payment...</div>
                )}

                {status === 'success' && (
                    <>
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                            <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <h2 className="mb-2 text-2xl font-bold text-gray-800">Payment Successful!</h2>
                        <p className="mb-6 text-gray-600">Your membership has been activated.</p>
                        <button
                            onClick={() => navigate('/my-membership')}
                            className="w-full rounded-lg bg-blue-600 py-3 font-bold text-white transition hover:bg-blue-700"
                        >
                            View My Membership
                        </button>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                            <svg className="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </div>
                        <h2 className="mb-2 text-2xl font-bold text-gray-800">Payment Failed</h2>
                        <p className="mb-6 text-gray-600">Something went wrong. Please try again or contact support.</p>
                        <button
                            onClick={() => navigate('/packages')}
                            className="w-full rounded-lg bg-gray-600 py-3 font-bold text-white transition hover:bg-gray-700"
                        >
                            Back to Packages
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentSuccess;
