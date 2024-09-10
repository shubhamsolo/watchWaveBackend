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
    if (!localFilePath) return null; // If no file path is provided, return null

    // Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'video', // Ensure the resource type is set to 'video'
    });

    // Log the response for debugging purposes
    console.log('Cloudinary upload response:', response);

    // Generate a thumbnail URL from the uploaded video
    const thumbnailUrl = cloudinary.url(`${response.public_id}.jpg`, {
      transformation: [
        { width: 200, height: 200, crop: 'limit' }, // Thumbnail size
      ],
      resource_type: 'video', // Ensure resource_type is set to 'video'
      secure: true, // Use HTTPS for the URL
    });

    console.log('Thumbnail URL:', thumbnailUrl); // Log the thumbnail URL

    // Check if the local file exists before attempting to delete it
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath); // Delete the local file to free up space
    } else {
      console.warn(`File not found: ${localFilePath}`); // Log a warning if the file was not found
    }

    return { response, thumbnailUrl }; // Return the Cloudinary response and thumbnail URL
  } catch (error) {
    // Check if the local file exists before attempting to delete it
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath); // Delete the local file to clean up
    } else {
      console.warn(`File not found: ${localFilePath}`); // Log a warning if the file was not found
    }

    // Log the error that occurred during the upload process
    console.error('Error uploading to Cloudinary:', error);
    return null; // Return null to indicate the upload failed
  }
};

export { uploadOnCloudinary };
