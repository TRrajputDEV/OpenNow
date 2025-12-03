import apiClient from './ApiService';

const QuestionService = {
  // Get all questions by teacher
  getAllQuestions: async () => {
    const response = await apiClient.get('/questions');
    // Backend returns: { success, data: { questions, pagination }, message }
    return { data: response.data?.questions || response.data || [] };
  },

  // Get question by ID
  getQuestionById: async (id) => {
    const response = await apiClient.get(`/questions/${id}`);
    // Backend returns: { success, data: question, message }
    return { data: response.data || response };
  },

  // Create new question
  createQuestion: async (questionData) => {
    const response = await apiClient.post('/questions', questionData);
    return { data: response.data || response };
  },

  // Update question
  updateQuestion: async (id, questionData) => {
    const response = await apiClient.put(`/questions/${id}`, questionData);
    return { data: response.data || response };
  },

  // Delete question
  deleteQuestion: async (id) => {
    const response = await apiClient.delete(`/questions/${id}`);
    return { data: response.data || response };
  },

  // Get questions by subject
  getQuestionsBySubject: async (subject) => {
    const response = await apiClient.get(`/questions?subject=${subject}`);
    return { data: response.data?.questions || response.data || [] };
  },
};

export default QuestionService;
