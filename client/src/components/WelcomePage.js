import React from 'react';
import { Link } from 'react-router-dom';

function WelcomePage() {
  return (
    <div>
      <h1>Welcome to the Stock Tracker</h1>
      <p>
        <Link to="/user/user1">User 1</Link>
      </p>
      <p>
        <Link to="/user/user2">User 2</Link>
      </p>
    </div>
  );
}

export default WelcomePage;
