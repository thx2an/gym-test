import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const RegisterPage = () => {
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        const result = await register({
            full_name: formData.full_name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password
        });

        if (result.success) {
            navigate('/login');
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
                <h2 className="mb-6 text-center text-3xl font-bold text-gray-800">Create Account</h2>

                {error && (
                    <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-gray-700">Full Name</label>
                        <input name="full_name" onChange={handleChange} className="w-full rounded border px-3 py-2" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-gray-700">Email</label>
                        <input name="email" type="email" onChange={handleChange} className="w-full rounded border px-3 py-2" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-gray-700">Phone</label>
                        <input name="phone" onChange={handleChange} className="w-full rounded border px-3 py-2" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-gray-700">Password</label>
                        <input name="password" type="password" onChange={handleChange} className="w-full rounded border px-3 py-2" required />
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700">Confirm Password</label>
                        <input name="confirmPassword" type="password" onChange={handleChange} className="w-full rounded border px-3 py-2" required />
                    </div>

                    <button className="w-full rounded bg-green-600 py-2 font-bold text-white hover:bg-green-700">
                        Register
                    </button>

                    <div className="mt-4 text-center">
                        <Link to="/login" className="text-blue-600 hover:text-blue-800">Already have an account? Login</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;
