// controllers/examAttempt.controller.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ExamAttempt } from "../models/examAttempt.model.js";
import { Exam } from "../models/exam.model.js";
import { Question } from "../models/question.model.js";

// ==================== START EXAM ====================

/**
 * @desc    Start exam attempt
 * @route   POST /api/v1/attempts/start/:examId
 * @access  Private (Student)
 */
export const startExam = asyncHandler(async (req, res) => {
  let { examId } = req.params;
  const studentId = req.user._id;

  console.log(
    "🎯 Backend startExam: examId =",
    examId,
    "studentId =",
    studentId
  );
  // 🔧 sanitize ID
  examId = examId.trim();
  console.log(
    "🎯 Backend startExam: examId =",
    JSON.stringify(examId),
    "\n studentId =",
    studentId
  );
  const exam = await Exam.findById(examId).populate("questions.question");

  if (!exam) {
    console.log("❌ Backend startExam: Exam not found");
    throw new ApiError(404, "Exam not found");
  }

  console.log(
    "✅ Backend startExam: Exam found. isPublished =",
    exam.isPublished
  );
  console.log("✅ Backend startExam: questions =", exam.questions);

  if (!Array.isArray(exam.questions)) {
    console.error(
      "❌ Backend startExam: exam.questions is not an array:",
      exam.questions
    );
    throw new ApiError(500, "Exam is misconfigured (questions not an array)");
  }

  console.log(
    "📊 Backend startExam: questions length =",
    exam.questions.length
  );

  // Existing validations:
  if (!exam.isPublished) {
    throw new ApiError(400, "Exam is not published yet");
  }

  if (!exam.isCurrentlyActive()) {
    throw new ApiError(400, "Exam is not currently active");
  }

  if (!exam.canStudentAttempt(studentId)) {
    throw new ApiError(403, "You are not allowed to attempt this exam");
  }

  const existingAttempt = await ExamAttempt.findOne({
    exam: examId,
    student: studentId,
  });
  console.log("📊 Backend startExam: existingAttempt =", existingAttempt?._id);

  if (existingAttempt) {
    if (existingAttempt.status === "in-progress") {
      console.log(
        "🔁 Backend startExam: Returning existing in-progress attempt"
      );
      return res
        .status(200)
        .json(new ApiResponse(200, existingAttempt, "Exam attempt resumed"));
    } else {
      throw new ApiError(400, "You have already attempted this exam");
    }
  }

  // Create new attempt
  console.log("🆕 Backend startExam: Creating new attempt");
  const attempt = await ExamAttempt.create({
    exam: examId,
    student: studentId,
    totalMarks: exam.totalMarks,
    answers: exam.questions.map((q) => ({
      question: q.question._id,
      selectedAnswer: null,
      maxMarks: q.marks,
    })),
    metadata: {
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    },
  });

  console.log("✅ Backend startExam: Attempt created with id =", attempt._id);

  // Build response examData
  const examData = {
    attemptId: attempt._id,
    examTitle: exam.title,
    duration: exam.duration,
    totalMarks: exam.totalMarks,
    instructions: exam.instructions,
    startTime: attempt.startTime,
    endTime: exam.endTime,
    questions: exam.questions.map((q) => ({
      _id: q.question._id,
      type: q.question.type,
      questionText: q.question.questionText,
      options: q.question.options,
      marks: q.marks,
      order: q.order,
    })),
  };

  console.log(
    "📦 Backend startExam: examData built. questions length =",
    examData.questions.length
  );

  if (exam.settings?.shuffleQuestions) {
    examData.questions = examData.questions.sort(() => Math.random() - 0.5);
    console.log("🔀 Backend startExam: questions shuffled");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, examData, "Exam started successfully"));
});

// ==================== SAVE ANSWER ====================

/**
 * @desc    Save/update answer during exam
 * @route   POST /api/v1/attempts/:attemptId/answer
 * @access  Private (Student)
 */
export const saveAnswer = asyncHandler(async (req, res) => {
  const { attemptId } = req.params;
  const { questionId, answer } = req.body;

  if (!questionId || answer === undefined) {
    throw new ApiError(400, "Question ID and answer are required");
  }

  const attempt = await ExamAttempt.findById(attemptId).populate("exam");

  if (!attempt) {
    throw new ApiError(404, "Attempt not found");
  }

  // Verify ownership
  if (attempt.student.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized");
  }

  // Check if attempt is still valid
  if (!attempt.isValid(attempt.exam.endTime)) {
    throw new ApiError(400, "Exam time has expired");
  }

  // Update answer
  const answerIndex = attempt.answers.findIndex(
    (ans) => ans.question.toString() === questionId
  );

  if (answerIndex === -1) {
    throw new ApiError(404, "Question not found in this attempt");
  }

  attempt.answers[answerIndex].selectedAnswer = answer;
  await attempt.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { saved: true }, "Answer saved successfully"));
});

// ==================== SUBMIT EXAM (ENHANCED WITH AUTO-GRADING) ====================

/**
 * @desc    Submit exam and calculate results with improved grading
 * @route   POST /api/v1/attempts/:attemptId/submit
 * @access  Private (Student)
 */
export const submitExam = asyncHandler(async (req, res) => {
  const { attemptId } = req.params;

  const attempt = await ExamAttempt.findById(attemptId)
    .populate("exam")
    .populate("student", "fullName email username");

  if (!attempt) {
    throw new ApiError(404, "Attempt not found");
  }

  // Verify ownership
  if (attempt.student._id.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized");
  }

  if (attempt.status !== "in-progress") {
    throw new ApiError(400, "Exam already submitted");
  }

  // Auto-submit if time expired
  attempt.autoSubmitIfExpired(attempt.exam.endTime);

  // Get all questions for grading
  const questionIds = attempt.answers.map((ans) => ans.question);
  const questions = await Question.find({ _id: { $in: questionIds } });

  const questionMap = {};
  questions.forEach((q) => {
    questionMap[q._id.toString()] = q;
  });

  // ========== ENHANCED AUTO-GRADING LOGIC ==========

  let totalScore = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let skippedCount = 0;

  attempt.answers.forEach((answer) => {
    const question = questionMap[answer.question.toString()];

    if (!question) return;

    // Check if answer is null/undefined (skipped)
    if (
      answer.selectedAnswer === null ||
      answer.selectedAnswer === undefined ||
      answer.selectedAnswer === ""
    ) {
      answer.isCorrect = false;
      answer.marksAwarded = 0;
      skippedCount++;
      return;
    }

    // Grade based on question type
    let isCorrect = false;

    switch (question.type) {
      case "single-correct":
      case "true-false":
        // Simple string comparison (case-insensitive)
        isCorrect =
          answer.selectedAnswer.toString().toLowerCase().trim() ===
          question.correctAnswer.toString().toLowerCase().trim();
        break;

      case "multiple-correct":
        // Compare arrays
        const studentAnswers = Array.isArray(answer.selectedAnswer)
          ? answer.selectedAnswer
          : [answer.selectedAnswer];

        const correctAnswers = Array.isArray(question.correctAnswer)
          ? question.correctAnswer
          : [question.correctAnswer];

        // Sort and compare
        const sortedStudent = studentAnswers
          .map((a) => a.toString().toLowerCase().trim())
          .sort();
        const sortedCorrect = correctAnswers
          .map((a) => a.toString().toLowerCase().trim())
          .sort();

        if (sortedStudent.length !== sortedCorrect.length) {
          isCorrect = false;
        } else {
          isCorrect = sortedStudent.every(
            (ans, idx) => ans === sortedCorrect[idx]
          );
        }

        // Partial marking for multiple-correct (if enabled)
        if (attempt.exam.settings.partialMarking && !isCorrect) {
          const correctSelections = sortedStudent.filter((a) =>
            sortedCorrect.includes(a)
          ).length;
          const incorrectSelections = sortedStudent.length - correctSelections;

          if (correctSelections > 0) {
            const partialPercentage =
              (correctSelections - incorrectSelections) / sortedCorrect.length;
            answer.marksAwarded = Math.max(
              0,
              partialPercentage * answer.maxMarks
            );
            totalScore += answer.marksAwarded;
            incorrectCount++;
            answer.isCorrect = false;
            return;
          }
        }
        break;

      default:
        isCorrect = false;
    }

    answer.isCorrect = isCorrect;

    if (isCorrect) {
      answer.marksAwarded = answer.maxMarks;
      totalScore += answer.maxMarks;
      correctCount++;
    } else {
      // Apply negative marking if enabled
      if (attempt.exam.settings?.negativeMarking) {
        const negativeMarks = attempt.exam.settings.negativeMarkingValue || 0;
        answer.marksAwarded = -negativeMarks;
        totalScore = Math.max(0, totalScore - negativeMarks);
      } else {
        answer.marksAwarded = 0;
      }
      incorrectCount++;
    }
  });

  // Update attempt with calculated results
  attempt.status = "submitted";
  attempt.passed = totalScore >= attempt.exam.passingMarks;

  await attempt.save();

  // Prepare result response with full details
  const result = {
    attemptId: attempt._id,
    student: {
      _id: attempt.student._id,
      fullName: attempt.student.fullName,
      email: attempt.student.email,
    },
    exam: {
      _id: attempt.exam._id,
      title: attempt.exam.title,
      subject: attempt.exam.subject,
      totalMarks: attempt.exam.totalMarks,
      passingMarks: attempt.exam.passingMarks,
    },
    status: attempt.status,
    score: attempt.score,
    totalMarks: attempt.totalMarks,
    percentage: attempt.percentage,
    grade: attempt.grade,
    passed: attempt.passed,
    correctAnswers: correctCount,
    incorrectAnswers: incorrectCount,
    skippedAnswers: skippedCount,
    timeSpent: attempt.timeSpent,
    timeTaken: attempt.timeSpent, // Alias for frontend
    submitTime: attempt.submitTime,
    completedAt: attempt.submitTime, // Alias for frontend
    startedAt: attempt.startTime,
  };

  // Include detailed answers if exam settings allow review
  if (attempt.exam.settings.allowReview) {
    result.answers = await Promise.all(
      attempt.answers.map(async (ans) => {
        const question = questionMap[ans.question.toString()];
        return {
          questionId: ans.question,
          question: {
            _id: question._id,
            questionText: question.questionText,
            type: question.type,
            options: question.options,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation,
            difficulty: question.difficulty,
          },
          answer: ans.selectedAnswer,
          isCorrect: ans.isCorrect,
          marks: ans.marksAwarded,
          maxMarks: ans.maxMarks,
        };
      })
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        result,
        `Exam ${result.passed ? "passed" : "failed"}! Your score: ${result.score}/${result.totalMarks}`
      )
    );
});

// ==================== GET ATTEMPT RESULT ====================

/**
 * @desc    Get attempt result
 * @route   GET /api/v1/attempts/:attemptId/result
 * @access  Private (Student - own attempts, Teacher - their exams)
 */
export const getAttemptResult = asyncHandler(async (req, res) => {
  const { attemptId } = req.params;

  const attempt = await ExamAttempt.findById(attemptId)
    .populate("exam", "title settings passingMarks")
    .populate("student", "username email")
    .populate("answers.question");

  if (!attempt) {
    throw new ApiError(404, "Attempt not found");
  }

  // Authorization check
  const isStudent = req.user._id.toString() === attempt.student._id.toString();
  const isTeacher =
    req.user.role === "teacher" &&
    attempt.exam.createdBy.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isStudent && !isTeacher && !isAdmin) {
    throw new ApiError(403, "Not authorized to view this result");
  }

  if (attempt.status === "in-progress") {
    throw new ApiError(400, "Exam is still in progress");
  }

  const result = {
    attemptId: attempt._id,
    examTitle: attempt.exam.title,
    student: attempt.student,
    status: attempt.status,
    score: attempt.score,
    totalMarks: attempt.totalMarks,
    percentage: attempt.percentage,
    grade: attempt.grade,
    passed: attempt.passed,
    timeSpent: attempt.timeSpent,
    submitTime: attempt.submitTime,
  };

  // Include detailed review if allowed
  if (attempt.exam.settings.allowReview || isTeacher || isAdmin) {
    result.answers = attempt.answers.map((ans) => ({
      questionId: ans.question._id,
      questionText: ans.question.questionText,
      type: ans.question.type,
      options: ans.question.options,
      selectedAnswer: ans.selectedAnswer,
      correctAnswer: ans.question.correctAnswer,
      isCorrect: ans.isCorrect,
      marksAwarded: ans.marksAwarded,
      maxMarks: ans.maxMarks,
      explanation: ans.question.explanation,
    }));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Result fetched successfully"));
});

// ==================== GET STUDENT ATTEMPTS ====================

/**
 * @desc    Get all attempts by student
 * @route   GET /api/v1/attempts/my-attempts
 * @access  Private (Student)
 */
export const getMyAttempts = asyncHandler(async (req, res) => {
  try {
    const attempts = await ExamAttempt.find({
      student: req.user._id,
      status: { $in: ["submitted", "auto-submitted"] },
    })
      .populate("exam", "title subject totalMarks")
      .sort({ createdAt: -1 })
      .lean(); // Add lean() for better performance

    // Return empty array if no attempts
    if (!attempts) {
      return res
        .status(200)
        .json(new ApiResponse(200, [], "No attempts found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, attempts, "Attempts fetched successfully"));
  } catch (error) {
    console.error("Error in getMyAttempts:", error);
    throw new ApiError(500, `Error fetching attempts: ${error.message}`);
  }
});
// ==================== GET EXAM ATTEMPTS (TEACHER) ====================

/**
 * @desc    Get all attempts for an exam (Teacher)
 * @route   GET /api/v1/attempts/exam/:examId
 * @access  Private (Teacher/Admin)
 */
export const getExamAttempts = asyncHandler(async (req, res) => {
  const { examId } = req.params;

  const exam = await Exam.findById(examId);

  if (!exam) {
    throw new ApiError(404, "Exam not found");
  }

  // Teachers can only view attempts for their exams
  if (
    req.user.role === "teacher" &&
    exam.createdBy.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "Not authorized");
  }

  const attempts = await ExamAttempt.find({ exam: examId })
    .populate("student", "username email rollNumber")
    .sort({ score: -1 });

  const stats = {
    totalAttempts: attempts.length,
    submitted: attempts.filter((a) => a.status !== "in-progress").length,
    inProgress: attempts.filter((a) => a.status === "in-progress").length,
    passed: attempts.filter((a) => a.passed).length,
    failed: attempts.filter((a) => !a.passed && a.status !== "in-progress")
      .length,
    averageScore:
      attempts.length > 0
        ? attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length
        : 0,
    averagePercentage:
      attempts.length > 0
        ? attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length
        : 0,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { attempts, stats },
        "Exam attempts fetched successfully"
      )
    );
});
// ==================== GET ATTEMPT STATISTICS ====================

/**
 * @desc    Get attempt statistics for student dashboard
 * @route   GET /api/v1/attempts/stats
 * @access  Private (Student)
 */
export const getAttemptStats = asyncHandler(async (req, res) => {
  console.log(
    "📊 Backend: Calculating attempt stats for student:",
    req.user._id
  );

  const attempts = await ExamAttempt.find({
    student: req.user._id,
    status: { $in: ["submitted", "auto-submitted"] },
  });

  const stats = {
    totalAttempts: attempts.length,
    passed: attempts.filter((a) => a.passed).length,
    failed: attempts.filter((a) => !a.passed).length,
    averageScore:
      attempts.length > 0
        ? (
            attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length
          ).toFixed(2)
        : 0,
    totalCorrectAnswers: attempts.reduce((sum, a) => {
      return sum + a.answers.filter((ans) => ans.isCorrect).length;
    }, 0),
    totalIncorrectAnswers: attempts.reduce((sum, a) => {
      return sum + a.answers.filter((ans) => !ans.isCorrect).length;
    }, 0),
  };

  console.log("✅ Backend: Stats calculated:", stats);

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Statistics fetched successfully"));
});
