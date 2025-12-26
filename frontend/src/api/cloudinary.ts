/**
 * Utility functions for uploading images to Cloudinary
 */

interface CloudinaryUploadResponse {
  secure_url: string;
  url: string;
  public_id: string;
  [key: string]: any;
}

/**
 * Upload a single image to Cloudinary
 * @param file - The image file to upload
 * @returns Promise resolving to the secure URL of the uploaded image
 */
export const uploadImageToCloudinary = async (
  file: File
): Promise<string> => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Cloudinary configuration missing. Please check VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET environment variables.'
    );
  }

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const formData = new FormData();

  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to upload image to Cloudinary: ${response.status} ${errorText}`
      );
    }

    const data: CloudinaryUploadResponse = await response.json();
    return data.secure_url || data.url;
  } catch (error: any) {
    console.error('Error uploading image to Cloudinary:', error);
    throw new Error(
      error.message || 'Failed to upload image to Cloudinary. Please try again.'
    );
  }
};

/**
 * Upload multiple images to Cloudinary
 * @param files - Array of image files to upload
 * @returns Promise resolving to an array of secure URLs
 */
export const uploadMultipleImagesToCloudinary = async (
  files: File[]
): Promise<string[]> => {
  try {
    const uploadPromises = files.map((file) => uploadImageToCloudinary(file));
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error: any) {
    console.error('Error uploading multiple images to Cloudinary:', error);
    throw new Error(
      error.message || 'Failed to upload images to Cloudinary. Please try again.'
    );
  }
};




