import apiClient from './ApiService';

const ExamService = {
  // Get all exams by teacher
  getAllExams: async () => {
    const response = await apiClient.get('/exams');
    // Backend returns: { success, data: { exams, pagination }, message }
    return { data: response.data?.exams || response.data || [] };
  },

  // Get exam by ID
  getExamById: async (id) => {
    const response = await apiClient.get(`/exams/${id}`);
    return { data: response.data || response };
  },

  // Create new exam
  createExam: async (examData) => {
    const response = await apiClient.post('/exams', examData);
    return { data: response.data || response };
  },

  // Update exam
  updateExam: async (id, examData) => {
    const response = await apiClient.put(`/exams/${id}`, examData);
    return { data: response.data || response };
  },

  // Delete exam
  deleteExam: async (id) => {
    const response = await apiClient.delete(`/exams/${id}`);
    return { data: response.data || response };
  },

  // Publish exam
  publishExam: async (id) => {
    const response = await apiClient.patch(`/exams/${id}/publish`);
    return { data: response.data || response };
  },

  // Unpublish exam
  unpublishExam: async (id) => {
    const response = await apiClient.patch(`/exams/${id}/unpublish`);
    return { data: response.data || response };
  },

  // Get exam attempts
  getExamAttempts: async (examId) => {
    const response = await apiClient.get(`/exams/${examId}/attempts`);
    return { data: response.data || response };
  },
};

export default ExamService;
