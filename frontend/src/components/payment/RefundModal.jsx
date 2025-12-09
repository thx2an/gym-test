import { useState } from 'react';

const RefundModal = ({ isOpen, onClose, onSubmit, paymentId }) => {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(paymentId, reason);
            setReason('');
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                <h3 className="mb-4 text-lg font-bold text-gray-900">Request Refund</h3>
                <p className="mb-4 text-sm text-gray-600">
                    Payment ID: #{paymentId}<br />
                    Please explain why you want a refund.
                </p>
                <form onSubmit={handleSubmit}>
                    <textarea
                        className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                        rows="4"
                        placeholder="Reason for refund..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                    ></textarea>

                    <div className="mt-4 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded px-4 py-2 text-gray-600 hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                        >
                            {loading ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RefundModal;
