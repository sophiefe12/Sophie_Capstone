import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom'; 
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap styles
import WelcomePage from './components/WelcomePage';
import UserPortfolio from './components/UserPortfolio';
import StockDetails from './components/StockDetails';

function App() {
  console.log("it gets here")
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/user/:userId" element={<UserPortfolio />} />
        <Route path="/stock_details/:symbol" element={<StockDetails />} /> 
      </Routes>
    </Router>
  );
}

export default App;
