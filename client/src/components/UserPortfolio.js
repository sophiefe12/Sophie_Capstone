import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './UserPortfolio.css'; 

function UserPortfolio({ isLoggedIn, addNotification }) {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [totalInvestment, setTotalInvestment] = useState(0);

  const [portfolio, setPortfolio] = useState({
    username: '',
    stocks: [],
    total_investment: '0.00€',
    roi: '0.00%',
  });
  const [form, setForm] = useState({
    ticker: '',
    shares: '',
    purchasePrice: '',
  });

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/WelcomePage');
    }
  
    // Define the function inside the useEffect or outside the component
    const fetchPortfolioData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/users`, {
          method: 'GET',
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched portfolio data:', data);
          const updatedStocks = data.stocks.map(stock => ({
            ...stock,
            id: stock.id,
            shares: parseInt(stock.shares, 10),
            purchase_price: `${parseFloat(stock.purchase_price).toFixed(2)}€`,
            current_price: `${parseFloat(stock.current_price).toFixed(2)}€`,
          }));
  
          const totalInvestment = updatedStocks.reduce((acc, curr) => acc + (curr.shares * parseFloat(curr.purchase_price)), 0);
  
          const totalCurrentValue = updatedStocks.reduce((acc, curr) => acc + (curr.shares * parseFloat(curr.current_price)), 0);
          const roi = totalInvestment > 0 ? ((totalCurrentValue - totalInvestment) / totalInvestment) * 100 : 0;
  
          setPortfolio(prevPortfolio => ({
            ...prevPortfolio,
            ...data,
            stocks: updatedStocks,
            username: data.name,
            roi: `${roi.toFixed(2)}%`,
          }));
  
          setTotalInvestment(totalInvestment);
        } else {
          throw new Error('Failed to fetch portfolio data');
        }
      } catch (error) {
        console.error('Error fetching portfolio data:', error);
      }
    };
  
    // Then, call the function
    fetchPortfolioData();
  }, [userId, isLoggedIn, navigate]);

  const calculateTotalsAndROI = (stocks) => {
    const totalInvestmentCalc = stocks.reduce((acc, curr) => acc + (curr.shares * parseFloat(curr.purchase_price)), 0);
    const totalCurrentValue = stocks.reduce((acc, curr) => acc + (curr.shares * parseFloat(curr.current_price)), 0);
    const roiCalc = totalInvestmentCalc > 0 ? ((totalCurrentValue - totalInvestmentCalc) / totalInvestmentCalc) * 100 : 0;
  
    setTotalInvestment(totalInvestmentCalc);
    setPortfolio(prevPortfolio => ({
      ...prevPortfolio,
      stocks: stocks,
      total_investment: `${totalInvestmentCalc.toFixed(2)}€`,
      roi: `${roiCalc.toFixed(2)}%`,
    }));
  };

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setForm(prevForm => ({
        ...prevForm,
        [name]: value,
      }));
    };

    const handleAddStockSubmit = async (e) => {
      e.preventDefault();
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/users/add_stock`, {
          method: 'POST',
          credentials: "include",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            symbol: form.ticker,
            shares: parseInt(form.shares),
            purchase_price: parseFloat(form.purchasePrice),
          }),
        });
        if (response.ok) {
          const stockResponse = await response.json();
          console.log('New stock response:', stockResponse);
          addNotification('Congratulations! Stock added successfully.');
          const newStock = {
            id: stockResponse.stock.id, 
            ...stockResponse.stock,
            shares: parseInt(form.shares),
            purchase_price: `${parseFloat(form.purchasePrice).toFixed(2)}€`,

          };
          const updatedTotalInvestment = totalInvestment + (newStock.shares * parseFloat(newStock.purchase_price));

          setPortfolio(prevPortfolio => {
            const updatedStocks = [...prevPortfolio.stocks, newStock];
            calculateTotalsAndROI(updatedStocks);
            return {
              ...prevPortfolio,
              stocks: updatedStocks,
            };
          });

          setForm({
            ticker: '',
            shares: '',
            purchasePrice: ''
          });
        } else {
          throw new Error('Network response was not ok.');
        }
      } catch (error) {
        console.error('Error adding stock:', error);
        setNotifications((prevNotifications) => [...prevNotifications, 'Error adding stock.']);

      }
    };

  const handleRemoveStock = async (stockId) => {
    console.log('Attempting to remove stock with id:', stockId); 
  try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/users/remove_stock/${stockId}`, {
        method: 'DELETE',
        credentials: "include"
      });
      console.log('Response:', response);
      if (response.ok) {
        setPortfolio(prevPortfolio => {
          addNotification('Stock removed successfully.');
          const updatedStocks = prevPortfolio.stocks.filter(stock => stock.id !== stockId);
          calculateTotalsAndROI(updatedStocks);
          return {
            ...prevPortfolio,
            stocks: updatedStocks,
          };
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove the stock');
      }
    } catch (error) {
      console.error('Error removing stock:', error);
    }
  };

  const Notification = ({ message }) => {
    if (!message) return null;
  
    return (
      <div className="alert alert-info" role="alert">
        {message}
      </div>
    );
  };

  const renderStocksTable = () => {
    if (portfolio.stocks.length === 0) {
      return <p>This is where your stocks will appear once you add them!</p>;
    }
    return (
      <div className="table-responsive">
        <table className="table table-bordered table-hover shadow">
          <thead style={{ backgroundColor: '#000080', color: 'white' }}>
            <tr>
              <th>Name</th>
              <th>Shares</th>
              <th>Purchase Price</th>
              <th>Current Value</th>
              <th>Portfolio Percentage</th>
              <th>Ticker</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {portfolio.stocks.map(stock => (
              <tr key={stock.id}>
                <td>{stock.name || 'Unknown'}</td>
                <td>{stock.shares}</td>
                <td>{stock.purchase_price}</td>
                <td>{stock.current_price}</td>
                <td>{((stock.shares * parseFloat(stock.purchase_price)) / totalInvestment * 100).toFixed(2)}%</td>
                <td><Link to={`/stock_details/${stock.symbol}`}>{stock.symbol || 'N/A'}</Link></td>
                <td>
                  <button onClick={() => handleRemoveStock(stock.id)} className="btn btn-secondary">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
      <div className="container mt-5 user-portfolio-container">
        <h1 className="user-portfolio-header">{portfolio.username ? `${portfolio.username}'s Portfolio` : "User's Portfolio"}</h1>
        <div className="row align-items-end investment-roi-container">
          <div className="col">
            <h2 className="investment-roi">Total Initial Investment: {totalInvestment.toFixed(2)}€</h2>
          </div>
          <div className="col">
            <h2 className="investment-roi">ROI: {portfolio.roi}</h2>
          </div>
        </div>
        <form onSubmit={handleAddStockSubmit} className="add-stock-form">
        <input
          type="text"
          className="form-control mb-2"
          placeholder="Ticker Symbol"
          name="ticker"
          value={form.ticker}
          onChange={handleInputChange}
          required
        />
        <input
          type="number"
          className="form-control mb-2"
          placeholder="Number of Shares"
          name="shares"
          value={form.shares}
          onChange={handleInputChange}
          required
        />
        <input
          type="number"
          className="form-control mb-2"
          placeholder="Purchase Price"
          name="purchasePrice"
          value={form.purchasePrice}
          onChange={handleInputChange}
          required
        />
        <button type="submit" className="btn btn-primary">Add Stock</button>
      </form>
      {renderStocksTable()}
    </div>
  );
}

export default UserPortfolio;