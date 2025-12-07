import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ExamAttempt } from '../models/examAttempt.model.js';
import { Exam } from '../models/exam.model.js';
import { Question } from '../models/question.model.js';


/**
 * @desc    Start exam attempt
 * @route   POST /api/v1/attempts/start/:examId
 * @access  Private (Student)
 */
export const startExam = asyncHandler(async (req, res) => {
    const { examId } = req.params;
    const studentId = req.user._id;

    const exam = await Exam.findById(examId).populate('questions.question');

    if (!exam) {
        throw new ApiError(404, "Exam not found");
    }

    if (!exam.isPublished) {
        throw new ApiError(400, "Exam is not published yet");
    }

    if (!exam.isCurrentlyActive()) {
        throw new ApiError(400, "Exam is not currently active");
    }

    if (!exam.canStudentAttempt(studentId)) {
        throw new ApiError(403, "You are not allowed to attempt this exam");
    }

    const existingAttempt = await ExamAttempt.findOne({ exam: examId, student: studentId });
    
    if (existingAttempt) {
        if (existingAttempt.status === 'in-progress') {
            return res.status(200).json(
                new ApiResponse(200, existingAttempt, "Exam attempt resumed")
            );
        } else {
            throw new ApiError(400, "You have already attempted this exam");
        }
    }

    const attempt = await ExamAttempt.create({
        exam: examId,
        student: studentId,
        totalMarks: exam.totalMarks,
        answers: exam.questions.map(q => ({
            question: q.question._id,
            selectedAnswer: null,
            maxMarks: q.marks
        })),
        metadata: {
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        }
    });

    const examData = {
        attemptId: attempt._id,
        examTitle: exam.title,
        duration: exam.duration,
        totalMarks: exam.totalMarks,
        instructions: exam.instructions,
        startTime: attempt.startTime,
        endTime: exam.endTime,
        questions: exam.questions.map(q => ({
            _id: q.question._id,
            type: q.question.type,
            questionText: q.question.questionText,
            options: q.question.options,
            marks: q.marks,
            order: q.order
        }))
    };

    if (exam.settings.shuffleQuestions) {
        examData.questions = examData.questions.sort(() => Math.random() - 0.5);
    }

    return res.status(201).json(
        new ApiResponse(201, examData, "Exam started successfully")
    );
});


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

    const attempt = await ExamAttempt.findById(attemptId).populate('exam');

    if (!attempt) {
        throw new ApiError(404, "Attempt not found");
    }

    if (attempt.student.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not authorized");
    }

    if (!attempt.isValid(attempt.exam.endTime)) {
        throw new ApiError(400, "Exam time has expired");
    }

    const answerIndex = attempt.answers.findIndex(
        ans => ans.question.toString() === questionId
    );

    if (answerIndex === -1) {
        throw new ApiError(404, "Question not found in this attempt");
    }

    attempt.answers[answerIndex].selectedAnswer = answer;
    await attempt.save();

    return res.status(200).json(
        new ApiResponse(200, { saved: true }, "Answer saved successfully")
    );
});


/**
 * @desc    Submit exam and calculate results
 * @route   POST /api/v1/attempts/:attemptId/submit
 * @access  Private (Student)
 */
export const submitExam = asyncHandler(async (req, res) => {
    const { attemptId } = req.params;

    const attempt = await ExamAttempt.findById(attemptId).populate('exam');

    if (!attempt) {
        throw new ApiError(404, "Attempt not found");
    }

    if (attempt.student.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not authorized");
    }

    if (attempt.status !== 'in-progress') {
        throw new ApiError(400, "Exam already submitted");
    }

    attempt.autoSubmitIfExpired(attempt.exam.endTime);

    const questionIds = attempt.answers.map(ans => ans.question);
    const questions = await Question.find({ _id: { $in: questionIds } });

    const questionMap = {};
    questions.forEach(q => {
        questionMap[q._id.toString()] = q;
    });

    const partialMarkingEnabled = attempt.exam.settings.partialMarking;

    attempt.answers.forEach(answer => {
        const question = questionMap[answer.question.toString()];
        
        if (!question) return;

        if (answer.selectedAnswer === null || answer.selectedAnswer === undefined) {
            answer.isCorrect = false;
            answer.marksAwarded = 0;
        } else {
            if (partialMarkingEnabled && question.type === 'multiple-correct') {
                answer.marksAwarded = question.calculatePartialMarks(
                    answer.selectedAnswer,
                    true
                );
                answer.isCorrect = answer.marksAwarded === answer.maxMarks;
            } else {
                answer.isCorrect = question.checkAnswer(answer.selectedAnswer);
                answer.marksAwarded = answer.isCorrect ? answer.maxMarks : 0;
            }
        }
    });

    attempt.passed = attempt.score >= attempt.exam.passingMarks;
    attempt.status = attempt.status === 'in-progress' ? 'submitted' : attempt.status;

    await attempt.save();

    const result = {
        attemptId: attempt._id,
        examTitle: attempt.exam.title,
        status: attempt.status,
        score: attempt.score,
        totalMarks: attempt.totalMarks,
        percentage: attempt.percentage,
        grade: attempt.grade,
        passed: attempt.passed,
        timeSpent: attempt.timeSpent,
        submitTime: attempt.submitTime
    };

    if (attempt.exam.settings.allowReview) {
        result.answers = await Promise.all(
            attempt.answers.map(async (ans) => {
                const question = questionMap[ans.question.toString()];
                return {
                    questionId: ans.question,
                    questionText: question.questionText,
                    type: question.type,
                    options: question.options,
                    selectedAnswer: ans.selectedAnswer,
                    correctAnswer: question.correctAnswer,
                    isCorrect: ans.isCorrect,
                    marksAwarded: ans.marksAwarded,
                    maxMarks: ans.maxMarks,
                    explanation: question.explanation
                };
            })
        );
    }

    return res.status(200).json(
        new ApiResponse(200, result, "Exam submitted successfully")
    );
});


/**
 * @desc    Get attempt result
 * @route   GET /api/v1/attempts/:attemptId/result
 * @access  Private (Student - own attempts, Teacher - their exams)
 */
export const getAttemptResult = asyncHandler(async (req, res) => {
    const { attemptId } = req.params;

    const attempt = await ExamAttempt.findById(attemptId)
        .populate('exam', 'title settings passingMarks')
        .populate('student', 'username email')
        .populate('answers.question');

    if (!attempt) {
        throw new ApiError(404, "Attempt not found");
    }

    const isStudent = req.user._id.toString() === attempt.student._id.toString();
    const isTeacher = req.user.role === 'teacher' && attempt.exam.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isStudent && !isTeacher && !isAdmin) {
        throw new ApiError(403, "Not authorized to view this result");
    }

    if (attempt.status === 'in-progress') {
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
        submitTime: attempt.submitTime
    };

    if (attempt.exam.settings.allowReview || isTeacher || isAdmin) {
        result.answers = attempt.answers.map(ans => ({
            questionId: ans.question._id,
            questionText: ans.question.questionText,
            type: ans.question.type,
            options: ans.question.options,
            selectedAnswer: ans.selectedAnswer,
            correctAnswer: ans.question.correctAnswer,
            isCorrect: ans.isCorrect,
            marksAwarded: ans.marksAwarded,
            maxMarks: ans.maxMarks,
            explanation: ans.question.explanation
        }));
    }

    return res.status(200).json(
        new ApiResponse(200, result, "Result fetched successfully")
    );
});


/**
 * @desc    Get all attempts by student
 * @route   GET /api/v1/attempts/my-attempts
 * @access  Private (Student)
 */
export const getMyAttempts = asyncHandler(async (req, res) => {
    try {
        const attempts = await ExamAttempt.find({ 
            student: req.user._id,
            status: { $in: ['submitted', 'auto-submitted'] }
        })
        .populate('exam', 'title subject totalMarks')
        .sort({ createdAt: -1 })
        .lean(); 
        if (!attempts) {
            return res.status(200).json(
                new ApiResponse(200, [], "No attempts found")
            );
        }

        return res.status(200).json(
            new ApiResponse(200, attempts, "Attempts fetched successfully")
        );
    } catch (error) {
        console.error('Error in getMyAttempts:', error);
        throw new ApiError(500, `Error fetching attempts: ${error.message}`);
    }
});

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

    
    if (req.user.role === 'teacher' && exam.createdBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not authorized");
    }

    const attempts = await ExamAttempt.find({ exam: examId })
        .populate('student', 'username email rollNumber')
        .sort({ score: -1 });

    const stats = {
        totalAttempts: attempts.length,
        submitted: attempts.filter(a => a.status !== 'in-progress').length,
        inProgress: attempts.filter(a => a.status === 'in-progress').length,
        passed: attempts.filter(a => a.passed).length,
        failed: attempts.filter(a => !a.passed && a.status !== 'in-progress').length,
        averageScore: attempts.length > 0 
            ? attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length 
            : 0,
        averagePercentage: attempts.length > 0
            ? attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length
            : 0
    };

    return res.status(200).json(
        new ApiResponse(
            200,
            { attempts, stats },
            "Exam attempts fetched successfully"
        )
    );
});
