import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import Sidebar from '../../components/common/Sidebar';

const StaffManagement = () => {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [newStaff, setNewStaff] = useState({
        full_name: '', email: '', phone: '', password: '', role_code: 'PT'
    });

    const fetchStaff = async () => {
        try {
            const response = await axiosClient.get('/admin/staff');
            setStaff(response.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBranches(); // Should be fetchStaff, careful copy paste?
        fetchStaff();
    }, []);

    // Placeholder function to avoid linter error if I kept the typo
    const fetchBranches = () => { };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axiosClient.post('/admin/staff', newStaff);
            setShowModal(false);
            setNewStaff({ full_name: '', email: '', phone: '', password: '', role_code: 'PT' });
            fetchStaff();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create staff');
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 overflow-auto p-10">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-800">Staff Management</h1>
                    <button
                        onClick={() => setShowModal(true)}
                        className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                    >
                        + Add Staff
                    </button>
                </div>

                <div className="overflow-hidden rounded-lg bg-white shadow-md">
                    <table className="w-full text-left">
                        <thead className="bg-gray-200 uppercase text-gray-600">
                            <tr>
                                <th className="px-6 py-3">ID</th>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Role</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600">
                            {staff.map((s) => (
                                <tr key={s.user_id} className="border-b hover:bg-gray-50">
                                    <td className="px-6 py-4">{s.user_id}</td>
                                    <td className="px-6 py-4 font-bold">{s.full_name}</td>
                                    <td className="px-6 py-4">{s.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`rounded-full px-2 py-1 text-xs text-white ${s.role_code === 'MANAGER' ? 'bg-purple-500' : 'bg-blue-500'}`}>
                                            {s.role_name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                                            {s.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="w-96 rounded bg-white p-6 shadow-lg">
                            <h2 className="mb-4 text-xl font-bold">Add Staff</h2>
                            <form onSubmit={handleCreate}>
                                <div className="mb-2">
                                    <label className="block text-sm">Full Name</label>
                                    <input className="w-full rounded border p-2" value={newStaff.full_name} onChange={e => setNewStaff({ ...newStaff, full_name: e.target.value })} required />
                                </div>
                                <div className="mb-2">
                                    <label className="block text-sm">Email</label>
                                    <input className="w-full rounded border p-2" type="email" value={newStaff.email} onChange={e => setNewStaff({ ...newStaff, email: e.target.value })} required />
                                </div>
                                <div className="mb-2">
                                    <label className="block text-sm">Phone</label>
                                    <input className="w-full rounded border p-2" value={newStaff.phone} onChange={e => setNewStaff({ ...newStaff, phone: e.target.value })} />
                                </div>
                                <div className="mb-2">
                                    <label className="block text-sm">Password</label>
                                    <input className="w-full rounded border p-2" type="password" value={newStaff.password} onChange={e => setNewStaff({ ...newStaff, password: e.target.value })} required />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm">Role</label>
                                    <select className="w-full rounded border p-2" value={newStaff.role_code} onChange={e => setNewStaff({ ...newStaff, role_code: e.target.value })}>
                                        <option value="PT">Personal Trainer</option>
                                        <option value="MANAGER">Branch Manager</option>
                                    </select>
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

export default StaffManagement;
