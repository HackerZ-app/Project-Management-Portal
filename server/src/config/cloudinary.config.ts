import { v2 as cloudinary } from 'cloudinary';
import { ENV } from './env';
import { logger } from './logger';

// Configure Cloudinary SDK
cloudinary.config({
  cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
  api_key: ENV.CLOUDINARY_API_KEY,
  api_secret: ENV.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Checks if live Cloudinary credentials are fully provided
 */
export const isCloudinaryConfigured = (): boolean => {
  return Boolean(
    ENV.CLOUDINARY_CLOUD_NAME &&
      ENV.CLOUDINARY_API_KEY &&
      ENV.CLOUDINARY_API_SECRET &&
      !ENV.CLOUDINARY_API_KEY.startsWith('mock_') &&
      !ENV.CLOUDINARY_CLOUD_NAME.startsWith('demo_')
  );
};

/**
 * Safeguard: Programmatically destroys Cloudinary asset to prevent storage leaks
 */
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  if (!publicId || !isCloudinaryConfigured()) {
    logger.info(`[Cloudinary] Skipped asset deletion for publicId: ${publicId} (mock or unconfigured)`);
    return;
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'raw',
    });
    logger.info(`[Cloudinary] Asset ${publicId} destroyed successfully. Result: ${JSON.stringify(result)}`);
  } catch (error) {
    logger.error(`[Cloudinary Error] Failed to destroy asset ${publicId}:`, error);
  }
};

export default cloudinary;
