/**
 * Authentication utility functions
 */

const API_BASE_URL = 'http://localhost:5000';

/**
 * Get stored JWT token from localStorage
 */
export const getStoredToken = () => {
  return localStorage.getItem('access_token');
};

/**
 * Store JWT token in localStorage
 */
export const storeToken = (accessToken, refreshToken) => {
  localStorage.setItem('access_token', accessToken);
  if (refreshToken) {
    localStorage.setItem('refresh_token', refreshToken);
  }
};

/**
 * Clear stored tokens
 */
export const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

/**
 * Get authorization header for API requests
 */
export const getAuthHeader = () => {
  const token = getStoredToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

/**
 * Make authenticated API request
 */
export const authenticatedFetch = async (url, options = {}) => {
  const authHeaders = getAuthHeader();
  
  const requestOptions = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers
    }
  };

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, requestOptions);
    
    // If token is expired, try to refresh
    if (response.status === 401) {
      const refreshed = await refreshTokenIfNeeded();
      if (refreshed) {
        // Retry the request with new token
        const newAuthHeaders = getAuthHeader();
        const retryOptions = {
          ...requestOptions,
          headers: {
            ...requestOptions.headers,
            ...newAuthHeaders
          }
        };
        return await fetch(`${API_BASE_URL}${url}`, retryOptions);
      }
    }
    
    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

/**
 * Refresh JWT token if needed
 */
export const refreshTokenIfNeeded = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) {
    return false;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refresh_token: refreshToken })
    });

    if (response.ok) {
      const data = await response.json();
      storeToken(data.access_token, data.refresh_token);
      return true;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
  }

  return false;
};

/**
 * Login with username and password
 */
export const login = async (username, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok) {
      // Store tokens
      storeToken(data.access_token, data.refresh_token);
      
      // Get user info
      const userResponse = await authenticatedFetch('/api/auth/me');
      const userData = await userResponse.json();
      
      return {
        success: true,
        user_id: userData.user_id,
        username: userData.username
      };
    } else {
      return {
        success: false,
        error: data.detail || 'Login failed'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: 'Network error'
    };
  }
};

/**
 * Logout user
 */
export const logout = async () => {
  try {
    await authenticatedFetch('/api/auth/logout', { method: 'POST' });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    clearTokens();
  }
};

/**
 * Get current user info
 */
export const getCurrentUser = async () => {
  try {
    const response = await authenticatedFetch('/api/auth/me');
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Get current user failed:', error);
  }
  return null;
};
