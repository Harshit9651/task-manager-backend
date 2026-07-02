
import { Router } from 'express';
import healthRoutes from '@/routes/health.routes';

const router = Router();

/**
 * Central API router.
 * Mount feature routers here as the project grows, e.g.:
 *   router.use('/auth', authRoutes);
 *   router.use('/leads', leadRoutes);
 *   router.use('/tasks', taskRoutes);
 */
router.use('/', healthRoutes);

export default router;