// routes/examAttempt.routes.js
import { Router } from 'express';
import {
    startExam,
    saveAnswer,
    submitExam,
    getAttemptResult,
    getMyAttempts,
    getExamAttempts
} from '../controllers/examAttempt.controller.js';
import { verifyJWT, authorize } from '../middleware/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Student routes
router.post('/start/:examId', authorize('student'), startExam);
router.post('/:attemptId/answer', authorize('student'), saveAnswer);
router.post('/:attemptId/submit', authorize('student'), submitExam);
router.get('/my-attempts', authorize('student'), getMyAttempts);

// Shared routes (student sees own, teacher sees their exam attempts)
router.get('/:attemptId/result', getAttemptResult);

// Teacher/Admin routes
router.get('/exam/:examId', authorize('teacher', 'admin'), getExamAttempts);

export default router;
