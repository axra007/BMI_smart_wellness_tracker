/**
 * BMI+ — Central API Helper & Session Management
 */

function getApiBase() {
  // If user opens via file:// or another port (like VS Code Live Server 5500 or 3000)
  if (
    typeof window !== 'undefined' &&
    (window.location.protocol === 'file:' ||
      (window.location.port && window.location.port !== '5000'))
  ) {
    return 'http://localhost:5000/api';
  }
  return '/api';
}

const API_BASE = getApiBase();

const API = {
  // Store Auth Token
  setToken(token) {
    localStorage.setItem('bmi_plus_token', token);
  },

  getToken() {
    return localStorage.getItem('bmi_plus_token');
  },

  removeToken() {
    localStorage.removeItem('bmi_plus_token');
    localStorage.removeItem('bmi_plus_user');
  },

  setUser(user) {
    localStorage.setItem('bmi_plus_user', JSON.stringify(user));
  },

  getUser() {
    const userStr = localStorage.getItem('bmi_plus_user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    return Boolean(this.getToken());
  },

  // Ensure user is logged in for protected pages
  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  },

  // Redirect if already logged in (for login/register pages)
  redirectIfAuthenticated() {
    if (this.isAuthenticated()) {
      window.location.href = 'dashboard.html';
    }
  },

  // Universal fetch wrapper
  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        // Token expired or invalid
        this.removeToken();
        window.location.href = 'login.html';
        throw new Error(data.message || 'Session expired. Please log in again.');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Request failed. Please try again.');
      }

      return data;
    } catch (error) {
      console.error(`API Error on ${endpoint}:`, error);

      // Handle Failed to fetch when server is not running or blocked
      if (
        error.message === 'Failed to fetch' ||
        error.name === 'TypeError' ||
        error.message.includes('NetworkError') ||
        error.message.includes('fetch')
      ) {
        throw new Error(
          'Cannot connect to the server at http://localhost:5000. Please start the backend server with "npm start" in your terminal, and open http://localhost:5000 in your browser.'
        );
      }

      throw error;
    }
  },

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },

  logout() {
    this.removeToken();
    window.location.href = 'login.html';
  },
};

