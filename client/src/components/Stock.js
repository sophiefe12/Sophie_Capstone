import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function Stock() {
  const [stockData, setStockData] = useState(null);
  const { symbol } = useParams();

  useEffect(() => {
    //fetch(`${process.env.REACT_APP_BACKEND_URL}/users/${user}`)
    fetch(`http://127.0.0.1:5000/users/${user}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => setStockData(data))
      .catch(error => {
        console.error('Error fetching data:', error);
        setStockData({ error: 'Load failed', details: error.toString() });
      });
  }, []);

  // if (!stockData) return <div>Loading...</div>;
  return(
    <div>
      <h1>{symbol} - Stock Information</h1>
      {/* Display the stockData here */}
      {/* ... */}
    </div>
  (!stockData)?(
    <div>Loading...</div>
  ):(
    <h1>{symbol} - Stock Information</h1>
  )
  );
}

export default Stock;
