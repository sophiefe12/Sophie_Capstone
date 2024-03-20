import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

const WelcomePage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const loginResponse = await onLogin(username, password);
      if (loginResponse) {
        navigate(`/UserPortfolio`);
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const leftSideStyle = {
    background: 'linear-gradient(to bottom, #1e3047, #A3A4B6)',
    color: 'white',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '2rem',
  };

  const rightSideStyle = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem',
  };

  const primaryColor = '#BF2200'; // Example primary color from your logo


  return (
    <div className="container-fluid h-100">
      <div className="row no-gutters h-100">
        <div className="col-md-6" style={leftSideStyle}>
          <div>
            <h2 style={{ color: 'F7F7F7' }}>Nice to see you again</h2>
            <h1 className="display-4 font-weight-bold" style={{ color: primaryColor }}>WELCOME BACK</h1>
            <p style={{ color: 'F7F7F7' }}>Your favorite stock tracking tool, simplified for your everyday usage.</p>
          </div>
        </div>
        <div className="col-md-6" style={rightSideStyle}>
          <div className="container">
            <div className="text-center mb-5">
              <img
                src="/logo_S.png" // Make sure the path to your logo is correct
                alt="Stock Tracker Logo"
                className="mb-3"
                style={{ width: '100px', height: 'auto' }}
              />
              <h1>Stock Tracker</h1>
            </div>
            <div>
              <form onSubmit={handleLogin} className="mb-3">
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="password"
                    className="form-control mb-2"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  style={{ backgroundColor: '#4e73df', color: 'white' }} 
                >
                  Login
                </button>
              </form>
              <div className="text-center">
                <Link to="/register" className="btn btn-outline-secondary">Register here</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomePage;
