import apiClient from './ApiService';

const UserService = {
  // Get current user
  getCurrentUser: async () => {
    const response = await apiClient.get('/users/me');
    return response.data;
  },

  // Update profile (uses existing PATCH /users/me)
  updateProfile: async (profileData) => {
    const response = await apiClient.patch('/users/me', profileData);
    return response.data;
  },

  // Change password (uses existing POST /users/change-password)
  changePassword: async (passwordData) => {
    const response = await apiClient.post('/users/change-password', passwordData);
    return response.data;
  },
};

export default UserService;
