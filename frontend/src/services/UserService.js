import apiClient from './ApiService';

const UserService = {
  // Get current user
  getCurrentUser: async () => {
    console.log('📡 UserService: Fetching current user...');
    const response = await apiClient.get('/users/me');
    console.log('✅ UserService: User fetched:', response.data);
    return response.data;
  },

  // Update profile (uses existing PATCH /users/me)
  updateProfile: async (profileData) => {
    console.log('📡 UserService: Updating profile:', profileData);
    const response = await apiClient.patch('/users/me', profileData);
    console.log('✅ UserService: Profile updated:', response.data);
    return response.data;
  },

  // Change password (uses existing POST /users/change-password)
  changePassword: async (passwordData) => {
    console.log('📡 UserService: Changing password...');
    const response = await apiClient.post('/users/change-password', passwordData);
    console.log('✅ UserService: Password changed');
    return response.data;
  },
};

export default UserService;
