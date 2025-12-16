// frontend/src/App.js
import useAuth from './hooks/useAuth';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigate } from 'react-router-dom';

import Login from './routes/login';
import Logout from './routes/logout';
import Locations from './routes/locations';
import LocationDetail from './routes/location_details';
import MapView from './routes/map_view';
import FavouritesPage from './routes/favourites';

import AdminEvents from './routes/AdminEvent';
import AdminUsers from './routes/AdminUser';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function App() {
  const { user, isSignedIn } = useAuth();
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (user?.theme) {
      setTheme(user.theme);
    }
  }, [user]);

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);

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

  return (
    <div className="App">
      <header style={styles.header}>
        <div style={styles.navLeft}>
          <h1 style={styles.title}>🎭 Cultural Events Website</h1>
          <nav style={styles.nav}>
            {isSignedIn && (
              <>
                <a href="/locations" style={styles.navLink}>📍 Locations</a>
                <a href="/map" style={styles.navLink}>🗺️ Map</a>
                <a href="/favourites" style={styles.navLink}>⭐ Favorites</a>
                {user?.role === 'admin' && (
                  <>
                    <a href="/admin/events" style={styles.navLink}>📅 Manage Events</a>
                    <a href="/admin/users" style={styles.navLink}>👥 Manage Users</a>
                  </>
                )}
              </>
            )}
          </nav>
        </div>
        
        <div style={styles.userInfo}>
          {isSignedIn && user && (
            <>
              <button 
                onClick={toggleTheme} 
                style={styles.themeToggle}
                title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              >
                {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
              </button>
              
              <span style={styles.username}>
                {user.role === 'admin' ? '👑 ' : '👤 '}
                {user.username} ({user.role === 'admin' ? 'Admin' : 'User'})
              </span>
              <a href="/logout" style={styles.logoutLink}>Logout</a>
            </>
          )}
          {!isSignedIn && (
            <a href="/login" style={styles.loginLink}>Login</a>
          )}
        </div>
      </header>

      <main style={{ padding: 0 }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/locations" element={<Locations />} />
          <Route path="/locations/:id" element={<LocationDetail />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/favourites" element={<FavouritesPage />} />
          <Route path="/admin/events" element={<AdminEvents />}/>
          <Route path="/admin/users" element={ <AdminUsers />}/>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<div style={{ padding: 20 }}><h2>404</h2><p>Page not found.</p></div>} />
        </Routes>
      </main>

      <footer style={styles.footer}>
        <p>© 2024 Cultural Events Website - CSCI2720 Course Project</p>
        <p style={styles.footerNote}>
          Current Theme: <strong>{theme === 'light' ? 'Light' : 'Dark'}</strong>
          • Backend API: http://localhost:5000
        </p>
      </footer>
    </div>
  );
}

const styles = {
  header: {
    backgroundColor: '#2c3e50',
    color: 'white',
    padding: '15px 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  navLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '30px'
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 'bold'
  },
  nav: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center'
  },
  navLink: {
    color: 'white',
    textDecoration: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    transition: 'background-color 0.3s'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  username: {
    fontSize: '14px',
    opacity: 0.9
  },
  themeToggle: {
    backgroundColor: 'transparent',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.3)',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  logoutLink: {
    color: '#e74c3c',
    textDecoration: 'none',
    fontSize: '14px',
    padding: '6px 12px',
    border: '1px solid #e74c3c',
    borderRadius: '4px'
  },
  loginLink: {
    color: '#3498db',
    textDecoration: 'none',
    fontSize: '14px',
    padding: '6px 12px',
    border: '1px solid #3498db',
    borderRadius: '4px'
  },
  footer: {
    backgroundColor: '#ecf0f1',
    padding: '15px 30px',
    textAlign: 'center',
    color: '#7f8c8d',
    fontSize: '14px'
  },
  footerNote: {
    marginTop: '5px',
    fontSize: '13px'
  }
};

export default App;