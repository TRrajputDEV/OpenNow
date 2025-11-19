import apiClient from './ApiService';

const AuthService = {
  // Register
  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    if (response.data?.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response;
  },

  // Login
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    if (response.data?.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response;
  },

  // Logout
  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
  },

  // Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },
};

export default AuthService;
