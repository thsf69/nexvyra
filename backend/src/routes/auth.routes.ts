import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, getMe, logout } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validate';
import { registerSchema, loginSchema } from '../schemas/auth.schema';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Apply stricter rate limiting to auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per IP
  message: 'Too many authentication attempts, please try again later'
});

router.post('/register', authLimiter, validateRequest(registerSchema), register);
router.post('/login', authLimiter, validateRequest(loginSchema), login);
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, getMe);

export default router;
