import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

const BookingCalendar = () => {
    const { trainerId } = useParams();
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [booking, setBooking] = useState(false);

    useEffect(() => {
        if (selectedDate) {
            fetchSlots();
        }
    }, [selectedDate, trainerId]);

    const fetchSlots = async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get(`/booking/slots?trainerId=${trainerId}&date=${selectedDate}`);
            setSlots(res.data);
        } catch (error) {
            console.error(error);
            setSlots([]);
        } finally {
            setLoading(false);
        }
    };

    const handleBook = async (slotTime) => { // slotTime is HH:MM
        if (!confirm(`Book session at ${slotTime}?`)) return;
        setBooking(true);
        try {
            // Construct full datetime
            const fullDateTime = `${selectedDate}T${slotTime}:00`; // simple construction

            await axiosClient.post('/booking/book', {
                trainerId: trainerId,
                startTime: fullDateTime,
                notes: 'Booked via Web'
            });
            alert('Booking Successful!');
            fetchSlots(); // Refresh
            navigate('/my-membership'); // Redirect or stay?
        } catch (error) {
            alert(error.response?.data?.message || 'Booking failed');
        } finally {
            setBooking(false);
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <button onClick={() => navigate('/trainers')} className="mb-4 text-gray-500 hover:text-gray-700">
                ← Back to Trainers
            </button>
            <h1 className="mb-6 text-2xl font-bold">Book a Session</h1>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                <input
                    type="date"
                    value={selectedDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full rounded border border-gray-300 p-2"
                />
            </div>

            <div className="bg-white p-6 rounded shadow border">
                <h3 className="text-lg font-semibold mb-4">Available Slots</h3>
                {loading ? (
                    <div>Loading slots...</div>
                ) : (
                    <div className="grid grid-cols-3 gap-4">
                        {slots.length > 0 ? (
                            slots.map((slot) => (
                                <button
                                    key={slot.time}
                                    onClick={() => handleBook(slot.time)}
                                    disabled={booking}
                                    className="rounded bg-red-50 border border-red-200 py-2 text-red-600 hover:bg-red-100 disabled:opacity-50"
                                >
                                    {slot.time}
                                </button>
                            ))
                        ) : (
                            <div className="col-span-3 text-center text-gray-500">No slots available for this date.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingCalendar;
