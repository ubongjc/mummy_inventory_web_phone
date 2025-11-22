// Cloudinary configuration and utilities

import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

/**
 * Upload an image to Cloudinary
 * @param base64Image - Base64 encoded image string
 * @param folder - Folder in Cloudinary to upload to
 * @returns Cloudinary URL of uploaded image
 */
export async function uploadImage(
  base64Image: string,
  folder: string = 'rental-items'
): Promise<string> {
  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder,
      resource_type: 'image',
      transformation: [
        { width: 800, height: 800, crop: 'limit' }, // Max 800x800
        { quality: 'auto' }, // Auto quality optimization
        { fetch_format: 'auto' }, // Auto format (WebP when supported)
      ],
    });

    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image');
  }
}

/**
 * Delete an image from Cloudinary
 * @param imageUrl - Cloudinary URL of image to delete
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    // Extract public_id from Cloudinary URL
    // Format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{folder}/{public_id}.{format}
    const parts = imageUrl.split('/');
    const fileWithExt = parts[parts.length - 1];
    const fileName = fileWithExt.split('.')[0];
    const folder = parts[parts.length - 2];
    const publicId = `${folder}/${fileName}`;

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    // Don't throw - deletion failure shouldn't block other operations
  }
}
