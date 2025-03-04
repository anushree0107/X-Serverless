import React from 'react';

const UserProfile = ({ user }) => {
  return (
    <div className="user-profile">
      <h2>User Profile</h2>
      <div className="profile-info">
        <div className="info-row">
          <span className="label">Username:</span>
          <span className="value">{user.username}</span>
        </div>
        <div className="info-row">
          <span className="label">Email:</span>
          <span className="value">{user.email}</span>
        </div>
        <div className="info-row">
          <span className="label">Joined:</span>
          <span className="value">
            {new Date(user.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="usage-stats">
        <h3>Usage Statistics</h3>
        <div className="stats-grid">
          <div className="stat-box">
            <span className="stat-value">{user.python_functions}</span>
            <span className="stat-label">Python Runs</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">{user.javascript_functions}</span>
            <span className="stat-label">JavaScript Runs</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">${user.cost.toFixed(2)}</span>
            <span className="stat-label">Total Cost</span>
          </div>
        </div>
        <p className="cost-info">Each code execution costs $0.01</p>
      </div>
    </div>
  );
};

export default UserProfile;