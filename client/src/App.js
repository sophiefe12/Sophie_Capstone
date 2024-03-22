import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom'; 
import 'bootstrap/dist/css/bootstrap.min.css'; 
import NavBar from './components/NavBar';
import WelcomePage from './components/WelcomePage';
import RegistrationForm from './components/RegistrationForm';
import UserPortfolio from './components/UserPortfolio';
import StockDetails from './components/StockDetails';


const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState('');
  const [notifications, setNotifications] = useState([]);
  const clearNotifications = () => setNotifications([]);

 
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/is_logged_in`, {
          method: 'GET',
          credentials: 'include', // This is important for cookies to be sent and received
        })

        if (response.ok) {
          const responseData = await response.json();
          if (responseData.logged_in) {
            setIsLoggedIn(true);
            setUsername(responseData.username);
          } else {
            setIsLoggedIn(false);
            setUsername('');
          }
        }
      } catch (error) {
        console.error('Check logged in error:', error);
      }
    };

    checkLoggedIn();
  }, []);

  const addNotification = (message) => {
    setNotifications((prevNotifications) => [...prevNotifications, message]);
  };

const handleLogin = useCallback(async (username, password) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/handle_login`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', 
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const responseData = await response.json();
      setIsLoggedIn(true);
      setUsername(responseData.username);
      setUserId(responseData.user_id); // Set the user ID in state
      localStorage.setItem('token', responseData.token);
      return responseData; // Return the user ID for immediate use
    } else {
      throw new Error('Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    return null; // Return null to indicate failure
  }
}, []);

const handleLogout = useCallback(async () => {
  try {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/logout`, {
      method: 'POST',
      credentials: 'include', // This is important to send the cookie back to the server
    });

    if (response.ok) {
      setIsLoggedIn(false);
      setUsername('');
      setUserId(null); 
      localStorage.removeItem('token');
      // Clear the cookie named 'session' on the client side
    } else {
      throw new Error('Logout failed');
    }
  } catch (error) {
    console.error('Logout error:', error);
    setIsLoggedIn(false);
    setUsername('');
    setUserId(null); // If you are storing user ID in the state
    localStorage.removeItem('token');
  }
}, []);

  return (
    <Router>
      <NavBar isLoggedIn={isLoggedIn} onLogout={handleLogout} notifications={notifications} clearNotifications={clearNotifications} />
      <Routes>
        <Route path="/" element={<WelcomePage isLoggedIn={isLoggedIn} onLogin={handleLogin} />} />
        <Route path="/WelcomePage" element={<WelcomePage isLoggedIn={isLoggedIn} onLogin={handleLogin} />} />
        <Route path="/register" element={<RegistrationForm />} />
        {isLoggedIn && (
          <>
        <Route path="/UserPortfolio/" element={<UserPortfolio isLoggedIn={isLoggedIn} addNotification={addNotification} />} />
            <Route path="/stock_details/:symbol" element={<StockDetails />} />
          </>
        )}
      </Routes>
    </Router>
  );  
};

export default App;