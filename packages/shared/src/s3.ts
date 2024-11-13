import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuid } from "uuid";

const s3Client = new S3Client({
  region: process.env.APP_AWS_REGION,
  credentials: {
    accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY || "",
  },
});

interface GenerateFileUploadUrlResult {
  url: string;
  key: string;
}

const generateFileUploadUrl = async (fileType: string): Promise<GenerateFileUploadUrlResult> => {
  const uniqueFileName = `${uuid()}.pdf`;

  const command = new PutObjectCommand({
    Bucket: process.env.APP_AWS_UPLOADS_BUCKET_NAME,
    Key: uniqueFileName,
    ContentType: fileType,
  });

  try {
    const url = await getSignedUrl(s3Client, command, { expiresIn: 300 });
    return { url, key: uniqueFileName };
  } catch (error) {
    console.error("generateFileUploadUrl: Error generating pre-signed URL", error);
    throw new Error("Error generating pre-signed URL");
  }
};

export { s3Client, generateFileUploadUrl, GenerateFileUploadUrlResult};

