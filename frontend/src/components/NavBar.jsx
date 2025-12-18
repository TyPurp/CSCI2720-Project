/*
CSCI2720 Project:
Members:
Chow Ho Yee (1155214324)
Ho Chi Tung (1155213294)
Lam Tsz Yi (1155212543)
 */
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function NavBar({ children }) {
  const { user, isSignedIn } = useAuth();
  const location = useLocation();
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.body.className = savedTheme;
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.body.className = newTheme;
    localStorage.setItem('theme', newTheme);
    
    if (user && user.username) {
      try {
        await fetch('http://localhost:5000/api/user/theme', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            username: user.username, 
            theme: newTheme 
          })
        });
      } catch (err) {
        console.error('Failed to update theme:', err);
      }
    }
  };

  const navContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: '#282c34',
    color: 'white',
    padding: '16px 0',
  };

  const logoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginLeft: '20px',
    marginRight: 'auto',
    fontWeight: 'bold',
    color: 'white',
    textDecoration: 'none',
    fontSize: '16px',
  };

  const linksStyle = {
    display: 'flex',
    gap: '32px',
    marginRight: 'auto',
  };

  const linkStyle = {
    color: 'white',
    textDecoration: 'none',
    fontSize: '16px',
  };

  const logoutStyle = {
    color: 'white',
    textDecoration: 'none',
    fontSize: '16px',
    marginRight: '20px',
  };

  const themeButtonStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    color: 'white',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '15px',
  };

  const userActionsStyle = {
    display: 'flex',
    alignItems: 'center',
  };

  if (user?.role === 'user') {
    return (
      <header style={{ width: '100%' }}>
        <nav style={navContainerStyle}>
          <Link to="/locations" style={logoStyle}>Cultural Programme</Link>
          <div style={linksStyle}>
            <Link to="/locations" style={linkStyle}>Locations</Link>
            <Link to="/event-list" style={linkStyle}>Events</Link>
            <Link to="/map" style={linkStyle}>Map</Link>
            <Link to="/favourites" style={linkStyle} class="bi bi-bookmarks-fill">Favourites</Link>
          </div>
          <div style={userActionsStyle}>
            <button 
              onClick={toggleTheme}
              style={themeButtonStyle}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <Link to="/logout" style={logoutStyle}>
              {isSignedIn ? `Logout (${user.username})` : 'Login'}
            </Link>
          </div>
        </nav>
        {children}
      </header>
    );
  }

  if (user?.role === 'admin') {
    return (
      <header style={{ width: '100%' }}>
        <nav style={navContainerStyle}>
          <Link to="/admin/events" style={logoStyle}>Cultural Programme</Link>
          <div style={linksStyle}>
            <Link to="/admin/events" style={linkStyle}>Manage Events</Link>
            <Link to="/admin/users" style={linkStyle}>Manage Users</Link>
            <Link to="/locations" style={linkStyle}>Locations</Link>
            <Link to="/event-list" style={linkStyle}>Events</Link>
            <Link to="/map" style={linkStyle}>Map</Link>
            <Link to="/favourites" style={linkStyle}>Favourites</Link>
          </div>
          <div style={userActionsStyle}>
            <button 
              onClick={toggleTheme}
              style={themeButtonStyle}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <Link to="/logout" style={logoutStyle}>
              {isSignedIn ? `Logout (${user.username})` : 'Login'}
            </Link>
          </div>
        </nav>
        {children}
      </header>
    );
  }

  return (
    <header style={{ width: '100%' }}>
      <nav style={navContainerStyle}>
        <Link to="/login" style={logoStyle}>Cultural Programme</Link>
        <div style={linksStyle}>
          <Link to="/locations" style={linkStyle}>Locations</Link>
          <Link to="/event-list" style={linkStyle}>Events</Link>
          <Link to="/map" style={linkStyle}>Map</Link>
        </div>
        <div style={userActionsStyle}>
          <button 
            onClick={toggleTheme}
            style={themeButtonStyle}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <Link to="/login" style={logoutStyle}>Login</Link>
        </div>
      </nav>
      {children}
    </header>
  );
}