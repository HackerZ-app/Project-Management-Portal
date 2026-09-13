import { Request, Response, NextFunction } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import path from 'path';
import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary.config';
import { AppError } from './error.middleware';
import { logger } from '../config/logger';

// Permitted extensions and MIME types
const ALLOWED_EXTENSIONS = new Set(['.pdf', '.docx', '.zip']);
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/zip',
  'application/x-zip-compressed',
  'multipart/x-zip',
  'application/octet-stream', // checked alongside extension for .zip/.docx
]);

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  const ext = path.extname(file.originalname).toLowerCase();

  // Validate extension strictly
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return cb(
      new AppError(
        `Invalid file type '${ext}'. Only .pdf, .docx, and .zip files up to 10MB are permitted.`,
        400
      )
    );
  }

  // Validate MIME type
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(
      new AppError(
        `Invalid MIME type '${file.mimetype}'. Only .pdf, .docx, and .zip files are permitted.`,
        400
      )
    );
  }

  cb(null, true);
};

// 1. Live Cloudinary Storage (used when credentials are valid)
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (_req, file) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const basename = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e6)}`;
    const publicId = `submissions/${basename}_${uniqueSuffix}`;

    return {
      folder: 'academic_portal',
      public_id: publicId,
      resource_type: 'raw',
      format: ext.replace('.', ''),
    };
  },
});

// 2. Memory Storage (used for offline dev / automated testing)
const memoryStorage = multer.memoryStorage();

// Select storage engine based on environment and credentials
const storageEngine = isCloudinaryConfigured() ? cloudinaryStorage : memoryStorage;

// Safeguard 3: Enforce 10MB limit at Multer layer BEFORE streaming to Cloudinary
const multerUploader = multer({
  storage: storageEngine,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 Megabytes limit
    files: 1,
  },
  fileFilter,
});

/**
 * Express middleware wrapper for handling single file uploads with error normalization
 */
export const uploadSubmissionFile = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  multerUploader.single('file')(req, res, (err: any) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(
            new AppError('File size exceeds the 10MB maximum limit.', 400)
          );
        }
        return next(new AppError(`File upload error: ${err.message}`, 400));
      }
      return next(err);
    }

    if (req.file) {
      // If memory storage was used (in tests or unconfigured dev), generate deterministic mock metadata
      if (!isCloudinaryConfigured() || !req.file.path) {
        const ext = path.extname(req.file.originalname).toLowerCase();
        const basename = path
          .basename(req.file.originalname, ext)
          .replace(/[^a-zA-Z0-9_-]/g, '_');
        const uniqueId = `mock_${Date.now()}_${Math.round(Math.random() * 1e5)}`;
        const publicId = `academic_portal/submissions/${basename}_${uniqueId}`;
        const mockUrl = `https://res.cloudinary.com/demo/raw/upload/v1720000000/${publicId}${ext}`;

        req.file.path = mockUrl;
        (req.file as any).filename = publicId;
      }
    }

    next();
  });
};
