import { Router } from 'express';
import healthRoutes from '@/routes/health.routes';
import authRoutes from '@/routes/auth.routes';
import userRoutes from '@/routes/user.routes';
import leadRoutes from '@/routes/lead.routes';
import taskRoutes from '@/routes/task.routes';
import emailRoutes from '@/routes/email.routes';
import boardRoutes from '@/routes/board.routes';
import clientRoutes from '@/routes/client.routes';

const router = Router();

router.use('/', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/leads', leadRoutes);
router.use('/tasks', taskRoutes);
router.use('/emails', emailRoutes);
router.use('/boards', boardRoutes);
router.use('/clients', clientRoutes);

export default router;