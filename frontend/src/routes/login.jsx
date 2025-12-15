import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false); // Toggle Login <-> Register

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user, login, register } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading || !username.trim() || !password.trim()) return;

    setError('');

    const success = await login(
      username.trim(),
      password,
      isAdminLogin ? 'admin' : 'user',
      setError,
      setLoading
    );

    if (success) {
      navigate('/locations');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (loading || !username.trim() || !password.trim()) return;

    setError('');

    const success = await register(username.trim(), password, setError, setLoading);
    if (success) {
      navigate('/locations');
    }
  };

  // Redirect if already logged in
  useEffect(() => {
    if (user?.username) {
      navigate('/locations');
    }
  }, [user, navigate]);

  // Reset form when switching modes
  const resetForm = () => {
    setUsername('');
    setPassword('');
    setError('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f0f2f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: 'white',
          width: '100%',
          maxWidth: '420px',
          padding: '40px 36px',
          borderRadius: '12px',
          boxShadow: '0 8px 28px rgba(0, 0, 0, 0.12)',
          textAlign: 'center',
        }}
      >
        {/* Main Title */}
        <h1 style={{ marginBottom: '8px', fontSize: '28px', color: '#1a1a1a', fontWeight: '600' }}>
          {isRegisterMode ? 'Create Account' : 'Sign in to your account'}
        </h1>
        <p style={{ marginBottom: '32px', color: '#666', fontSize: '15px' }}>
          {isRegisterMode
            ? 'Join us to explore cultural events in Hong Kong!'
            : isAdminLogin
            ? 'Administrator access only'
            : 'Welcome back! Please login to continue.'}
        </p>

        {/* Form */}
        <form onSubmit={isRegisterMode ? handleRegister : handleLogin}>
          {/* Username Field */}
          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
              autoFocus
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: '16px',
                border: '1px solid #ccc',
                borderRadius: '8px',
                outline: 'none',
                transition: 'border 0.2s, box-shadow 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#1890ff';
                e.target.style.boxShadow = '0 0 0 3px rgba(24, 144, 255, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#ccc';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: '24px', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: '16px',
                border: '1px solid #ccc',
                borderRadius: '8px',
                outline: 'none',
                transition: 'border 0.2s, box-shadow 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#1890ff';
                e.target.style.boxShadow = '0 0 0 3px rgba(24, 144, 255, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#ccc';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                backgroundColor: '#fff2f0',
                color: '#ff4d4f',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #ffccc7',
                marginBottom: '20px',
                fontSize: '14px',
              }}
            >
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '17px',
              fontWeight: '600',
              backgroundColor: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.3s',
            }}
          >
            {loading
              ? 'Processing...'
              : isRegisterMode
              ? 'Create Account'
              : 'Sign In'}
          </button>
        </form>

        {/* Toggle Login/Register — Only for regular users */}
        {!isAdminLogin && !isRegisterMode && (
          <div style={{ marginTop: '28px', fontSize: '15px', color: '#666' }}>
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(true);
                resetForm();
              }}
              style={{
                color: '#1890ff',
                background: 'none',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Sign up here
            </button>
          </div>
        )}

        {/* Back to Login from Register */}
        {isRegisterMode && (
          <div style={{ marginTop: '28px', fontSize: '15px', color: '#666' }}>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(false);
                resetForm();
              }}
              style={{
                color: '#1890ff',
                background: 'none',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Sign in
            </button>
          </div>
        )}

        {/* Admin / User Mode Switch */}
        <div
          style={{
            marginTop: '36px',
            paddingTop: '24px',
            borderTop: '1px solid #eee',
            fontSize: '14px',
            color: '#888',
          }}
        >
          <span>
            {isAdminLogin ? 'Not an admin?' : 'Are you an administrator?'}{' '}
          </span>
          <button
            type="button"
            onClick={() => {
              setIsAdminLogin(!isAdminLogin);
              setIsRegisterMode(false); // Disable register in admin mode
              resetForm();
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#1890ff',
              fontWeight: '600',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            {isAdminLogin ? 'Switch to User Login' : 'Switch to Admin Login'}
          </button>
        </div>
      </div>
    </div>
  );
}