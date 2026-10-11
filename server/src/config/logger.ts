import winston from 'winston';
import path from 'path';
import { ENV } from './env';

const { combine, timestamp, printf, colorize, json } = winston.format;

// Custom console log format
const consoleFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

export const logger = winston.createLogger({
  level: ENV.IS_PRODUCTION ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true })
  ),
  transports: [
    // Console output with color formatting
    new winston.transports.Console({
      format: combine(
        colorize(),
        consoleFormat
      ),
    }),
  ],
});

// Create stream for Morgan integration
export const morganStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};
