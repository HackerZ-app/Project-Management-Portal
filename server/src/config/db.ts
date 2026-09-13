import mongoose from 'mongoose';
import { ENV } from './env';
import { logger } from './logger';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(ENV.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true,
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    logger.error('Failed to connect to MongoDB Atlas:', error);
    if (ENV.IS_PRODUCTION) {
      process.exit(1);
    } else {
      logger.warn('Running in development mode without active MongoDB connection (endpoints requiring DB will fail until Mongo is available).');
    }
  }

  // Handle Mongoose lifecycle events
  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB connection lost. Attempting reconnect...');
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB reconnected successfully.');
  });

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error:', err);
  });
};

// Graceful disconnection helper
export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed cleanly.');
  } catch (error) {
    logger.error('Error during MongoDB disconnection:', error);
  }
};
