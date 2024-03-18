import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const WelcomePage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const loginResponse = await onLogin(username, password);
      if (loginResponse) {
        // Extract the userId from the loginResponse
        const userId = loginResponse.user_id;
        navigate(`/UserPortfolio/${userId}`); // Navigate using the user ID
      }
    } catch (error) {
      // Handle the login failure error here
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="container-fluid bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="text-center mb-5">
              <img
                src="/logo_S.png" // Make sure the path to your logo is correct
                alt="Stock Tracker Logo"
                className="mb-3"
                style={{ width: '100px', height: 'auto', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
              />
              <h1 className="display-4">Welcome to the Stock Tracker</h1>
            </div>
            <div className="list-group">
              <form onSubmit={handleLogin} className="mb-3">
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <input
                  type="password"
                  className="form-control mb-2"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit" className="btn btn-primary w-100">Login</button>
              </form>
              <div className="text-center">
                <Link to="/register" className="btn btn-secondary">Register here</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomePage;
