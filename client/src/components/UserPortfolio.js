import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

function fetchStockDetails(symbol) {
    return fetch(`http://127.0.0.1:5000/stock_details/${symbol}`)
      .then(response => response.json())
      .then(data => {
        if (!data.error) {
          return {
            symbol: symbol,
            name: data.name, // Use the name from the API response
            currentPrice: parseFloat(data.price), // Parse the price to a float
          };
        } else {
          throw new Error(data.error);
        }
      });
  }

function UserPortfolio() {
  const { userId } = useParams();
  const [portfolio, setPortfolio] = useState({ stocks: [], total_investment: '0.00€', roi: '0.00€' });
  const [newStockSymbol, setNewStockSymbol] = useState('');

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/users/${userId}`)
      .then(response => response.json())
      .then(data => {
        if (data && data.stocks) {
          const totalInvestment = data.stocks.reduce((sum, stock) => sum + (stock.purchase_price * stock.shares), 0);
          const totalCurrentValue = data.stocks.reduce((sum, stock) => sum + (stock.current_price * stock.shares), 0);
          const roi = totalCurrentValue - totalInvestment;
          // Calculate portfolio percentage for each stock
          const stocksWithPercentage = data.stocks.map(stock => ({
            ...stock,
            portfolio_percentage: ((stock.current_price * stock.shares) / totalCurrentValue) * 100
          }));
  
          setPortfolio({ 
            stocks: stocksWithPercentage,
            total_investment: totalInvestment.toLocaleString('en-EU', { style: 'currency', currency: 'EUR' }),
            roi: roi.toLocaleString('en-EU', { style: 'currency', currency: 'EUR' })
          });
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, [userId]);
  
  

function handleAddStock(e) {
    e.preventDefault();
    fetchStockDetails(newStockSymbol).then(stockDetails => {
      // Calculate the value of the new stock based on shares and current price
      const newStockValue = stockDetails.currentPrice; // Assuming 1 share
      const newTotalInvestment = parseFloat(portfolio.total_investment.replace('€', '')) + newStockValue;
      
      const updatedStocks = portfolio.stocks.map(stock => {
        // Convert stock value to float and recalculate portfolio percentage
        const stockValue = parseFloat(stock.value.replace('€', ''));
        return {
          ...stock,
          portfolio_percentage: ((stockValue / newTotalInvestment) * 100).toFixed(2),
        };
      });
  
      // Create the new stock object with updated percentage
      const stockToAdd = {
        ...stockDetails,
        portfolio_percentage: ((newStockValue / newTotalInvestment) * 100).toFixed(2),
        value: `${newStockValue.toFixed(2)}€`,
        shares: 1, // Assuming 1 share
      };
  
      updatedStocks.push(stockToAdd);
  
      // Update portfolio with the new stocks array and total investment
      setPortfolio({
        ...portfolio,
        stocks: updatedStocks,
        total_investment: `${newTotalInvestment.toFixed(2)}€`,
      });
  
      // Add the new stock in the backend as well
      fetch(`http://127.0.0.1:5000/users/${userId}/add_stock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stockToAdd),
      })
      // ... handle the backend response as before
    }).catch(error => {
      console.error('Error fetching stock details:', error);
    });
  }
  

  // Renders the table with portfolio stocks
  const renderStocksTable = (stocks) => {
    if (!stocks) return <div>Loading...</div>; // or any other loading state
  
    return (
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Shares</th>
            <th>Purchase Price</th>
            <th>Portfolio Percentage</th>
            <th>Ticker</th>
            <th>Current Value</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock, index) => {
            // Check if the properties exist before calling toFixed
            const purchasePrice = stock.purchase_price ? stock.purchase_price.toFixed(2) + '€' : 'N/A';
            const portfolioPercentage = stock.portfolio_percentage
            ? `${stock.portfolio_percentage.toFixed(2)}%`
            : 'N/A';
            const investment = stock.current_price && stock.shares ? (stock.current_price * stock.shares).toFixed(2) + '€' : 'N/A';
  
            return (
              <tr key={index}>
                <td>{stock.name || 'N/A'}</td>
                <td>{stock.shares || 'N/A'}</td>
                <td>{purchasePrice}</td>
                <td>{portfolioPercentage}</td>
                <td>
                  <Link to={`/stock_details/${stock.symbol}`}>{stock.symbol}</Link>
                </td>
                <td>{investment}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };  

  return (
    <div className="container mt-5">
      <h2>Total Investment: {portfolio.total_investment}</h2>
      <h2>ROI: {portfolio.roi}</h2>
      {renderStocksTable(portfolio.stocks)}
      <form onSubmit={handleAddStock} className="mt-3">
        <div className="form-group">
          <input
            type="text"
            className="form-control"
            placeholder="Symbol"
            value={newStockSymbol}
            onChange={(e) => setNewStockSymbol(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary">Add Stock</button>
      </form>
    </div>
  );
}

export default UserPortfolio;
