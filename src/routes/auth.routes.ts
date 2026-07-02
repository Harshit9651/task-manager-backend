import { Router } from 'express';
import { authController } from '@/controllers/auth.controller';
import { authenticate } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import { authLimiter } from '@/middleware/rateLimiter';
import { googleLoginValidator } from '@/validators/auth.validator';

const router = Router();


router.post('/google', authLimiter, validate(googleLoginValidator), authController.googleLogin);
router.post('/refresh', authController.refresh);


router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);

export default router;