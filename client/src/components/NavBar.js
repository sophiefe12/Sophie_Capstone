import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

const NavBar = ({ isLoggedIn, onLogout }) => {
  const navigate = useNavigate();

  const handleLogoutClick = async () => {
    await onLogout(); // This will call the handleLogout function in App.js
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <Link className="navbar-brand" to="/">Home</Link>
      {/* Other navigation items */}
      {isLoggedIn && (
        <button onClick={handleLogoutClick} className="nav-link" style={{ border: 'none', background: 'none' }}>Logout</button>
      )}
    </nav>
  );
};

export default NavBar;