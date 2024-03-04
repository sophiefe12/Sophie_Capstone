import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WelcomePage from './components/WelcomePage';
import UserPortfolio from './components/UserPortfolio';
import StockDetails from './components/StockDetails';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/user/:userId" element={<UserPortfolio />} />
        <Route path="/stock/:symbol" element={<StockDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
