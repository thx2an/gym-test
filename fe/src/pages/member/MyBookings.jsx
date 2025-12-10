import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import QRCode from 'react-qr-code';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { socketService } from '../../services/socket';
import { QrCode, MessageSquare, CheckCircle, XCircle } from 'lucide-react';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    // QR Modal State
    const [selectedQr, setSelectedQr] = useState(null);
    const [isQrOpen, setIsQrOpen] = useState(false);

    // Review Modal State
    const [reviewSession, setReviewSession] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [isReviewOpen, setIsReviewOpen] = useState(false);

    const fetchBookings = async () => {
        try {
            const res = await axiosClient.get('/booking/my-bookings');
            // Ensure response has status:true, and data array. Old code assumed res.data is array?
            // Let's assume new backend structure { status: true, data: [] }
            setBookings(res.data.data || res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();

        // Socket Integration
        // Assuming we store user in localStorage to get ID
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.id) {
            socketService.connect(user.id);
            socketService.on('booking_confirmed', (data) => {
                // Refresh list or show toast
                alert(`Booking Confirmed! ${data.message}`);
                fetchBookings();
            });
            socketService.on('session_completed', () => {
                fetchBookings();
            });
        }

        return () => {
            socketService.disconnect();
        };
    }, []);

    const handleShowQR = async (sessionId) => {
        try {
            // Updated Endpoint: /session/qr/:sessionId
            const res = await axiosClient.get(`/session/qr/${sessionId}`);
            setSelectedQr(res.data.token);
            setIsQrOpen(true);
        } catch (error) {
            alert('Failed to generate QR Code');
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        try {
            await axiosClient.post('/reviews/add', {
                trainerId: reviewSession.trainer_id,
                rating,
                comment
            });
            alert('Review Submitted!');
            setIsReviewOpen(false);
        } catch (error) {
            alert(error.response?.data?.message || 'Error submitting review');
        }
    };

    if (loading) return <div className="p-8">Loading sessions...</div>;

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Sessions</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {bookings.map((s) => (
                    <Card key={s.session_id} className="border-l-4 border-l-primary-600">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-base font-medium">
                                {new Date(s.start_time).toLocaleDateString()}
                            </CardTitle>
                            <div className={`text-xs px-2 py-1 rounded-full font-bold
                                ${s.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                    s.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                {s.status.toUpperCase()}
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="text-2xl font-bold mb-1">{new Date(s.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            <p className="text-sm text-slate-500 mb-4">Trainer: {s.trainer_name}</p>

                            <div className="flex gap-2">
                                {s.status === 'confirmed' && (
                                    <Button onClick={() => handleShowQR(s.session_id)} className="w-full">
                                        <QrCode className="w-4 h-4 mr-2" /> Check-in
                                    </Button>
                                )}
                                {s.status === 'completed' && (
                                    <Button variant="outline" onClick={() => { setReviewSession(s); setIsReviewOpen(true); }} className="w-full">
                                        <MessageSquare className="w-4 h-4 mr-2" /> Review
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {bookings.length === 0 && <p className="text-slate-500">No sessions found.</p>}

            {/* QR Modal */}
            {isQrOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <Card className="w-full max-w-sm">
                        <CardHeader>
                            <CardTitle className="text-center">Scan to Check-in</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center">
                            <div className="bg-white p-4 rounded-lg border shadow-inner mb-6">
                                {selectedQr && <QRCode value={selectedQr} />}
                            </div>
                            <Button onClick={() => setIsQrOpen(false)} variant="secondary" className="w-full">Close</Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Review Modal */}
            {isReviewOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>Review Session</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmitReview} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Rating (1-5)</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                                        value={rating}
                                        onChange={(e) => setRating(Number(e.target.value))}
                                    >
                                        <option value="5">5 - Excellent</option>
                                        <option value="4">4 - Good</option>
                                        <option value="3">3 - Average</option>
                                        <option value="2">2 - Poor</option>
                                        <option value="1">1 - Terrible</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Comment</Label>
                                    <textarea
                                        className="flex min-h-[80px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="How was your session?"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <Button type="button" variant="ghost" onClick={() => setIsReviewOpen(false)}>Cancel</Button>
                                    <Button type="submit">Submit Review</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default MyBookings;
