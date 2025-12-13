import { useState, useEffect } from 'react';

const apiBase = process.env.REACT_APP_API_BASE_URL || '';

export default function useAuth() {
    const [user, setUser] = useState(null);
    const [isSignedIn, setIsSignedIn] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
            setIsSignedIn(true);
        }

    }, []);

    const register = async (username, password, setError, setLoading) => {
        setError('');
        setIsSignedIn(false);
        try {
            setLoading(true);
            const res = await fetch(`${apiBase}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            setLoading(false);
            if (!res.ok) {
                if (res.status === 409) {
                    setError(res.body.message || 'Username already exists');
                    return false;
                }
                setError('Registration failed');
                return false;
            }
            const data = await res.json();
            if (data && data.success) {
                // Save minimal user info and navigate
                localStorage.setItem('user', JSON.stringify(data.user));
                setIsSignedIn(true);
                setUser(data.user);
                return true;
            } else {
                setError('Unknown error');
                return false;
            }
        } catch (err) {
        console.error(err);
        setError('Network error');
        }
    }

    const login = async (username, password, setError, setLoading) => {
        setError('');
        try {
            setLoading(true);
            const res = await fetch(`${apiBase}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            setLoading(false);
            if (!res.ok) {
                if (res.status === 401) {
                    setError(res.body.message || 'Invalid username or password');
                    return false;
                }
                setError('Login failed');
                return false;
            }
            const data = await res.json();
            if (data && data.success) {
                // Save minimal user info and navigate
                localStorage.setItem('user', JSON.stringify(data.user));
                setIsSignedIn(true);
                setUser(data.user);
                return true;
            } else {
                setError('Unknown Error');
                return false;
            }
        } catch (err) {
            console.error(err);
            setError('Network error');
        }
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    }

    return {
        "user": user,
        "isSignedIn": isSignedIn,
        "register": register,
        "login": login,
        "logout": logout
    }
}