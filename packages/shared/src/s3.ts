import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * AWS S3 client. May be used elsewhere in the application.
 */
export const s3Client = new S3Client({
  region: process.env.APP_AWS_REGION,
  credentials: {
    accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY || "",
  },
});

/**
 * 
 * @param key - The key to use for the file upload (typically a UUID, no file extension)
 * @param fileType - The file type e.g "application/pdf"
 * @returns 
 */
export const generateFileUploadUrl = async (key: string, fileType: string): Promise<string> => {

  const command = new PutObjectCommand({
    Bucket: process.env.APP_AWS_UPLOADS_BUCKET_NAME,
    Key: key,
    ContentType: fileType,
  });

  try {
    return await getSignedUrl(s3Client, command, { expiresIn: 300 });
  } catch (error) {
    console.error("generateFileUploadUrl: Error generating pre-signed URL", error);
    throw new Error("Error generating pre-signed URL");
  }
};
