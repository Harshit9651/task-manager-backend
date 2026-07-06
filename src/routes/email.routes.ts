import { Router } from 'express';
import { body } from 'express-validator';
import { emailController } from '@/controllers/email.controller';
import { authenticate } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import { authLimiter } from '@/middleware/rateLimiter';

const router = Router();
router.use(authenticate);

const preferencesValidator = [
  body('dailyFollowUpReminder').optional().isBoolean().withMessage('must be a boolean'),
  body('weeklyReport').optional().isBoolean().withMessage('must be a boolean'),
  body('timezone').optional().isString().trim().isLength({ min: 1, max: 64 }),
];

router.get('/preferences', emailController.getPreferences);
router.patch('/preferences', validate(preferencesValidator), emailController.updatePreferences);

router.post('/test/welcome', authLimiter, emailController.testWelcome);
router.post('/test/daily-reminder', authLimiter, emailController.testDailyReminder);
router.post('/test/weekly-report', authLimiter, emailController.testWeeklyReport);

export default router;