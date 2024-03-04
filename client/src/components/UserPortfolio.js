import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

function UserPortfolio() {
  const { userId } = useParams();
  const [portfolio, setPortfolio] = useState(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/users/${userId}`)
      .then(response => response.json())
      .then(data => setPortfolio(data[userId]))
      .catch(error => console.error('Error fetching data:', error));
  }, [userId]);

  return (
    <div>
      {portfolio ? (
        <>
          <h2>Total Investment: {portfolio.total_investment}</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Portfolio Percentage</th>
                <th>Ticker</th>
                <th>Investment</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.stocks.map(stock => (
                <tr key={stock.symbol}>
                  <td>{stock.name}</td>
                  <td>{stock.portfolio_percentage}%</td>
                  <td><Link to={`/stock/${stock.symbol}`}>{stock.symbol}</Link></td>
                  <td>{stock.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : 'Loading...'}
    </div>
  );
}

export default UserPortfolio;
