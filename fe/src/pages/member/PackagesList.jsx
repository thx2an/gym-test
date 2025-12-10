import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useNavigate } from 'react-router-dom';

const PackagesList = () => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    console.log('PackagesList: Component Rendering');

    useEffect(() => {
        console.log('PackagesList: Fetching packages...');
        const fetchPackages = async () => {
            try {
                const res = await axiosClient.get('/packages');
                // Filter only active packages if needed, but backend sends all.
                // Ideally, backend should have a separate public endpoint or filter logic.
                setPackages(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPackages();
    }, []);

    const handleBuy = (pkg) => {
        navigate('/payment/checkout', { state: { pkg } });
    };

    if (loading) return <div className="p-10 text-center">Loading packages...</div>;

    return (
        <div className="container mx-auto p-6">
            <h1 className="mb-8 text-3xl font-bold text-gray-800 text-center">Choose Your Plan</h1>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {packages.map((pkg) => (
                    <div key={pkg.package_id} className="transform rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl">
                        <h3 className="mb-2 text-xl font-bold text-blue-600">{pkg.name}</h3>
                        <div className="mb-4 text-3xl font-bold text-gray-800">
                            {parseInt(pkg.price).toLocaleString()} <span className="text-base font-normal text-gray-500">VND</span>
                        </div>
                        <p className="mb-4 text-gray-600">{pkg.description}</p>
                        <div className="mb-6 rounded-lg bg-gray-50 p-4">
                            <p className="font-semibold text-gray-700">Benefits:</p>
                            <p className="text-sm text-gray-600">{pkg.benefits}</p>
                            <p className="mt-2 text-sm text-gray-500">Duration: {pkg.duration_days} days</p>
                        </div>
                        <button
                            onClick={() => handleBuy(pkg)}
                            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
                        >
                            Select Plan
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PackagesList;
