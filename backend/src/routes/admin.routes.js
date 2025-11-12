// routes/admin.routes.js
import { Router } from 'express';
import {
    getUsers,
    getUser,
    updateUser,
    deleteUser,
    getUserStats
} from '../controllers/user.controller.js';
import { verifyJWT, authorize } from '../middleware/auth.middleware.js';

const router = Router();

// All admin routes require authentication + admin role
router.use(verifyJWT);
router.use(authorize('admin'));

// User management routes
router.route('/users')
    .get(getUsers);  // GET /api/v1/admin/users?page=1&limit=25&role=student&search=john

router.route('/users/:id')
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser);

// Statistics
router.get('/stats', getUserStats);

export default router;
