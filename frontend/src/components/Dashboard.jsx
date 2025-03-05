import React, { useState, useEffect, useCallback } from 'react';
import CodeEditor from './CodeEditor';
import OutputConsole from './OutputConsole';
import UserProfile from './UserProfile';
import VerificationOTP from './VerificationOTP';
import { checkVerification, getUserUsage, getUserFunctions } from '../services/api';
import './Dashboard.css';

const Dashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('python');
  const [output, setOutput] = useState('');
  const [verificationStatus, setVerificationStatus] = useState({
    verified: false,
    remaining_minutes: 0
  });
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState({
    python_functions: user.python_functions || 0,
    javascript_functions: user.javascript_functions || 0,
    total_functions: (user.python_functions || 0) + (user.javascript_functions || 0),
    cost: user.cost || 0
  });
  const [userFunctions, setUserFunctions] = useState([]);
  const [currentDateTime, setCurrentDateTime] = useState(new Date().toISOString().replace('T', ' ').substring(0, 19));
  const [showVerificationReminder, setShowVerificationReminder] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date().toISOString().replace('T', ' ').substring(0, 19));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchUserData = useCallback(async () => {
    try {
      const verificationData = await checkVerification(user.username);
      setVerificationStatus(verificationData);
      
      if (verificationData.verified) {
        try {
          const usageData = await getUserUsage(user.username);
          setUserStats(usageData);
          
          const functionsData = await getUserFunctions(user.username);
          setUserFunctions(functionsData);
        } catch (dataError) {
          console.error('Error fetching user additional data:', dataError);
        }
      } else {
        setUserFunctions([]);
        setUserStats({
          python_functions: user.python_functions || 0,
          javascript_functions: user.javascript_functions || 0,
          total_functions: (user.python_functions || 0) + (user.javascript_functions || 0),
          cost: user.cost || 0
        });
      }
    } catch (err) {
      console.error('Error fetching verification status:', err);
      setVerificationStatus({
        verified: false,
        remaining_minutes: 0
      });
    }
  }, [user.username, user.python_functions, user.javascript_functions, user.cost]);

  useEffect(() => {
    fetchUserData();
    
    const intervalId = setInterval(() => {
      checkVerification(user.username)
        .then(data => {
          setVerificationStatus(data);
          
          if (data.verified) {
            Promise.all([
              getUserUsage(user.username).then(setUserStats).catch(console.error),
              getUserFunctions(user.username).then(setUserFunctions).catch(console.error)
            ]);
          }
        })
        .catch(err => {
          console.error('Error refreshing verification status:', err);
        });
    }, 60000); // 1 minute
    
    return () => clearInterval(intervalId);
  }, [fetchUserData, user.username]);

  const handleCodeResult = (result) => {
    setOutput(result);
    fetchUserData(); // Refresh user data after code run
  };
  
  // Function to handle verification notification
  const handleExecuteAttemptWithoutVerification = () => {
    setShowVerificationReminder(true);
    setTimeout(() => {
      setShowVerificationReminder(false);
    }, 5000);
  };

  return (
    <div className="dashboard">
      <div className="grid-overlay"></div>
      <div className="glow-effect top-left"></div>
      <div className="glow-effect bottom-right"></div>
      
      <div className="dashboard-left">
        <UserProfile 
          user={user} 
          stats={userStats} 
          onLogout={onLogout}
        />
        
        <div className="verification-section card">
          <div className="card-header">
            <h3>Verification Status</h3>
            <div className="header-indicator"></div>
          </div>
          
          <div className="card-content">
            {verificationStatus.verified ? (
              <div className="verified-status">
                <div className="status-icon-container">
                  <span className="status-badge verified">✓ Verified</span>
                  <div className="badge-ring"></div>
                </div>
                <p>Session expires in: <span className="highlight">{Math.round(verificationStatus.remaining_minutes)} minutes</span></p>
                <div className="time-progress">
                  <div 
                    className="time-bar" 
                    style={{width: `${(verificationStatus.remaining_minutes/30)*100}%`}}
                  ></div>
                </div>
              </div>
            ) : (
              <VerificationOTP 
                username={user.username} 
                onVerificationComplete={fetchUserData} 
              />
            )}
          </div>
        </div>
        
        <div className="quick-stats card">
          <div className="card-header">
            <h3>Session Info</h3>
            <div className="header-indicator"></div>
          </div>
          <div className="card-content stats-grid">
            <div className="stat-item">
              <div className="stat-icon python"></div>
              <div className="stat-info">
                <span className="stat-label">Python Executions</span>
                <span className="stat-value">{userStats.python_functions}</span>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon javascript"></div>
              <div className="stat-info">
                <span className="stat-label">JavaScript Executions</span>
                <span className="stat-value">{userStats.javascript_functions}</span>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon cost"></div>
              <div className="stat-info">
                <span className="stat-label">Total Cost</span>
                <span className="stat-value">${userStats.cost.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="dashboard-right">
        <div className="code-execution-panel">
          <div className="code-section card">
            <div className="card-header">
              <h3>Code Editor</h3>
              <div className="tab-buttons">
                <button 
                  className={`btn ${activeTab === 'python' ? 'active' : ''}`} 
                  onClick={() => setActiveTab('python')}
                >
                  <div className="btn-icon python"></div>
                  Python
                </button>
                <button 
                  className={`btn ${activeTab === 'javascript' ? 'active' : ''}`} 
                  onClick={() => setActiveTab('javascript')}
                >
                  <div className="btn-icon javascript"></div>
                  JavaScript
                </button>
              </div>
            </div>
            
            <div className="editor-container">
              <CodeEditor 
                language={activeTab} 
                username={user.username} 
                onResult={handleCodeResult} 
                setLoading={setLoading}
                isVerified={verificationStatus.verified}
                previousFunctions={userFunctions.filter(f => f.language === activeTab)}
                onUnverifiedExecuteAttempt={handleExecuteAttemptWithoutVerification}
              />
            </div>
          </div>
          
          <div className="output-section card">
            <div className="card-header">
              <h3>Output Console</h3>
              <div className="status-indicator">
                {loading ? 'Executing...' : 'Ready'}
                <div className={`status-dot ${loading ? 'active' : ''}`}></div>
              </div>
            </div>
            <OutputConsole output={output} loading={loading} />
          </div>
        </div>
      </div>
      
      {/* Verification Reminder Notification */}
      {showVerificationReminder && (
        <div className="verification-reminder">
          <div className="reminder-content">
            <span className="reminder-icon">⚠️</span>
            <p>Verification required! Please complete OTP verification to execute code.</p>
            <button 
              className="reminder-close"
              onClick={() => setShowVerificationReminder(false)}
            >
              &times;
            </button>
          </div>
        </div>
      )}
      

    </div>
  );
};

export default Dashboard;