import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Col, Row } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
        const sortedData = data
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
    <div className="container mt-5">
      <Row>
        <Col md={6}>
          {isLoading ? renderSpinner() : (
            <>
              <h2 className="mb-4" style={{ color: '#000080' }}>Stock Details for {symbol}</h2>
              <div className="card shadow"> 
                <ul className="list-group list-group-flush">
                {stockDetails.map((detail, index) => (
                  <li key={index} className="list-group-item">
                    <span className="font-weight-bold">Date: </span> {detail.date}
                    <span className="font-weight-bold float-right">Closing Price: </span>{detail.closing_price}€
                  </li>
                ))}
                </ul>
              </div>
            </>
          )}
        </Col>
        <Col md={6}>
          {!isLoading && (
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
                <Line type="monotone" dataKey="closing_price" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Col>
      </Row>
    </div>
  );
}

export default StockDetails;