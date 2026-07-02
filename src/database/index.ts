import mongoose from 'mongoose';
import { config } from '@/config';
import { logger } from '@/utils/logger';

mongoose.set('strictQuery', true);

mongoose.connection.on('connected', () => logger.debug('Mongoose connection established.'));
mongoose.connection.on('error', (error) => logger.error('Mongoose connection error:', error));
mongoose.connection.on('disconnected', () => logger.warn('Mongoose connection lost.'));

export const connectDatabase = async (): Promise<void> => {
  const conn = await mongoose.connect(config.mongo.uri, {
    autoIndex: !config.isProduction, 
    serverSelectionTimeoutMS: 10_000,
  });
  logger.info(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed.');
};