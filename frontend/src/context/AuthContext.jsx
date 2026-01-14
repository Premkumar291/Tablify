import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginApi, register as registerApi } from '../api/auth.api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const { data } = await loginApi(email, password);
        localStorage.setItem('token', data.tokens.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        return data;
    };

    const register = async (email, password, name) => {
        const { data } = await registerApi(email, password, name);
        localStorage.setItem('token', data.tokens.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
