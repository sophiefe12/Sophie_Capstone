import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

const NavBar = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();

  const handleLogoutClick = async () => {
    try {
      // Make sure REACT_APP_BACKEND_URL is set in your environment variables
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/logout`, {
        method: 'POST', // Match this with your backend
        credentials: 'include', // Required to send cookies
      });
  
      if (response.ok) {
        console.log('Logout successful');
        // Additional frontend cleanup if necessary
        localStorage.removeItem('token'); // Assuming you are using token-based auth as well
        setIsLoggedIn(false);
        navigate('/'); // Redirect to the home page or login page
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
              <li className="nav-item">
                <Link className="nav-link" to="/WelcomePage">Login</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/register">Register</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;