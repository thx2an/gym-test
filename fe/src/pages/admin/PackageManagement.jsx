import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import Sidebar from '../../components/common/Sidebar';

const PackageManagement = () => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newPkg, setNewPkg] = useState({ code: '', name: '', description: '', duration_days: 30, price: 0, benefits: '' });

    const fetchPackages = async () => {
        try {
            const response = await axiosClient.get('/admin/packages');
            setPackages(response.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPackages();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axiosClient.post('/admin/packages', newPkg);
            setShowModal(false);
            setNewPkg({ code: '', name: '', description: '', duration_days: 30, price: 0, benefits: '' });
            fetchPackages();
        } catch (err) {
            alert('Failed to create package');
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 overflow-auto p-10">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-800">Package Management</h1>
                    <button onClick={() => setShowModal(true)} className="rounded bg-red-600 px-4 py-2 text-white">+ Add Package</button>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {packages.map((pkg) => (
                        <div key={pkg.package_id} className="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-gray-800">{pkg.name}</h3>
                                <span className="text-xs bg-gray-200 px-2 py-1 rounded">{pkg.code}</span>
                            </div>
                            <p className="text-2xl font-bold text-red-600 mb-4">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pkg.price)}
                                <span className="text-sm text-gray-400 font-normal"> / {pkg.duration_days} days</span>
                            </p>
                            <p className="text-gray-600 mb-4 text-sm h-12 overflow-hidden">{pkg.description}</p>
                            <div className="text-sm text-gray-500">
                                <strong>Benefits:</strong> {pkg.benefits}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="w-96 rounded bg-white p-6 shadow-lg">
                            <h2 className="mb-4 text-xl font-bold">Add Package</h2>
                            <form onSubmit={handleCreate}>
                                <div className="mb-2"><label className="block text-sm">Code</label><input className="w-full rounded border p-2" value={newPkg.code} onChange={e => setNewPkg({ ...newPkg, code: e.target.value })} required /></div>
                                <div className="mb-2"><label className="block text-sm">Name</label><input className="w-full rounded border p-2" value={newPkg.name} onChange={e => setNewPkg({ ...newPkg, name: e.target.value })} required /></div>
                                <div className="mb-2"><label className="block text-sm">Description</label><input className="w-full rounded border p-2" value={newPkg.description} onChange={e => setNewPkg({ ...newPkg, description: e.target.value })} /></div>
                                <div className="mb-2 flex gap-2">
                                    <div className="flex-1"><label className="block text-sm">Days</label><input type="number" className="w-full rounded border p-2" value={newPkg.duration_days} onChange={e => setNewPkg({ ...newPkg, duration_days: e.target.value })} required /></div>
                                    <div className="flex-1"><label className="block text-sm">Price</label><input type="number" className="w-full rounded border p-2" value={newPkg.price} onChange={e => setNewPkg({ ...newPkg, price: e.target.value })} required /></div>
                                </div>
                                <div className="mb-4"><label className="block text-sm">Benefits</label><input className="w-full rounded border p-2" value={newPkg.benefits} onChange={e => setNewPkg({ ...newPkg, benefits: e.target.value })} /></div>

                                <div className="flex justify-end gap-2">
                                    <button type="button" onClick={() => setShowModal(false)} className="rounded bg-gray-300 px-4 py-2">Cancel</button>
                                    <button type="submit" className="rounded bg-red-600 px-4 py-2 text-white">Create</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PackageManagement;
