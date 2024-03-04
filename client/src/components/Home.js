import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <h1>Welcome to the Stock Tracker</h1>
      <p>Please choose which user you are:</p>
      <ul>
        <li><Link to="/user/user1">User 1</Link></li>
        <li><Link to="/user/user2">User 2</Link></li>
      </ul>
    </div>
  );
}

export default Home;
