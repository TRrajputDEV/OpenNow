// routes/index.js
import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import adminRoutes from './admin.routes.js';
import questionRoutes from './question.routes.js';
import examRoutes from './exam.routes.js';

const router = Router();

router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);
router.use('/questions', questionRoutes);
router.use('/exams', examRoutes);

export default router;
