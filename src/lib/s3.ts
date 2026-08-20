import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const region = process.env.AWS_REGION || "ap-south-1";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || "";
export const bucketName = process.env.AWS_S3_BUCKET_NAME || "";

export const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

/**
 * Upload a buffer or file directly to S3
 */
export async function uploadToS3(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  if (!bucketName) {
    throw new Error("AWS_S3_BUCKET_NAME is not configured in environment variables.");
  }

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await s3Client.send(command);

  // Return the public URL
  return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
}

/**
 * Generate a presigned URL for direct client-to-S3 upload
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 300
): Promise<{ uploadUrl: string; fileUrl: string }> {
  if (!bucketName) {
    throw new Error("AWS_S3_BUCKET_NAME is not configured in environment variables.");
  }

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn });
  const fileUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;

  return { uploadUrl, fileUrl };
}

/**
 * Delete an object from S3
 */
export async function deleteFromS3(key: string): Promise<void> {
  if (!bucketName) return;

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  await s3Client.send(command);
}
