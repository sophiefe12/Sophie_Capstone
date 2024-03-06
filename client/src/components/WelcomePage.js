import React from 'react';
import { Link } from 'react-router-dom';

function WelcomePage() {
  return (
    <div className="container-fluid bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="text-center mb-5">
              {/* Logo with shadow */}
              <img
                src="/logo_S.png" // Update the path to where your logo is stored
                alt="Stock Tracker Logo"
                className="mb-3"
                style={{ width: '100px', height: 'auto', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
              />
              <h1 className="display-4">Welcome to the Stock Tracker</h1>
            </div>
            <div className="list-group">
              <Link to="/user/user1" className="list-group-item list-group-item-action">
                <h5>User 1</h5>
                <p className="mb-0">View User 1's Portfolio</p>
              </Link>
              <Link to="/user/user2" className="list-group-item list-group-item-action">
                <h5>User 2</h5>
                <p className="mb-0">View User 2's Portfolio</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomePage;
