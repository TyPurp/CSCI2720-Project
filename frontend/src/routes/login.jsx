

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');


  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, login, register } = useAuth();

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    if (loading) return;
    e.preventDefault();
    const success = await login(username, password, setError, setLoading);
    if (success) {
      navigate('/locations');
    }
  };
  const handleRegister = async (e) => {
    if (loading) return;
    e.preventDefault();
    const success = await register(username, password, setError, setLoading);
    if (success) {
      navigate('/locations');
    }
  }

  useEffect(() => {
    if (user?.username) {
      navigate('/locations');
    }
  }, [user]);



  return (
    <div style={{ width: '100%', height: '100%', justifyContent: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2 style={{ marginBottom: 32 }}>Login</h2>
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 220, gap: 8, display: 'flex', flexDirection: 'column' }}>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', flexDirection: 'column', marginBottom: 8 }}>
          <label style={{ display: 'block', marginBottom: 4 }} htmlFor="username">Username</label>
          <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" style={{ padding: 8, width: '100%' }} />
        </div>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', flexDirection: 'column', marginBottom: 8 }}>
          <label style={{ display: 'block', marginBottom: 4 }} htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" style={{ padding: 8, width: '100%' }} />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16 }}>
          <button type="submit" style={{ width: '6em', height: '3em', padding: '8px 12px' }} disabled={loading}>Login</button>
          <button type="button" onClick={handleRegister} style={{ width: '6em', height: '3em', padding: '8px 12px' }} disabled={loading}>Register</button>
        </div>
      </form>
    </div>
  );
}
