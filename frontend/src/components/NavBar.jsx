import React from 'react'
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function NavBar({ children }) {
    const { user, isSignedIn } = useAuth();

  return (
    <header style={{ width: '100%', backgroundColor: '#282c34', color: 'white', padding: "16px 0" }}>
        <nav style={{ marginBottom: 8 }}>
            <Link to="/locations" style={{ marginRight: 16, color: '#61dafb', textDecoration: 'none' }}>Locations</Link>
            <Link to="/map" style={{ marginRight: 16, color: '#61dafb', textDecoration: 'none' }}>Map</Link>
            <Link to="/favourites" style={{ marginRight: 16, color: '#61dafb', textDecoration: 'none' }}>Favourites</Link>
            <Link to="/logout" style={{ color: '#61dafb', textDecoration: 'none' }}>{isSignedIn ? `Logout (${user.username})` : 'Login'}</Link>
        </nav>
        {children}
    </header>
  )
}
