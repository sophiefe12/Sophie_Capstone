import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import './NavBar.css'; 



const NavBar = ({ isLoggedIn, onLogout, notifications, clearNotifications }) => {
  const navigate = useNavigate();
  const [isLogoutHovered, setIsLogoutHovered] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false); // New state to toggle notifications dropdown

  const handleLogoutClick = async () => {
    await onLogout(); // This will call the handleLogout function in App.js
    clearNotifications();
    navigate('/');
  };

  const toggleNotifications = () => setShowNotifications(!showNotifications); // New method to toggle notifications

  const linkStyle = { color: '#000080', fontSize: '1.3rem' };
  const logoutStyle = {
    ...linkStyle,
    textDecoration: isLogoutHovered ? 'underline' : 'none'
  };


  return (
    <nav className="navbar navbar-expand-lg navBar">
      <div className="container-fluid">
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav mr-auto"> 
            {isLoggedIn && (
              <>
                <li className="nav-item">
                <Link className="nav-link linkStyle" to="/UserPortfolio">Portfolio Overview</Link>

                </li>
                <li className="nav-item">
                  <button
                    onMouseEnter={() => setIsLogoutHovered(true)}
                    onMouseLeave={() => setIsLogoutHovered(false)}
                    onClick={handleLogoutClick}
                    className="nav-link btn btn-link logoutButton"
                  >
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
        <div className="notification-bell notificationBell">
        <FontAwesomeIcon 
          icon={faBell} 
          onClick={toggleNotifications}
        />
        {notifications.length > 0 && ( // This line checks if there are notifications and renders the counter if true
          <span className="notificationCounter">
          {notifications.length}
        </span>
        )}
        {showNotifications && (
          <div className="notification-dropdown position-absolute bg-white border rounded shadow-lg p-3">
            <h6>Notifications</h6>
            {notifications.length > 0 ? (
              <>
                <ul className="list-unstyled">
                  {notifications.map((notification, index) => (
                    <li key={index} className="notificationItem">{notification}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-muted">No new notifications.</p>
            )}
            <div className="text-center mt-2">
              <button onClick={clearNotifications} className="btn btn-sm btn-secondary">
                Clear Notifications
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;