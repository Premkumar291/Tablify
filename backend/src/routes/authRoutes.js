import express from 'express';
import { register, login, refreshToken, generateApiKey, getApiKeys } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);

// Protected Routes
router.post('/api-keys', protect, generateApiKey);
router.get('/api-keys', protect, getApiKeys);

export default router;
