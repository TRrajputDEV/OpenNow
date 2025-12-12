import apiClient from "./ApiService";

const ExamService = {
  // Get all exams
  getAllExams: async () => {
    const response = await apiClient.get("/exams");
    return { data: response.data?.exams || response.data || [] };
  },

  // Get exam by ID
  getExamById: async (id) => {
    const response = await apiClient.get(`/exams/${id}`);
    return { data: response.data || response };
  },

  // Create new exam
  createExam: async (examData) => {
    const response = await apiClient.post("/exams", examData);
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

  // ========== NEW: EXAM ATTEMPT METHODS ==========

  startExamAttempt: async (examId) => {
    const response = await apiClient.post(`/attempts/start/${examId}`);
    const data = response.data?.data || response.data;
    return data;
  },

  // Save answer during exam
  saveAnswer: async (attemptId, answerData) => {
    const response = await apiClient.post(
      `/attempts/${attemptId}/answer`,
      answerData
    );
    return { data: response.data || response };
  },

  // Submit exam attempt
  submitExamAttempt: async (attemptId, submissionData) => {
    const response = await apiClient.post(
      `/attempts/${attemptId}/submit`,
      submissionData
    );
    return { data: response.data || response };
  },

  // Get attempt result by ID
  getAttemptById: async (attemptId) => {
    const response = await apiClient.get(`/attempts/${attemptId}/result`);
    const data = response.data?.data || response.data;
    return { data };
  },

  // Get all my attempts
  getMyAttempts: async () => {
    const response = await apiClient.get("/attempts/my-attempts");
    return { data: response.data || [] };
  },

  // Get attempt stats
  getAttemptStats: async () => {
    const response = await apiClient.get("/attempts/stats");
    return { data: response.data || response };
  },

  // Get attempts for specific exam (Teacher)
  getExamAttempts: async (examId) => {
    const response = await apiClient.get(`/attempts/exam/${examId}`);
    return { data: response.data || response };
  },
};

export default ExamService;
