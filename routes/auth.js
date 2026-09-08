import express from 'express';
import {
  login,
  requestPasswordReset,
  verifyOtp,
  resetPassword,
  getCurrentStudent,
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/forgot-password', requestPasswordReset);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
router.get('/me', requireAuth, getCurrentStudent);

export default router;
