import { useState, useEffect } from 'react';

const apiBase = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setIsSignedIn(true);
      } catch (err) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  // REGISTER: Use the existing /api/admin/users route to create a regular user
  const register = async (username, password, setError, setLoading) => {
    if (!username || !password) {
      setError('Please enter both username and password');
      return false;
    }

    setError('');
    if (setLoading) setLoading(true);

    try {
      const res = await fetch(`${apiBase}/api/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          role: 'user',           // Force regular user
          favourites: []
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 11000) { // MongoDB duplicate key error
          setError('Username already exists');
        } else {
          setError(data.message || 'Registration failed');
        }
        if (setLoading) setLoading(false);
        return false;
      }

      // Success: auto-login the new user
      const newUser = { username: data.username, role: 'user' };
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
      setIsSignedIn(true);
      if (setLoading) setLoading(false);
      return true;

    } catch (err) {
      console.error('Register error:', err);
      setError('Network error. Is the backend running on port 5000?');
      if (setLoading) setLoading(false);
      return false;
    }
  };

  // LOGIN: unchanged, works with your /api/login
  const login = async (username, password, expectedRole = 'user', setError, setLoading) => {
    setError('');
    if (setLoading) setLoading(true);

    try {
      const res = await fetch(`${apiBase}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError('Invalid username or password');
        if (setLoading) setLoading(false);
        return false;
      }

      const loggedInUser = data.user;

      // Role check
      if (expectedRole === 'admin' && loggedInUser.role !== 'admin') {
        setError('Admin access denied. Use Admin login mode.');
        if (setLoading) setLoading(false);
        return false;
      }

      if (expectedRole === 'user' && loggedInUser.role === 'admin') {
        setError('Admins must use Admin login mode.');
        if (setLoading) setLoading(false);
        return false;
      }

      localStorage.setItem('user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      setIsSignedIn(true);
      if (setLoading) setLoading(false);
      return true;

    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Is the backend running?');
      if (setLoading) setLoading(false);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setIsSignedIn(false);
  };

  return {
    user,
    isSignedIn,
    register,
    login,
    logout,
  };
}