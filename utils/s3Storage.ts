import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Readable } from 'stream';

// Access environment variables directly via process.env
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Ensure the bucket name env var is defined
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
if (!BUCKET_NAME) {
  throw new Error("AWS_S3_BUCKET_NAME environment variable is not set.");
}

/**
 * Uploads a file to the S3 bucket.
 * @param key - The key (path/filename) for the object in the bucket.
 * @param body - The file content (Buffer, string, etc.).
 * @param contentType - The MIME type of the file.
 * @returns The result of the PutObjectCommand.
 */
export const uploadFileToS3 = async (key: string, body: Buffer | string, contentType: string) => {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  try {
    const response = await s3Client.send(command);
    console.log("Successfully uploaded file to S3:", key);
    return response;
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw new Error("Failed to upload file to S3");
  }
};

/**
 * Generates a presigned URL for downloading a file from S3.
 * @param key - The key of the object in the bucket.
 * @param expiresIn - The duration (in seconds) for which the URL is valid (default: 3600).
 * @returns The presigned URL.
 */
export const getPresignedS3Url = async (key: string, expiresIn: number = 3600) => {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  try {
    const url = await getSignedUrl(s3Client, command, { expiresIn });
    console.log("Successfully generated presigned URL for:", key);
    return url;
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    throw new Error("Failed to generate presigned URL");
  }
};

/**
 * Deletes a file from the S3 bucket.
 * @param key - The key of the object to delete.
 * @returns The result of the DeleteObjectCommand.
 */
export const deleteFileFromS3 = async (key: string) => {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  try {
    const response = await s3Client.send(command);
    console.log("Successfully deleted file from S3:", key);
    return response;
  } catch (error) {
    console.error("Error deleting file from S3:", error);
    throw new Error("Failed to delete file from S3");
  }
};

/**
 * Downloads a file directly from S3 as a Buffer.
 * @param key The key of the object in the bucket.
 * @returns Promise resolving to a Buffer with the file content.
 */
export const downloadS3FileAsBuffer = async (key: string): Promise<Buffer> => {
    if (!BUCKET_NAME) {
        console.error("S3 bucket name not configured.");
        throw new Error("S3 storage is not configured.");
    }
    const command = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key });
    console.log(`Attempting to download file from S3: ${key}`);
    try {
        const response = await s3Client.send(command);
        if (!response.Body) {
            throw new Error('S3 response body is empty');
        }
        const stream = response.Body as Readable;
        const chunks: Buffer[] = [];
        for await (const chunk of stream) {
            chunks.push(Buffer.from(chunk));
        }
        console.log(`Successfully downloaded file: ${key}, size: ${Buffer.concat(chunks).length} bytes`);
        return Buffer.concat(chunks);
    } catch (error: unknown) {
        console.error(`Error downloading file ${key} from S3:`, error);
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to download file from S3: ${message}`);
    }
}; 