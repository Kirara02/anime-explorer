// Cloudinary service for image upload using REST API with signed uploads
import CryptoJS from 'crypto-js';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_BASE_FOLDER } from '@env';

const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

// Generate signature for signed upload
const generateSignature = (timestamp: number, folder?: string): string => {
  let signatureString = `folder=${folder}&timestamp=${timestamp}`;
  return CryptoJS.SHA1(signatureString + CLOUDINARY_API_SECRET).toString();
};

export interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  created_at: string;
}

export const uploadImageToCloudinary = async (imageUri: string): Promise<string> => {
  try {
    // Generate timestamp and signature for signed upload
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = `${CLOUDINARY_BASE_FOLDER}/profile_images`;
    const signature = generateSignature(timestamp, folder);

    // Prepare form data
    const formData = new FormData();

    // Get file name and type from URI
    const fileName = imageUri.split('/').pop() || 'image';
    const fileType = fileName.split('.').pop() || 'jpg';

    formData.append('file', {
      uri: imageUri,
      type: `image/${fileType}`,
      name: fileName,
    } as any);

    formData.append('folder', folder);
    formData.append('timestamp', timestamp.toString());
    formData.append('api_key', CLOUDINARY_API_KEY);
    formData.append('signature', signature);

    // Upload using fetch API
    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    const data: CloudinaryUploadResponse = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};