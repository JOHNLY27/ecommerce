import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.VITE_BACKEND_URL ? `${import.meta.env.VITE_BACKEND_URL}/api` : 'http://127.0.0.1:8000/api');
    axios.defaults.headers.common['Accept'] = 'application/json';

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            checkUser();
        } else {
            setLoading(false);
        }
    }, []);

    const checkUser = async () => {
        try {
            const res = await axios.get('/me');
            setUser(res.data);
        } catch (err) {
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
        }
        setLoading(false);
    };

    const login = async (email, password) => {
        const res = await axios.post('/login', { email, password });
        localStorage.setItem('token', res.data.access_token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.access_token}`;
        setUser(res.data.user);
        return res.data;
    };

    const register = async (name, email, password, phone, address) => {
        const res = await axios.post('/register', { name, email, password, phone, address });
        localStorage.setItem('token', res.data.access_token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.access_token}`;
        setUser(res.data.user);
        return res.data;
    };

    const logout = async () => {
        try {
            await axios.post('/logout');
        } finally {
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
            setUser(null);
        }
    };

    const updateUser = async (payload) => {
        try {
            let res;
            // if payload contains a file (profile photo), send as multipart/form-data
            const hasFile = payload && payload.photo;
            if (hasFile) {
                const form = new FormData();
                if (payload.name) form.append('name', payload.name);
                if (payload.email) form.append('email', payload.email);
                if (payload.phone) form.append('phone', payload.phone);
                if (payload.address) form.append('address', payload.address);
                form.append('photo', payload.photo);
                res = await axios.post('/me', form, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                // Remove photo key to prevent Laravel validation from failing on 'null' file
                const data = { ...payload };
                delete data.photo;
                res = await axios.post('/me', data);
            }
            // assume API returns updated user object
            setUser(res.data);
            return res.data;
        } catch (err) {
            console.error('Error updating user', err);
            throw err;
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, updateUser }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
