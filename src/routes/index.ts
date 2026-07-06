import { Router } from 'express';
import healthRoutes from '@/routes/health.routes';
import authRoutes from '@/routes/auth.routes';
import leadRoutes from '@/routes/lead.routes';
import taskRoutes from '@/routes/task.routes';

const router = Router();

router.use('/', healthRoutes);
router.use('/auth', authRoutes);
router.use('/leads', leadRoutes);
router.use('/tasks', taskRoutes);


export default router;