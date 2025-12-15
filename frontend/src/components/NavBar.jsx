import React from 'react'
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function NavBar({ children }) {
  const { user, isSignedIn } = useAuth();

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

  
  if(user?.role == 'user'){
    return (
      <header style={{ width: '100%' }}>
        <nav style={navContainerStyle}>
          <Link to="/" style={logoStyle}>Cultural Programme</Link>
          <div style={linksStyle}>
            <Link to="/locations" style={linkStyle}>Locations</Link>
            <Link to="/map" style={linkStyle}>Map</Link>
            <Link to="/favourites" style={linkStyle}>Favourites</Link>
          </div>
          <div>
            <Link to="/logout" style={logoutStyle}>{isSignedIn ? `Logout (${user.username})` : 'Login'}</Link>
          </div>
        </nav>
        {children}   
      </header>
    )
  }else if (user?.role == 'admin'){
    return(
      <header style={{ width: '100%' }}>
        <nav style={navContainerStyle}>
          <Link to="/" style={logoStyle}>Cultural Programme</Link>
          <div style={linksStyle}>
            <Link to="/admin/events" style={linkStyle}>Manage Events</Link>
            <Link to="/admin/users" style={linkStyle}>Manage Users</Link>
            <Link to="/locations" style={linkStyle}>Locations</Link>
            <Link to="/map" style={linkStyle}>Map</Link>
            <Link to="/favourites" style={linkStyle}>Favourites</Link>
          </div>
          <div>
            <Link to="/logout" style={logoutStyle}>{isSignedIn ? `Logout (${user.username})` : 'Login'}</Link>
          </div>
        </nav>
        {children}
      </header>
    )
  }
}