// routes/user.routes.js
import { Router } from 'express';
import {
    getCurrentUser,
    updateAccountDetails,
    changeCurrentPassword,
    getUser
} from '../controllers/user.controller.js';
import { verifyJWT, authorize } from '../middleware/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Current user routes
router.route('/me')
    .get(getCurrentUser)
    .patch(updateAccountDetails);

router.post('/change-password', changeCurrentPassword);

// Get specific user by ID (students can only view self, teachers can view students, admin can view all)
router.get('/:id', getUser);

export default router;
