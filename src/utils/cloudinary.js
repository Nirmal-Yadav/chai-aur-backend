import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name: process_params.env.CLOUDINARY_CLOUD_NAME,
  api_key: process_params.env.CLOUDINARY_API_KEY,
  api_secret: process_params.env.CLOUDINARY_API_SECRET, // Click 'View Credentials' below to copy your API secret
});

const uploadOnCLoudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // upload file on cloudinary

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log(response, "response");
    // file has been uploaded successfully
    return response;
    console.log("file uploaded on cloudinary");
  } catch (error) {
    fs.unlinkSync(localFilePath);
    // remove the locally saved temporary file as teh upload operation got failed
    return null;
  }
};
