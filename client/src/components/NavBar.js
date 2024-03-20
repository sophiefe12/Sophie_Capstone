import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';

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

  const styles = {
    notificationBell: {
      position: 'relative', // Anchor for the absolute positioning of the notificationCounter
      fontSize: '1.6em', // Size of the bell icon
      color: 'navy', // Color of the bell icon
      cursor: 'pointer',
      marginRight: '1em', // Space from the right edge or other elements
    },
    notificationCounter: {
      position: 'absolute', // Positioning the counter badge absolutely
      top: '-5px', // Adjust as needed to position the badge above the bell icon
      right: '-5px', // Adjust as needed to position the badge to the right of the bell icon
      background: 'red', // Background color of the counter badge
      color: 'white', // Text color for the counter badge
      borderRadius: '50%', // Circular shape for the badge
      padding: '0.25em', // Padding inside the badge
      fontSize: '0.45em', // Font size of the counter number
      lineHeight: '1em', // Line height to center the text vertically
      minWidth: '1.5em', // Minimum width for single digits
      height: '1.5em', // Height of the badge to maintain aspect ratio
      textAlign: 'center', // Center the text horizontally
      zIndex: 2, // Ensure the badge appears above other elements
    },
    notificationDropdown: {
      right: 0,
      top: '100%', // Position it below the bell icon
      width: '350px', // Increase the width as needed
      maxHeight: '300px', // Set a max height
      overflowY: 'auto', // Add scroll for overflow
      zIndex: 1000, // Make sure it's on top of other elements
    },
    notificationItem: {
      padding: '10px',
      marginBottom: '5px',
      borderBottom: '1px solid #f0f0f0',
      fontSize: '1rem',
      whiteSpace: 'normal', // Allow text to wrap
      overflow: 'hidden',
      textOverflow: 'ellipsis', // Add ellipsis for overflowed text
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav mr-auto">
            {isLoggedIn && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/UserPortfolio" style={linkStyle}>Portfolio Overview</Link>
                </li>
                <li className="nav-item">
                  <button
                    onMouseEnter={() => setIsLogoutHovered(true)}
                    onMouseLeave={() => setIsLogoutHovered(false)}
                    onClick={handleLogoutClick}
                    className="nav-link btn btn-link"
                    style={logoutStyle}
                  >
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
        <div className="notification-bell" style={styles.notificationBell}>
        <FontAwesomeIcon 
          icon={faBell} 
          onClick={toggleNotifications}
        />
        {notifications.length > 0 && ( // This line checks if there are notifications and renders the counter if true
          <span style={styles.notificationCounter}>
            {notifications.length}
          </span>
        )}
        {showNotifications && (
          <div className="notification-dropdown position-absolute bg-white border rounded shadow-lg p-3" style={styles.notificationDropdown}>
            <h6>Notifications</h6>
            {notifications.length > 0 ? (
              <>
                <ul className="list-unstyled">
                  {notifications.map((notification, index) => (
                    <li key={index} style={styles.notificationItem}>{notification}</li>
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