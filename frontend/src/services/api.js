// API service for connecting to FastAPI backend

const API_BASE_URL = 'http://localhost:8000';

// Get user details by username
export const getUserDetails = async (username) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${username}`);
    const data = await response.json();
    
    if (data.status !== 'ok') {
      throw new Error(data.message || 'Failed to fetch user details');
    }
    
    return data.data;
  } catch (error) {
    console.error('Error getting user details:', error);
    throw error;
  }
};

// Get all users (for admin or testing purposes)
export const getAllUsers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

// Register new user
// Register new user
export const registerUser = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: userData.username,
          email: userData.email,
          password_hash: userData.password  // This is the key issue - backend expects password_hash
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }
      
      const data = await response.json();
      
      if (data.status !== 'ok') {
        throw new Error(data.message || 'Failed to register user');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  };

// Check verification status
export const checkVerification = async (username) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${username}/verification-status`);
    const data = await response.json();
    
    if (data.status !== 'ok') {
      throw new Error(data.message || 'Failed to check verification status');
    }
    
    return data;
  } catch (error) {
    console.error('Error checking verification status:', error);
    throw error;
  }
};

// Request OTP
export const requestOTP = async (username, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${username}/request-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });
    
    const data = await response.json();
    
    if (response.status !== 200) {
      throw new Error(data.message || 'Failed to request OTP');
    }
    
    return data;
  } catch (error) {
    console.error('Error requesting OTP:', error);
    throw error;
  }
};

// Verify OTP
export const verifyOTP = async (username, otp) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${username}/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ otp }),
    });
    
    const data = await response.json();
    
    if (response.status !== 200) {
      throw new Error(JSON.stringify(data));
    }
    
    return data;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

// Execute Python code
export const executePythonCode = async (username, codeData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/execute/python`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...codeData,
        username
      }),
    });
    
    const data = await response.json();
    
    if (response.status !== 200) {
      throw new Error(data.detail || 'Failed to execute Python code');
    }
    
    return data;
  } catch (error) {
    console.error('Error executing Python code:', error);
    throw error;
  }
};

// Execute JavaScript code
export const executeJavaScriptCode = async (username, codeData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/execute/javascript`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...codeData,
        username
      }),
    });
    
    const data = await response.json();
    
    if (response.status !== 200) {
      throw new Error(data.detail || 'Failed to execute JavaScript code');
    }
    
    return data;
  } catch (error) {
    console.error('Error executing JavaScript code:', error);
    throw error;
  }
};

// Get user's functions
export const getUserFunctions = async (username) => {
  try {
    const response = await fetch(`${API_BASE_URL}/execute/functions/${username}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting user functions:', error);
    throw error;
  }
};

// Get function details with logs
export const getFunctionDetails = async (username, functionId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/execute/function/${functionId}/user/${username}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting function details:', error);
    throw error;
  }
};

// Get user usage statistics
export const getUserUsage = async (username) => {
  try {
    const response = await fetch(`${API_BASE_URL}/execute/usage/${username}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting user usage:', error);
    throw error;
  }
};

// Generic execute code function that determines which endpoint to use
export const executeCode = async (language, codeData) => {
  if (language === 'python') {
    return await executePythonCode(codeData.username, codeData);
  } else if (language === 'javascript') {
    return await executeJavaScriptCode(codeData.username, codeData);
  } else {
    throw new Error(`Unsupported language: ${language}`);
  }
};