import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function StockDetails() {
  // Retrieves the 'symbol' parameter from the URL using React Router's useParams hook.
  const { symbol } = useParams();
  // Initializes the stockDetails state as an empty array.
  const [stockDetails, setStockDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Added a state to track loading status


  
  // useEffect hook is used to perform side effects in the component. In this case, fetching stock details.
  useEffect(() => {
    // Fetches stock details from the backend API using the stock symbol obtained from the URL.
    fetch(`https://mcsbt-integration-sophie.ew.r.appspot.com/stock/${symbol}`)
      .then(response => response.json())
      .then(data => {
        console.log(data);  // Log the entire response
        setStockDetails(data);
        setIsLoading(false); // Set loading to false after data is loaded

      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setIsLoading(false); // Set loading to false even if there's an error
      });
  }, [symbol]);

   // Render a spinner with custom navy blue color
  const renderSpinner = () => (
    <div className="text-center mt-5">
      <div className="spinner-border" role="status" style={{ color: '#000080' }}> {/* Navy blue color */}
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  // Render the stock details with a custom navy blue header
  const renderStockDetails = () => (
    <>
      <h2 className="mb-4" style={{ color: '#000080' }}>Stock Details for {symbol}</h2>
      <div className="card shadow"> 
        <ul className="list-group list-group-flush">
          {stockDetails.map((detail, index) => (
            <li key={index} className="list-group-item">
              <span className="font-weight-bold">Month:</span> {detail.date}
              <span className="font-weight-bold float-right">Closing Price: {detail.closing_price}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );

  return (
    <div className="container mt-5">
      {isLoading ? renderSpinner() : renderStockDetails()}
    </div>
  );
}

export default StockDetails;