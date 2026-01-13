import express from 'express';
import { getUsers, getUserStats, revokeUserKeys, updateUserPlan } from '../controllers/adminController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Middleware to check if admin
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        res.status(403).json({ error: 'Not authorized as admin' });
    }
};

router.use(protect);
router.use(admin);

router.get('/users', getUsers);
router.get('/stats', getUserStats);
router.post('/revoke-keys', revokeUserKeys);
router.post('/update-plan', updateUserPlan);

export default router;
