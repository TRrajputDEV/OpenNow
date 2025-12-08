import apiClient from "./ApiService";

const ExamService = {
  // Get all exams
  getAllExams: async () => {
    console.log("📡 ExamService: Fetching all exams...");
    const response = await apiClient.get("/exams");
    console.log("✅ ExamService: Exams fetched:", response.data);
    return { data: response.data?.exams || response.data || [] };
  },

  // Get exam by ID
  getExamById: async (id) => {
    console.log("📡 ExamService: Fetching exam by ID:", id);
    const response = await apiClient.get(`/exams/${id}`);
    console.log("✅ ExamService: Exam fetched:", response.data);
    return { data: response.data || response };
  },

  // Create new exam
  createExam: async (examData) => {
    console.log("📡 ExamService: Creating exam with data:", examData);
    const response = await apiClient.post("/exams", examData);
    console.log("✅ ExamService: Exam created:", response.data);
    return { data: response.data || response };
  },

  // Update exam
  updateExam: async (id, examData) => {
    console.log("📡 ExamService: Updating exam:", id, examData);
    const response = await apiClient.put(`/exams/${id}`, examData);
    console.log("✅ ExamService: Exam updated:", response.data);
    return { data: response.data || response };
  },

  // Delete exam
  deleteExam: async (id) => {
    console.log("📡 ExamService: Deleting exam:", id);
    const response = await apiClient.delete(`/exams/${id}`);
    console.log("✅ ExamService: Exam deleted");
    return { data: response.data || response };
  },

  // Publish exam
  publishExam: async (id) => {
    console.log("📡 ExamService: Publishing exam:", id);
    const response = await apiClient.patch(`/exams/${id}/publish`);
    console.log("✅ ExamService: Exam published");
    return { data: response.data || response };
  },

  // Unpublish exam
  unpublishExam: async (id) => {
    console.log("📡 ExamService: Unpublishing exam:", id);
    const response = await apiClient.patch(`/exams/${id}/unpublish`);
    console.log("✅ ExamService: Exam unpublished");
    return { data: response.data || response };
  },

  // ========== NEW: EXAM ATTEMPT METHODS ==========

  startExamAttempt: async (examId) => {
    console.log("📡 ExamService: Starting exam attempt for exam:", examId);
    const response = await apiClient.post(`/attempts/start/${examId}`);
    console.log("✅ ExamService: Exam attempt started (raw):", response.data);

    // ApiResponse shape: { success, statusCode, data, message }
    const data = response.data?.data || response.data;
    console.log("✅ ExamService: Unwrapped exam attempt data:", data);

    return data;
  },

  // Save answer during exam
  saveAnswer: async (attemptId, answerData) => {
    console.log(
      "📡 ExamService: Saving answer for attempt:",
      attemptId,
      answerData
    );
    const response = await apiClient.post(
      `/attempts/${attemptId}/answer`,
      answerData
    );
    console.log("✅ ExamService: Answer saved");
    return { data: response.data || response };
  },

  // Submit exam attempt
  submitExamAttempt: async (attemptId, submissionData) => {
    console.log(
      "📡 ExamService: Submitting exam attempt:",
      attemptId,
      submissionData
    );
    const response = await apiClient.post(
      `/attempts/${attemptId}/submit`,
      submissionData
    );
    console.log("✅ ExamService: Exam submitted! Result:", response.data);
    return { data: response.data || response };
  },

  // Get attempt result by ID

  getAttemptById: async (attemptId) => {
    console.log("📡 ExamService: Fetching attempt result:", attemptId);
    const response = await apiClient.get(`/attempts/${attemptId}/result`);
    console.log("✅ ExamService: Attempt result fetched:", response.data);
    const data = response.data?.data || response.data;
    return { data };
  },

  // Get all my attempts
  getMyAttempts: async () => {
    console.log("📡 ExamService: Fetching my attempts...");
    const response = await apiClient.get("/attempts/my-attempts");
    console.log("✅ ExamService: My attempts fetched:", response.data);
    return { data: response.data || [] };
  },

  // Get attempt stats
  getAttemptStats: async () => {
    console.log("📡 ExamService: Fetching attempt stats...");
    const response = await apiClient.get("/attempts/stats");
    console.log("✅ ExamService: Stats fetched:", response.data);
    return { data: response.data || response };
  },

  // Get attempts for specific exam (Teacher)
  getExamAttempts: async (examId) => {
    console.log("📡 ExamService: Fetching attempts for exam:", examId);
    const response = await apiClient.get(`/attempts/exam/${examId}`);
    console.log("✅ ExamService: Exam attempts fetched:", response.data);
    return { data: response.data || response };
  },
};

export default ExamService;
