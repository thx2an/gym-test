import { createContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext({
    user: null,
    token: null,
    login: (email, password) => { },
    register: (payload) => { },
    logout: () => { },
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('ACCESS_TOKEN'));

    useEffect(() => {
        if (token) {
            // ideally fetch user profile here if not stored
            // setUser(JSON.parse(localStorage.getItem('USER_INFO')));
        }
    }, [token]);

    const login = async (email, password) => {
        try {
            const response = await axiosClient.post('/auth/login', { email, password });
            const { token, user } = response.data;

            setToken(token);
            setUser(user);

            localStorage.setItem('ACCESS_TOKEN', token);
            localStorage.setItem('USER_INFO', JSON.stringify(user));

            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const register = async (payload) => {
        try {
            await axiosClient.post('/auth/register', payload);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('ACCESS_TOKEN');
        localStorage.removeItem('USER_INFO');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext };
export default AuthContext;
