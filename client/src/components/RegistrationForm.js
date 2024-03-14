import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function RegistrationForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    isUserLoggedIn();
  }, []);

  const isUserLoggedIn = () => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/is_logged_in`, {
      credentials: "include",
    })
    .then((response) => response.json())
    .then((json) => {
      if (json.logged_in) {
        navigate('/user-portfolio'); 
      }
    })
    .catch((error) => {
      console.error('Error checking login status:', error);
    });
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/handle_register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', 
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        navigate('/WelcomePage'); 
      } else {
        alert(data.error); 
      }
    } catch (error) {
      console.error('Error during registration:', error);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center align-items-center" style={{ height: '80vh' }}>
        <div className="col-md-6">
          <div className="card p-4">
            <div className="card-body">
              <h2 className="text-center mb-4">Welcome to the Stock Tracker</h2>
              <form onSubmit={handleRegister}>
                <div className="form-group mb-3">
                  <input 
                    type="text" 
                    className="form-control form-control-lg" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    placeholder="Username" 
                  />
                </div>
                <div className="form-group mb-3">
                  <input 
                    type="password" 
                    className="form-control form-control-lg" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="Password" 
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-lg btn-block">Register</button>
              </form>
              <p className="mt-4 text-center">
                Already have an account? <a href="/WelcomePage">Login here</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegistrationForm;