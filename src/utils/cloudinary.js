import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configure Cloudinary with the credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    // If no file path is provided, return null
    if (!localFilePath) return null;

    // Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto', // Automatically detect the file type
    });

    // If the file was uploaded successfully, check if the local file exists
    if (fs.existsSync(localFilePath)) {
      // If it exists, delete the local file to free up space
      fs.unlinkSync(localFilePath);
    } else {
      // Log a warning if the file was not found
      console.warn(`File not found: ${localFilePath}`);
    }

    // Return the Cloudinary response which contains details about the uploaded file
    return response;

  } catch (error) {
    // In case of an error during the upload process, check if the local file exists
    if (fs.existsSync(localFilePath)) {
      // If it exists, delete the local file to clean up
      fs.unlinkSync(localFilePath);
    } else {
      // Log a warning if the file was not found
      console.warn(`File not found: ${localFilePath}`);
    }

    // Log the error that occurred during the upload process
    console.error('Error uploading to Cloudinary:', error);
    // Return null to indicate the upload failed
    return null;
  }
};

export { uploadOnCloudinary };
