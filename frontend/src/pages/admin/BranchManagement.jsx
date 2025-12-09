import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import Sidebar from '../../components/common/Sidebar';

const BranchManagement = () => {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [newBranch, setNewBranch] = useState({ name: '', address: '', phone: '' });

    const fetchBranches = async () => {
        try {
            const response = await axiosClient.get('/admin/branches');
            setBranches(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBranches();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axiosClient.post('/admin/branches', newBranch);
            setShowModal(false);
            setNewBranch({ name: '', address: '', phone: '' });
            fetchBranches(); // Refresh list
        } catch (err) {
            alert('Failed to create branch');
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 overflow-auto p-10">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-800">Branch Management</h1>
                    <button
                        onClick={() => setShowModal(true)}
                        className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                    >
                        + Add Branch
                    </button>
                </div>

                {loading ? <p>Loading...</p> : (
                    <div className="overflow-hidden rounded-lg bg-white shadow-md">
                        <table className="w-full text-left">
                            <thead className="bg-gray-200 uppercase text-gray-600">
                                <tr>
                                    <th className="px-6 py-3">ID</th>
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3">Address</th>
                                    <th className="px-6 py-3">Phone</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600">
                                {branches.map((branch) => (
                                    <tr key={branch.branch_id} className="border-b hover:bg-gray-50">
                                        <td className="px-6 py-4">{branch.branch_id}</td>
                                        <td className="px-6 py-4 font-bold">{branch.name}</td>
                                        <td className="px-6 py-4">{branch.address}</td>
                                        <td className="px-6 py-4">{branch.phone}</td>
                                        <td className="px-6 py-4">
                                            <span className={`rounded-full px-2 py-1 text-xs text-white ${branch.is_active ? 'bg-green-500' : 'bg-red-500'}`}>
                                                {branch.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="text-blue-500 hover:text-blue-700">Edit</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Create Modal */}
                {showModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="w-96 rounded bg-white p-6 shadow-lg">
                            <h2 className="mb-4 text-xl font-bold">Add New Branch</h2>
                            <form onSubmit={handleCreate}>
                                <div className="mb-2">
                                    <label className="block text-sm">Name</label>
                                    <input className="w-full rounded border p-2" value={newBranch.name} onChange={e => setNewBranch({ ...newBranch, name: e.target.value })} required />
                                </div>
                                <div className="mb-2">
                                    <label className="block text-sm">Address</label>
                                    <input className="w-full rounded border p-2" value={newBranch.address} onChange={e => setNewBranch({ ...newBranch, address: e.target.value })} required />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm">Phone</label>
                                    <input className="w-full rounded border p-2" value={newBranch.phone} onChange={e => setNewBranch({ ...newBranch, phone: e.target.value })} />
                                </div>
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

export default BranchManagement;
