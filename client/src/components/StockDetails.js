import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function StockDetails() {
  const { symbol } = useParams();
  const [stockDetails, setStockDetails] = useState([]);

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/stock/${symbol}`)
      .then(response => response.json())
      .then(data => {
        console.log(data);  // Log the entire response
        setStockDetails(data);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, [symbol]);
  
  
  return (
    <div className="container mt-5">
      {stockDetails.length > 0 ? (
        <>
          <h2 className="mb-4">Stock Details for {symbol}</h2>
          <ul className="list-group">
            {stockDetails.map((detail, index) => (
              <li key={index} className="list-group-item">
                Ticker Symbol: {symbol}, Month: {detail.date}, Closing Price: {detail.closing_price}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  ); 
}

export default StockDetails;

