import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

const NavBar = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();

  const handleLogoutClick = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/logout`, {
        method: 'POST', 
        credentials: 'include', 
      });
  
      if (response.ok) {
        console.log('Logout successful');
        setTimeout(() => window.location.reload(), 100);
        setIsLoggedIn(false);
        navigate('/'); 
      } else {
        console.error('Logout failed');
        alert('Logout failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      alert('An error occurred. Please try again.');
    }
  };


  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <Link className="navbar-brand" to="/">Home</Link>
      <div className="">
        <ul className="navbar-nav mr-auto">
          {isLoggedIn ? (
            <li className="nav-item">
              <button onClick={handleLogoutClick} className="nav-link" style={{ border: 'none', background: 'none' }}>Logout</button>
            </li>
          ) : (
            <>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;