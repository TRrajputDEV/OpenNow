// routes/question.routes.js
import { Router } from 'express';
import {
    createQuestion,
    getQuestions,
    getQuestion,
    updateQuestion,
    deleteQuestion,
    getQuestionStats
} from '../controllers/question.controller.js';
import { verifyJWT, authorize } from '../middleware/auth.middleware.js';

const router = Router();

// All routes require authentication and teacher/admin role
router.use(verifyJWT);
router.use(authorize('teacher', 'admin'));

// Question CRUD
router.route('/')
    .get(getQuestions)
    .post(createQuestion);

router.get('/stats', getQuestionStats);

router.route('/:id')
    .get(getQuestion)
    .put(updateQuestion)
    .delete(deleteQuestion);

export default router;
