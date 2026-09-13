import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const ENV = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/academic_portal',
  JWT_SECRET: process.env.JWT_SECRET || 'srmap_academic_project_mgmt_jwt_secret_2026_key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  ALLOWED_EMAIL_DOMAIN: process.env.ALLOWED_EMAIL_DOMAIN || '@srmap.edu.in',
  ALLOWED_HOSTED_DOMAIN: process.env.ALLOWED_HOSTED_DOMAIN || 'srmap.edu.in',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
};
