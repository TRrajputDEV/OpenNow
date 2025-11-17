// routes/exam.routes.js
import { Router } from 'express';
import {
    createExam,
    getExams,
    getExam,
    updateExam,
    publishExam,
    unpublishExam,
    deleteExam,
    getExamStats
} from '../controllers/exam.controller.js';
import { verifyJWT, authorize } from '../middleware/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Stats route (teachers/admin)
router.get('/stats/overview', authorize('teacher', 'admin'), getExamStats);

// Exam CRUD
router.route('/')
    .get(getExams) // All authenticated users
    .post(authorize('teacher', 'admin'), createExam);

router.route('/:id')
    .get(getExam) // All authenticated users (with role-based filtering)
    .put(authorize('teacher', 'admin'), updateExam)
    .delete(authorize('teacher', 'admin'), deleteExam);

// Publish/Unpublish
router.patch('/:id/publish', authorize('teacher', 'admin'), publishExam);
router.patch('/:id/unpublish', authorize('teacher', 'admin'), unpublishExam);

export default router;
