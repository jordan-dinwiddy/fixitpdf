import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { createWriteStream, promises as fs } from 'fs';
import { stat } from 'fs/promises';
import { pipeline } from 'stream';
import { promisify } from 'util';

const pipelineAsync = promisify(pipeline);

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

/**
 * Downloads a file from S3 and saves it directly to a file on the local filesystem.
 * 
 * @param bucket The S3 bucket name
 * @param key The S3 file key
 * @param downloadPath The path on the filesystem to save the file
 */
export const downloadFile = async (key: string, downloadPath: string): Promise<void> => {
  const command = new GetObjectCommand({ Bucket: process.env.APP_AWS_UPLOADS_BUCKET_NAME, Key: key });
  const { Body } = await s3Client.send(command);

  if (!Body) {
    throw new Error(`Failed to download file: ${key}`);
  }

  // Use a writable stream to save the file directly to the file system
  const writeStream = createWriteStream(downloadPath);

  // Pipe the S3 object body to the file
  await pipelineAsync(Body as NodeJS.ReadableStream, writeStream);
}

/**
 * Upload a file to S3.
 * 
 * @param key 
 * @param filePath 
 */
export const uploadFile = async (key: string, filePath: string): Promise<void> => {
  const fileContent = await fs.readFile(filePath);

  const command = new PutObjectCommand({
    Bucket: process.env.APP_AWS_UPLOADS_BUCKET_NAME,
    Key: key,
    Body: fileContent,
  });

  await s3Client.send(command);
};

/**
 * Gets the file size in bytes for the given file path.
 * 
 * @param filePath The path to the file
 * @returns The file size in bytes
 */
export const getFileSize = async (filePath: string): Promise<number> => {
  const stats = await stat(filePath);
  return stats.size;
}


