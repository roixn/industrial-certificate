import { Router } from 'express';
import {
  login,
  logout,
  getMe,
  requestAdminOtp,
  verifyOtpAndRegister,
  getAdminsList,
  toggleAdminStatus,
} from '../controllers/authController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import { loginSchema } from '../utils/validators.js';

const router = Router();

// Public auth routes
router.post('/login', loginLimiter, validate(loginSchema), login);
router.post('/request-otp', requestAdminOtp);
router.post('/verify-otp-register', verifyOtpAndRegister);

// Authenticated session routes
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

// Superadmin user management routes
router.get('/admins', authenticate, requireRole('superadmin'), getAdminsList);
router.patch('/admins/:id/toggle-status', authenticate, requireRole('superadmin'), toggleAdminStatus);

export default router;
