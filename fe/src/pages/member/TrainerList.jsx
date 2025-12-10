import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

const TrainerList = () => {
    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrainers = async () => {
            try {
                const res = await axiosClient.get('/trainers/all');
                setTrainers(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTrainers();
    }, []);

    if (loading) return <div>Loading trainers...</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="mb-6 text-3xl font-bold text-gray-800">Our Personal Trainers</h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {trainers.map((trainer) => (
                    <div key={trainer.trainer_id} className="overflow-hidden rounded-lg bg-white shadow transition hover:shadow-lg">
                        <div className="h-40 bg-gray-200 flex items-center justify-center">
                            {/* Placeholder for Avatar */}
                            <span className="text-4xl">🏋️</span>
                        </div>
                        <div className="p-4">
                            <h2 className="text-xl font-bold text-gray-800">{trainer.full_name}</h2>
                            <p className="text-sm text-red-500 font-medium">{trainer.specialization}</p>
                            <p className="mt-2 text-gray-600 text-sm line-clamp-3">{trainer.bio}</p>

                            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                                <span>Exp: {trainer.experience_years} years</span>
                                <span>{trainer.branch_name || 'All Branches'}</span>
                            </div>

                            <button
                                onClick={() => window.location.href = `/trainers/${trainer.trainer_id}/book`}
                                className="mt-4 w-full rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                            >
                                View Schedule
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {trainers.length === 0 && (
                <div className="text-center text-gray-500 mt-10">
                    No trainers found.
                </div>
            )}
        </div>
    );
};

export default TrainerList;
