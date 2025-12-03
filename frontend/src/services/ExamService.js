import apiClient from './ApiService';

const ExamService = {
  // Get all exams by teacher
  getAllExams: async () => {
    return await apiClient.get('/exams/my-exams');
  },

  // Get exam by ID
  getExamById: async (id) => {
    return await apiClient.get(`/exams/${id}`);
  },

  // Create new exam
  createExam: async (examData) => {
    return await apiClient.post('/exams', examData);
  },

  // Update exam
  updateExam: async (id, examData) => {
    return await apiClient.patch(`/exams/${id}`, examData);
  },

  // Delete exam
  deleteExam: async (id) => {
    return await apiClient.delete(`/exams/${id}`);
  },

  // Publish exam
  publishExam: async (id) => {
    return await apiClient.patch(`/exams/${id}/publish`);
  },

  // Get exam attempts
  getExamAttempts: async (examId) => {
    return await apiClient.get(`/exams/${examId}/attempts`);
  },
};

export default ExamService;
