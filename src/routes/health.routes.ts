import { Router, type Request, type Response } from 'express';
import mongoose from 'mongoose';
import { config } from '@/config';

const router = Router();

const DB_STATES: Record<number, string> = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};


router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    data: {
      status: 'ok',
      environment: config.env,
      uptime: `${Math.floor(process.uptime())}s`,
      timestamp: new Date().toISOString(),
      database: DB_STATES[mongoose.connection.readyState] ?? 'unknown',
    },
  });
});

export default router;