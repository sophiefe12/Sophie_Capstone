import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';


// Define custom styles for navy blue color, red color, and bold text
const styles = {
  navyBlueText: {
    color: '#000080', // This is a common color for "navy blue"
  },
  redText: {
    color: '#FF0000', // This is a hex code for "red"
  },
  boldText: {
    fontWeight: 'bold',
  },
  navyBlueTable: {
    borderColor: '#000080', // Border color for the table
  },
  navyBlueTableHeader: {
    backgroundColor: '#000080', // Background color for table header
    color: '#ffffff', // Text color for table header
  }
};


// Fetch stock details from the backend API
function fetchStockDetails(symbol) {
    return fetch(`https://mcsbt-integration-sophie.ew.r.appspot.com/stock_details/${symbol}`)
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


// Main component to display a user's stock portfolio
function UserPortfolio() {
  const { userId } = useParams();
  const [portfolio, setPortfolio] = useState({ stocks: [], total_investment: '0.00€', roi: '0.00€' });
  //const [newStockSymbol, setNewStockSymbol] = useState('');

  useEffect(() => {
    // Fetch user data on component mount or when userId changes
    fetch(`https://mcsbt-integration-sophie.ew.r.appspot.com/users/${userId}`)
      .then(response => response.json())
      .then(data => {
        if (data && data.stocks) {
          // Calculate total investment and ROI for the user
          const totalInvestment = data.stocks.reduce((sum, stock) => sum + (stock.purchase_price * stock.shares), 0);
          const totalCurrentValue = data.stocks.reduce((sum, stock) => sum + (stock.current_price * stock.shares), 0);
          const roi = totalCurrentValue - totalInvestment;
          // Calculate portfolio percentage for each stock
          const stocksWithPercentage = data.stocks.map(stock => ({
            ...stock,
            portfolio_percentage: ((stock.current_price * stock.shares) / totalCurrentValue) * 100
          }));
          // Update portfolio data in the state
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
  }, [userId]); // Dependency array to trigger effect when userId changes
  
  

// function handleAddStock(e) {
//     e.preventDefault();
//     fetchStockDetails(newStockSymbol).then(stockDetails => {
//       // Calculate the value of the new stock based on shares and current price
//       const newStockValue = stockDetails.currentPrice; // Assuming 1 share
//       const newTotalInvestment = parseFloat(portfolio.total_investment.replace('€', '')) + newStockValue;
      
//       const updatedStocks = portfolio.stocks.map(stock => {
//         // Convert stock value to float and recalculate portfolio percentage
//         const stockValue = parseFloat(stock.value.replace('€', ''));
//         return {
//           ...stock,
//           portfolio_percentage: ((stockValue / newTotalInvestment) * 100).toFixed(2),
//         };
//       });
  
//       // Create the new stock object with updated percentage
//       const stockToAdd = {
//         ...stockDetails,
//         portfolio_percentage: ((newStockValue / newTotalInvestment) * 100).toFixed(2),
//         value: `${newStockValue.toFixed(2)}€`,
//         shares: 1, // Assuming 1 share
//       };
  
//       updatedStocks.push(stockToAdd);
  
//       // Update portfolio with the new stocks array and total investment
//       setPortfolio({
//         ...portfolio,
//         stocks: updatedStocks,
//         total_investment: `${newTotalInvestment.toFixed(2)}€`,
//       });
  
//       // Add the new stock in the backend as well
//       fetch(`http://127.0.0.1:5000/users/${userId}/add_stock`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(stockToAdd),
//       })
//       // ... handle the backend response as before
//     }).catch(error => {
//       console.error('Error fetching stock details:', error);
//     });
//   }
  

  // Function to render the stocks table
  const renderStocksTable = (stocks) => {
    if (!stocks) return <div>Loading...</div>; // or any other loading state
  
    return (
      <table className="table table-bordered shadow" style={styles.navyBlueTable}> {/* You can choose 'shadow-sm' or 'shadow-lg' as well */}
    <thead style={styles.navyBlueTableHeader}>
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
      <h2 style={{ ...styles.navyBlueText, ...styles.boldText }}>Total Investment: {portfolio ? portfolio.total_investment : '-'}</h2>
      <h2 style={{ ...styles.Text, ...styles.boldText }}>Return On Investment: {portfolio ? portfolio.roi : '-'}</h2>
      {portfolio ? renderStocksTable(portfolio.stocks) : renderSpinner()}
    </div>
  );
}

export default UserPortfolio;
