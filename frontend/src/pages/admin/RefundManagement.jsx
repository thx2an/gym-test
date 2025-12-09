import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

const RefundManagement = () => {
    const [refunds, setRefunds] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRefunds = async () => {
        try {
            const res = await axiosClient.get('/payment/refund/all');
            setRefunds(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRefunds();
    }, []);

    const handleProcess = async (refundId, status) => {
        if (!confirm(`Are you sure you want to ${status} this request?`)) return;
        try {
            await axiosClient.put('/payment/refund/process', { refundId, status });
            alert(`Refund ${status} successfully`);
            fetchRefunds(); // Refresh list
        } catch (error) {
            console.error(error);
            alert('Action failed');
        }
    };

    if (loading) return <div>Loading refunds...</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="mb-6 text-2xl font-bold">Refund Requests</h1>
            <div className="overflow-hidden rounded-lg bg-white shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Member</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Package</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Reason</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {refunds.map((req) => (
                            <tr key={req.refund_id}>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">{req.full_name}</div>
                                    <div className="text-sm text-gray-500">{req.email}</div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                    {req.package_name || 'N/A'}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                    {req.amount ? parseInt(req.amount).toLocaleString() : 0} VND
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">{req.reason}</td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 
                                        ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            req.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                'bg-red-100 text-red-800'}`}>
                                        {req.status.toUpperCase()}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                    {req.status === 'pending' && (
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleProcess(req.refund_id, 'approved')}
                                                className="text-green-600 hover:text-green-900"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleProcess(req.refund_id, 'rejected')}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {refunds.length === 0 && <div className="p-4 text-center text-gray-500">No refund requests found.</div>}
            </div>
        </div>
    );
};

export default RefundManagement;
