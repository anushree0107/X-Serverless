import React, { useState } from 'react';
import { requestOTP, verifyOTP } from '../services/api';
import './VerificationOTP.css';

const VerificationOTP = ({ username, onVerificationComplete }) => {
  const [step, setStep] = useState('request'); // 'request' or 'verify'
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success', 'error', 'info'
  const [loading, setLoading] = useState(false);

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('');
    
    try {
      const response = await requestOTP(username, password);
      setMessageType('success');
      setMessage(response.message || 'OTP sent successfully to your email');
      setStep('verify');
    } catch (err) {
      setMessageType('error');
      setMessage(err.response?.data?.message || err.response?.data?.detail || 'Failed to request OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('');
    
    try {
      const response = await verifyOTP(username, otp);
      setMessageType('success');
      setMessage(response.message || 'Verification successful!');
      setTimeout(() => {
        onVerificationComplete();
      }, 1000);
    } catch (err) {
      setMessageType('error');
      setMessage(err.response?.data?.message || err.response?.data?.detail || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verification-otp">
      {message && (
        <div className={`message-box ${messageType}`}>
          <span className="message-icon">
            {messageType === 'success' && '✓'}
            {messageType === 'error' && '✗'}
            {messageType === 'info' && 'ℹ'}
          </span>
          <p>{message}</p>
        </div>
      )}

      {step === 'request' ? (
        <div className="verification-step">
          <div className="verification-header">
            <h4>Verification Required</h4>
            <p className="verification-subtitle">Request an OTP to execute code</p>
          </div>
          
          <form onSubmit={handleRequestOTP} className="verification-form">
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input 
                id="password"
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
            </div>
            
            <button 
              type="submit" 
              className="btn-verify" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="btn-spinner"></span>
                  Requesting...
                </>
              ) : (
                'Request OTP'
              )}
            </button>
          </form>
          
          <div className="verification-info">
            <p>
              <span className="info-icon">ℹ</span>
              A one-time password will be sent to your registered email address
            </p>
          </div>
        </div>
      ) : (
        <div className="verification-step">
          <div className="verification-header">
            <h4>Enter OTP</h4>
            <p className="verification-subtitle">Check your email for the verification code</p>
          </div>
          
          <form onSubmit={handleVerifyOTP} className="verification-form">
            <div className="otp-input-container">
              <div className="form-group">
                <label htmlFor="otp">OTP Code:</label>
                <input 
                  id="otp"
                  type="text" 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value.toUpperCase())}
                  placeholder="Enter OTP code"
                  required
                  autoComplete="one-time-code"
                  maxLength="6"
                />
              </div>
            </div>
            
            <div className="button-group">
              <button 
                type="submit" 
                className="btn-verify" 
                disabled={loading || otp.length < 4}
              >
                {loading ? (
                  <>
                    <span className="btn-spinner"></span>
                    Verifying...
                  </>
                ) : (
                  'Verify'
                )}
              </button>
              
              <button 
                type="button" 
                className="btn-back" 
                onClick={() => {
                  setStep('request');
                  setMessage('');
                  setMessageType('');
                  setOtp('');
                }}
                disabled={loading}
              >
                Back
              </button>
            </div>
          </form>
          
          <div className="verification-info">
            <p>
              <span className="info-icon">⏱</span>
              The OTP is valid for 5 minutes. After verification, your session will be active for 30 minutes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationOTP;