import { Router } from 'express';
import { userController } from '@/controllers/user.controller';
import { authenticate } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import { updateNotificationValidator } from '@/validators/user.validator';

const router = Router();

router.use(authenticate);

router.get('/profile', userController.getProfile);
router.patch(
  '/toggle_notification',
  validate(updateNotificationValidator),
  userController.updateNotificationPreferences,
);

export default router;