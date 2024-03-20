import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Col, Row } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './StockDetails.css'; 

function StockDetails() {
  const { symbol } = useParams();
  const [stockDetails, setStockDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStockDetails = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/stock/${symbol}`, {
          method: 'GET',
          credentials: 'include', 
        })
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const sortedData = data.monthly_data
          .map(detail => ({...detail, date: detail.date, closing_price: +detail.closing_price}))
          .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort data by date in ascending order
        setStockDetails(sortedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setIsLoading(false);
    };

    fetchStockDetails();
  }, [symbol]);


  const renderSpinner = () => (
    <div className="text-center mt-5">
      <div className="spinner-border" role="status" style={{ color: '#000080' }}>
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  const renderStockChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={stockDetails}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="closing_price" stroke="#007bff" activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  );

  return (
    <div className="container mt-5 stock-details-container">
      <div className="stock-details-grid">
        <div>
          {isLoading ? renderSpinner() : (
            <>
              <h2 className="stock-details-header">Stock Details for {symbol}</h2>
              <div className="card stock-details-card"> 
                <ul className="list-group list-group-flush stock-details-list">
                {stockDetails.map((detail, index) => (
                  <li key={index} className="stock-details-list-item">
                    <span>Date: </span> {detail.date}
                    <span>Closing Price: </span>{detail.closing_price}€
                  </li>
                ))}
                </ul>
              </div>
            </>
          )}
        </div>
        <div className="stock-chart-container">
          {!isLoading && renderStockChart()}
        </div>
      </div>
    </div>
  );
}

export default StockDetails;