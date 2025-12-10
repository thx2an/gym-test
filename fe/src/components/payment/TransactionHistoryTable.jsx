import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import RefundModal from './RefundModal';

const TransactionHistoryTable = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
    const [selectedPaymentId, setSelectedPaymentId] = useState(null);

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const res = await axiosClient.get('/invoices/my-invoices');
                setInvoices(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoices();
    }, []);

    const handleDownload = async (id, invoiceNumber) => {
        try {
            const response = await axiosClient.get(`/invoices/download/${id}`, {
                responseType: 'blob', // Important for file download
            });

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice_${invoiceNumber}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Download failed', err);
            alert('Failed to download invoice');
        }
    };

    const openRefundModal = (paymentId) => {
        setSelectedPaymentId(paymentId);
        setIsRefundModalOpen(true);
    };

    const handleRefundSubmit = async (paymentId, reason) => {
        try {
            await axiosClient.post('/payment/refund/request', { paymentId, reason });
            alert('Refund request submitted successfully');
            setIsRefundModalOpen(false);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to submit refund request');
        }
    };

    if (loading) return <div>Loading history...</div>;
    if (invoices.length === 0) return <div className="text-gray-500 italic mt-4">No payment history found.</div>;

    return (
        <div className="mt-8 overflow-hidden rounded-lg border border-gray-200 shadow">
            <table className="min-w-full divide-y divide-gray-200 bg-white">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Invoice #</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Package</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {invoices.map((inv) => (
                        <tr key={inv.invoice_id}>
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{inv.invoice_number}</td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                {new Date(inv.issued_at).toLocaleDateString()}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{inv.package_name}</td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                {parseInt(inv.total_amount).toLocaleString()} VND
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium space-x-3">
                                <button
                                    onClick={() => handleDownload(inv.invoice_id, inv.invoice_number)}
                                    className="text-blue-600 hover:text-blue-900"
                                >
                                    Download PDF
                                </button>
                                <button
                                    onClick={() => openRefundModal(inv.payment_id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    Refund
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <RefundModal
                isOpen={isRefundModalOpen}
                onClose={() => setIsRefundModalOpen(false)}
                paymentId={selectedPaymentId}
                onSubmit={handleRefundSubmit}
            />
        </div>
    );
};

export default TransactionHistoryTable;
