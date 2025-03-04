import React, { useState } from 'react';
import { getUserDetails, registerUser } from '../services/api';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isRegistering) {
        // Register new user
        await registerUser({
          username,
          email,
          password
        });
        setSuccess('Registration successful! Please log in.');
        setTimeout(() => {
          setIsRegistering(false);
          setSuccess('');
          setUsername('');
          setPassword('');
          setEmail('');
        }, 2000);
      } else {
        // For login, we fetch user details and verify on client-side
        const userData = await getUserDetails(username);
        onLoginSuccess(userData);
      }
    } catch (err) {
      console.error('Auth error:', err);
      // Handle registration errors more specifically
      if (isRegistering && err.message && (err.message.includes('duplicate') || err.message.includes('already exists'))) {
        setError('Username or email already exists. Please try another.');
      } else {
        setError(isRegistering ? 
          'Registration failed. ' + (err.message || 'Username may be taken or network error.') : 
          'Login failed. Username might not exist or service is unavailable.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="animated-shape shape1"></div>
        <div className="animated-shape shape2"></div>
        <div className="animated-shape shape3"></div>
        <div className="grid-overlay"></div>
      </div>
      
      <div className="login-content">
        <div className="login-form-container">
          <div className="login-form-header">
            <h2>{isRegistering ? 'Create Account' : 'Welcome Back'}</h2>
            <p>
              {isRegistering 
                ? 'Create your account to start using the platform' 
                : 'Enter your credentials to access your account'}
            </p>
          </div>
          
          {error && (
            <div className="alert alert-error">
              <i className="fa fa-exclamation-circle"></i>
              {error}
            </div>
          )}
          
          {success && (
            <div className="alert alert-success">
              <i className="fa fa-check-circle"></i>
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-control">
              <label htmlFor="username">Username</label>
              <div className="input-group">
                <span className="input-icon">
                  <i className="fa fa-user"></i>
                </span>
                <input
                  type="text"
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  disabled={loading}
                />
              </div>
            </div>
            
            {isRegistering && (
              <div className="form-control">
                <label htmlFor="email">Email Address</label>
                <div className="input-group">
                  <span className="input-icon">
                    <i className="fa fa-envelope"></i>
                  </span>
                  <input
                    type="email"
                    id="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    disabled={loading}
                  />
                </div>
              </div>
            )}
            
            <div className="form-control">
              <label htmlFor="password">Password</label>
              <div className="input-group">
                <span className="input-icon">
                  <i className="fa fa-lock"></i>
                </span>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={isRegistering ? "new-password" : "current-password"}
                  disabled={loading}
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              className={`btn-submit ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  <span>{isRegistering ? 'Creating Account...' : 'Logging in...'}</span>
                </>
              ) : (
                isRegistering ? 'Create Account' : 'Login'
              )}
            </button>
          </form>
          
          <div className="login-form-footer">
            <p>
              {isRegistering ? 'Already have an account?' : "Don't have an account yet?"}{' '}
              <button 
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError('');
                  setSuccess('');
                  setUsername('');
                  setPassword('');
                  setEmail('');
                }}
                className="btn-link"
                disabled={loading}
              >
                {isRegistering ? 'Login' : 'Register'}
              </button>
            </p>
          </div>
        </div>
        
        <div className="login-branding">
          <div className="branding-content">
            <h1>X-Serverless Code Platform</h1>
            <p className="tagline">Execute code in a secure cloud environment</p>
            
            <div className="features">
              <div className="feature-item">
                <div className="feature-icon">
                  <i className="fa fa-code"></i>
                </div>
                <div>
                  <h3>Run Code Anywhere</h3>
                  <p>Execute Python and JavaScript code from any device</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">
                  <i className="fa fa-chart-line"></i>
                </div>
                <div>
                  <h3>Track Usage</h3>
                  <p>Monitor your execution history and costs</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">
                  <i className="fa fa-shield-alt"></i>
                </div>
                <div>
                  <h3>Secure Verification</h3>
                  <p>Simple OTP-based security for your functions</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">
                  <i className="fa fa-save"></i>
                </div>
                <div>
                  <h3>Save Your Work</h3>
                  <p>Store and manage your functions for later use</p>
                </div>
              </div>
            </div>
            

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;