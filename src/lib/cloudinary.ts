// Cloudinary configuration
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// Validate configuration
if (!CLOUD_NAME || !API_KEY || !UPLOAD_PRESET) {
  throw new Error('Missing required Cloudinary configuration');
}

export const uploadImage = async (file: File): Promise<string> => {
  try {
    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Invalid file type. Please upload an image.');
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File too large. Maximum size is 10MB.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('api_key', API_KEY);
    formData.append('folder', 'blog-images');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `Upload failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.secure_url) {
      throw new Error('No URL received from Cloudinary');
    }

    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error instanceof Error ? error : new Error('Failed to upload image');
  }
};

export const getPublicIdFromUrl = (url: string): string | null => {
  try {
    if (!url) return null;

    // Extract public ID from Cloudinary URL
    const matches = url.match(/\/v\d+\/(?:blog-images\/)?([^/]+?)(?:\.[^.]+)?$/);
    if (!matches) {
      console.warn('Could not extract public ID from URL:', url);
      return null;
    }

    return matches[1];
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
};

// Helper function to validate Cloudinary configuration
export const validateCloudinaryConfig = (): boolean => {
  const requiredVars = {
    'Cloud Name': CLOUD_NAME,
    'API Key': API_KEY,
    'Upload Preset': UPLOAD_PRESET
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.error('Missing Cloudinary configuration:', missingVars.join(', '));
    return false;
  }

  return true;
};