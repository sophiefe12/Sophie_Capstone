import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

function UserPortfolio({ isLoggedIn }) {
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
      navigate('/welcomepage');
      return;
    }

    const fetchPortfolioData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/users/${userId}`);
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched portfolio data:', data);
          const updatedStocks = data.stocks.map(stock => ({
            ...stock,
            id: stock.id,
            shares: parseInt(stock.shares, 10),
            purchase_price: `${parseFloat(stock.purchase_price).toFixed(2)}€`,
            current_price: `${parseFloat(stock.current_price).toFixed(2)}€` // Assuming you have current_price in your response
          }));
          
          const totalInvestment = updatedStocks.reduce((acc, curr) => acc + (curr.shares * parseFloat(curr.purchase_price)), 0);
  
          // It's important to calculate ROI based on the data just fetched rather than relying on the potentially stale portfolio state
          const totalCurrentValue = (updatedStocks.reduce((acc, curr) => acc + (curr.shares * parseFloat(curr.current_price)), 0));
          const roi = totalInvestment > 0 ? ((totalCurrentValue - totalInvestment) / totalInvestment) * 100 : 0;
  
          setPortfolio(prevPortfolio => ({
            ...prevPortfolio,
            ...data,
            stocks: updatedStocks,
            username: data.name,
            roi: `${roi.toFixed(2)}%`
          }));
  
          setTotalInvestment(totalInvestment);
        } else {
          throw new Error('Failed to fetch portfolio data');
        }
      } catch (error) {
        console.error('Error fetching portfolio data:', error);
      }
    };
  
    fetchPortfolioData();
  }, [userId, isLoggedIn, navigate]);

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
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/users/${userId}/add_stock`, {
          method: 'POST',
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
          const newStock = {
            id: stockResponse.stock.id, // Make sure to capture the 'id' from the response
            ...stockResponse.stock,
            shares: parseInt(form.shares),
            purchase_price: `${parseFloat(form.purchasePrice).toFixed(2)}€`,
          };
          const updatedTotalInvestment = totalInvestment + (newStock.shares * parseFloat(newStock.purchase_price));

          setPortfolio(prevPortfolio => {
            const updatedStocks = [...prevPortfolio.stocks, newStock].map(stock => ({
              ...stock,
              portfolio_percentage: updatedTotalInvestment > 0 ? ((stock.shares * parseFloat(stock.purchase_price)) / updatedTotalInvestment * 100).toFixed(2) : '0.00',
            }));
            
            return {
              ...prevPortfolio,
              stocks: updatedStocks,
              total_investment: `${updatedTotalInvestment.toFixed(2)}€`
            };
          });

          console.log(updatedStocks);

          setTotalInvestment(updatedTotalInvestment);
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
      }
    };

  const handleRemoveStock = async (stockId) => {
    console.log('Stock ID:', stockId); // This should log a defined stock ID.
    console.log('Attempting to remove stock with id:', stockId); // Add this line to log the stockId
  try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/users/${userId}/remove_stock/${stockId}`, {
        method: 'DELETE',
      });
      console.log('Response:', response);
      if (response.ok) {
        setPortfolio(prevPortfolio => {
          const updatedStocks = prevPortfolio.stocks.filter(stock => stock.id !== stockId);
          return { ...prevPortfolio, stocks: updatedStocks };
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove the stock');
      }
    } catch (error) {
      console.error('Error removing stock:', error);
    }
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
                {/* Calculate portfolio percentage based on total investment */}
                <td>{((stock.shares * parseFloat(stock.purchase_price)) / totalInvestment * 100).toFixed(2)}%</td>
                {/* Access totalInvestment from state (fixed the division by zero issue) */}
                <td><Link to={`/stock_details/${stock.symbol}`}>{stock.symbol || 'N/A'}</Link></td>
                <td>
                  <button onClick={() => handleRemoveStock(stock.id)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="container mt-5">
      <h1>{portfolio.username ? `${portfolio.username}'s Portfolio` : "User's Portfolio"}</h1>
      <div className="row align-items-end">
        <div className="col">
          <h2 style={{ color: '#000080' }}>Total Initial Investment: {totalInvestment.toFixed(2)}€</h2>
        </div>
        <div className="col">
          <h2 style={{ color: 'blue' }}>ROI: {portfolio.roi}</h2>
        </div>
      </div>
      <form onSubmit={handleAddStockSubmit} className="mb-3">
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