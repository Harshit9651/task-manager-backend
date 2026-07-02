import express, { type Application, type Request, type Response } from 'express';
import cors, { type CorsOptions } from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { config } from '@/config';
import { apiLimiter } from '@/middleware/rateLimiter';
import { errorHandler, notFoundHandler } from '@/middleware/errorHandler';
import routes from '@/routes';

const app: Application = express();

app.set('trust proxy', 1);


app.use(helmet());

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (config.cors.origins.includes('*') || config.cors.origins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS: origin "${origin}" is not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(config.cookie.secret));


app.use(morgan(config.isProduction ? 'combined' : 'dev'));

app.use(config.apiPrefix, apiLimiter);


app.use(config.apiPrefix, routes);


app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'SaaS CRM API is running' });
});


app.use(notFoundHandler);
app.use(errorHandler);

export default app;