import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import QRCode from 'react-qr-code';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedQr, setSelectedQr] = useState(null); // Token string
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await axiosClient.get('/booking/my-bookings');
                setBookings(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const handleShowQR = async (sessionId) => {
        try {
            const res = await axiosClient.get(`/sessions/${sessionId}/qr`);
            setSelectedQr(res.data.token);
            setIsModalOpen(true);
        } catch (error) {
            alert('Failed to generate QR Code');
        }
    };

    if (loading) return <div>Loading bookings...</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="mb-6 text-2xl font-bold">My Sessions</h1>
            <div className="overflow-hidden rounded-lg bg-white shadow border">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Trainer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date/Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Check-in</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {bookings.map((s) => (
                            <tr key={s.session_id}>
                                <td className="px-6 py-4 whitespace-nowrap">{s.trainer_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(s.start_time).toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${s.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {s.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {s.status === 'confirmed' && (
                                        <button
                                            onClick={() => handleShowQR(s.session_id)}
                                            className="text-blue-600 hover:text-blue-900 font-medium"
                                        >
                                            Show QR
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {bookings.length === 0 && <div className="p-4 text-center text-gray-500">No bookings found.</div>}
            </div>

            {/* QR Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl text-center">
                        <h2 className="mb-4 text-xl font-bold text-gray-900">Scan to Check-in</h2>
                        <div className="flex justify-center mb-4 p-4 border rounded bg-white">
                            {selectedQr && <QRCode value={selectedQr} />}
                        </div>
                        <p className="text-sm text-gray-500 mb-6">Show this code to your trainer.</p>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="w-full rounded bg-gray-200 px-4 py-2 font-bold text-gray-700 hover:bg-gray-300"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyBookings;
