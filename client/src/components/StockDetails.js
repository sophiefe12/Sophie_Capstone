import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function StockDetails() {
  const { symbol } = useParams();
  const [stockDetails, setStockDetails] = useState(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/stock/${symbol}`)
      .then(response => response.json())
      .then(data => setStockDetails(data))
      .catch(error => console.error('Error fetching data:', error));
  }, [symbol]);

  return (
    <div>
      {stockDetails ? (
        <>
          <h2>Stock Details for {symbol}</h2>
          <p>Last Month Closing Price: {stockDetails.last_month_closing_price}</p>
        </>
      ) : 'Loading...'}
    </div>
  );
}

export default StockDetails;
