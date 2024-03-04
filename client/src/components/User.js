// src/components/User.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const { userId } = useParams();

const User = () => {
  const { userId } = useParams(); // Move this line inside the component
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Make the API call when the component mounts
    const fetchUserData = async () => {
      try {
        const url = `${process.env.REACT_APP_BACKEND_URL}/users/${userId}`;
        console.log(`Fetching data from: ${url}`); // Debugging line
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error("Could not fetch user data: ", error);
      }
    };

    fetchUserData();
  }, [userId]); // The useEffect will re-run if userId changes

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>User Data</h1>
      {/* Render user data here */}
    </div>
  );
};

export default User;
