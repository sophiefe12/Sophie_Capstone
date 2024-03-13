import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom'; 
import 'bootstrap/dist/css/bootstrap.min.css'; 
import NavBar from './components/NavBar';
import WelcomePage from './components/WelcomePage';
import RegistrationForm from './components/RegistrationForm';
import UserPortfolio from './components/UserPortfolio';
import StockDetails from './components/StockDetails';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('token') !== null);

  const onLogin = (userData) => {
    setIsLoggedIn(true);
  };

  return (
    <Router>
      <NavBar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <Routes>
        <Route path="/" element={<WelcomePage isLoggedIn={isLoggedIn} onLogin={onLogin} />} />
        <Route path="/WelcomePage" element={<WelcomePage isLoggedIn={isLoggedIn} onLogin={onLogin} />} />
        <Route path="/register" element={<RegistrationForm />} />
        {isLoggedIn && (
          <>
            <Route path="/UserPortfolio/:userId" element={<UserPortfolio isLoggedIn={isLoggedIn} />} />
            <Route path="/stock_details/:symbol" element={<StockDetails />} />
          </>
        )}
      </Routes>
    </Router>
  );
};

export default App;