import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "./env";

export interface StoredImage {
  key: string;
  url: string;
}

function isStorageEnabled(): boolean {
  return env.STORAGE_ENABLED === "true";
}

function createS3Client(): S3Client {
  return new S3Client({
    endpoint: env.STORAGE_ENDPOINT,
    region: env.STORAGE_REGION,
    forcePathStyle: true,
    credentials: {
      accessKeyId: env.STORAGE_ACCESS_KEY,
      secretAccessKey: env.STORAGE_SECRET_KEY,
    },
  });
}

/**
 * Uploads an image to S3-compatible storage under
 * `subjects/{subjectId}/image.{ext}`. Returns null when storage is disabled
 * or the upload fails, so callers fall back to the original URL.
 */
export async function storeImage(
  subjectId: string,
  imageBuffer: Buffer,
  contentType: string,
  extension: string,
): Promise<StoredImage | null> {
  if (!isStorageEnabled()) return null;
  const key = `subjects/${subjectId}/image.${extension}`;
  try {
    const client = createS3Client();
    await client.send(
      new PutObjectCommand({
        Bucket: env.STORAGE_BUCKET,
        Key: key,
        Body: imageBuffer,
        ContentType: contentType,
      }),
    );
    return { key, url: `${env.STORAGE_PUBLIC_BASE_URL}/${key}` };
  } catch (error) {
    console.warn(`[storage] Failed to store image for subject ${subjectId}:`, error);
    return null;
  }
}
