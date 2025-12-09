import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { useNavigate } from 'react-router-dom';
import TransactionHistoryTable from '../../components/payment/TransactionHistoryTable';

const MyMembership = () => {
    const [membership, setMembership] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMembership = async () => {
            try {
                const res = await axiosClient.get('/membership/my-membership');
                setMembership(res.data[0]); // Assumption: returns array, take first active
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchMembership();
    }, []);

    if (loading) return <div className="p-10">Loading...</div>;

    return (
        <div className="p-6">
            <div className="mb-8 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">My Membership</h1>
                <button
                    onClick={() => navigate('/packages')}
                    className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                    Browse Packages
                </button>
            </div>

            {!membership ? (
                <div className="rounded-lg bg-gray-100 p-8 text-center text-gray-600">
                    <p className="mb-4">You do not have an active membership.</p>
                    <button
                        onClick={() => navigate('/packages')}
                        className="font-bold text-blue-600 hover:underline"
                    >
                        Buy a Package Now
                    </button>
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl bg-white shadow-md">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
                        <h2 className="text-xl font-bold uppercase tracking-wide">{membership.package_name}</h2>
                        <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
                            {membership.status}
                        </span>
                    </div>
                    <div className="p-6">
                        <div className="flex gap-8">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-400">Start Date</label>
                                <p className="text-lg font-semibold text-gray-800">{new Date(membership.start_date).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-400">Expiry Date</label>
                                <p className="text-lg font-semibold text-gray-800">{new Date(membership.end_date).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="mt-6 border-t pt-4">
                            <label className="block text-xs font-bold uppercase text-gray-400">Benefits</label>
                            <p className="text-gray-600">{membership.benefits}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-10">
                <h3 className="mb-4 text-xl font-bold text-gray-800">Transaction History</h3>
                <TransactionHistoryTable />
            </div>
        </div>
    );
};

export default MyMembership;
