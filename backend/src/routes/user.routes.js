// routes/user.routes.js
import { Router } from 'express';
import {
    getCurrentUser,
    updateAccountDetails,
    changeCurrentPassword,
    updateProfile,      // ← ADD THIS
    changePassword,     // ← ADD THIS
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

// Profile update route (for fullName, email)
router.patch('/profile', updateProfile);  // ← ADD THIS

// Password change routes
router.post('/change-password', changeCurrentPassword);
router.post('/password', changePassword);  // ← ADD THIS (alternative endpoint)

// Get specific user by ID
router.get('/:id', getUser);

export default router;
