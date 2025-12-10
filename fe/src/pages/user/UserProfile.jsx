import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';

const UserProfile = () => {
    const [profile, setProfile] = useState({ full_name: '', email: '', phone: '', gender: '', date_of_birth: '' });
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axiosClient.get('/user/profile');
                // Format date for input if exists
                const data = res.data;
                if (data.date_of_birth) {
                    data.date_of_birth = data.date_of_birth.split('T')[0];
                }
                setProfile(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await axiosClient.put('/user/profile', profile);
            setMsg({ type: 'success', text: 'Profile updated!' });
        } catch (err) {
            setMsg({ type: 'error', text: 'Update failed' });
        }
    };

    if (loading) return <div className="p-10">Loading...</div>;

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
            <div className="w-full max-w-lg rounded-lg bg-white p-8 shadow-md">
                <h2 className="mb-6 text-2xl font-bold text-gray-800">My Profile</h2>

                {msg && (
                    <div className={`mb-4 rounded p-3 text-sm text-white ${msg.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                        {msg.text}
                    </div>
                )}

                <form onSubmit={handleUpdate}>
                    <div className="mb-4">
                        <label className="block text-sm text-gray-600">Email (Cannot Change)</label>
                        <input className="w-full rounded border bg-gray-100 p-2 text-gray-500" value={profile.email} disabled />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm">Full Name</label>
                        <input className="w-full rounded border p-2" value={profile.full_name} onChange={e => setProfile({ ...profile, full_name: e.target.value })} />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm">Phone</label>
                        <input className="w-full rounded border p-2" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} />
                    </div>
                    <div className="mb-4 flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm">Gender</label>
                            <select className="w-full rounded border p-2" value={profile.gender || ''} onChange={e => setProfile({ ...profile, gender: e.target.value })}>
                                <option value="">Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm">Date of Birth</label>
                            <input type="date" className="w-full rounded border p-2" value={profile.date_of_birth || ''} onChange={e => setProfile({ ...profile, date_of_birth: e.target.value })} />
                        </div>
                    </div>

                    <button className="w-full rounded bg-blue-600 py-2 font-bold text-white hover:bg-blue-700">
                        Update Profile
                    </button>

                    <a href="/" className="mt-4 block text-center text-sm text-gray-500 hover:underline">Back to Dashboard</a>
                </form>
            </div>
        </div>
    );
};

export default UserProfile;
