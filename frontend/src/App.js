import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Login from './components/Login';  // You'll need to create this component
import { getUserDetails } from './services/api';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing user session on app load
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    
    if (storedUsername) {
      // Fetch the user details using the stored username
      getUserDetails(storedUsername)
        .then(userData => {
          setUser(userData);
          setError(null);
        })
        .catch(err => {
          console.error('Error fetching user:', err);
          localStorage.removeItem('username');
          setError('Session expired. Please login again.');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  // Handle successful login
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('username', userData.username);
    setError(null);
  };

  // Handle logout
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('username');
  };

  if (loading) {
    return <div className="loading">Loading user data...</div>;
  }

  const currentDateTime = new Date().toISOString()
    .replace('T', ' ')
    .substring(0, 19);

  return (
    <div className="app">
      <header className="app-header">
        <h1>X-Serverless Code Platform</h1>
        <div className="user-info">
          {user && (
            <>
              <span>Current Date and Time (UTC): {currentDateTime}</span>
              <span>User: {user.username}</span>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </>
          )}
        </div>
      </header>
      
      <main className="app-content">
        {error && <div className="error-message">{error}</div>}
        
        {user ? (
          <Dashboard user={user} onLogout={handleLogout} />
        ) : (
          <Login onLoginSuccess={handleLoginSuccess} />
        )}
      </main>
      
      <footer className="app-footer">
       
      </footer>
    </div>
  );
}

export default App;