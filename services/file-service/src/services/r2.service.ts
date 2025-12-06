import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { logger } from '@project-scope-analyzer/shared';

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_ENDPOINT = process.env.AWS_ENDPOINT;
const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const AWS_REGION = process.env.AWS_REGION || 'auto';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_ENDPOINT || !AWS_BUCKET_NAME) {
    logger.warn('R2 credentials not configured. File uploads will not work.');
}

const s3Client = AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY && AWS_ENDPOINT
    ? new S3Client({
        region: AWS_REGION,
        endpoint: AWS_ENDPOINT,
        credentials: {
            accessKeyId: AWS_ACCESS_KEY_ID,
            secretAccessKey: AWS_SECRET_ACCESS_KEY,
        },
    })
    : null;

export interface UploadFileResult {
    key: string;
    url: string;
}

export class R2Service {
    /**
     * Upload a file to Cloudflare R2
     */
    async uploadFile(
        file: Buffer,
        fileName: string,
        contentType: string,
        folder: string = 'uploads'
    ): Promise<UploadFileResult> {
        if (!s3Client || !AWS_BUCKET_NAME) {
            throw new Error('R2 storage is not configured');
        }

        const timestamp = Date.now();
        const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        const key = `${folder}/${timestamp}_${sanitizedFileName}`;

        try {
            const command = new PutObjectCommand({
                Bucket: AWS_BUCKET_NAME,
                Key: key,
                Body: file,
                ContentType: contentType,
            });

            await s3Client.send(command);

            const url = R2_PUBLIC_URL ? `${R2_PUBLIC_URL}/${key}` : key;

            logger.info('File uploaded to R2', { key, size: file.length });
            return { key, url };
        } catch (error: any) {
            logger.error('Error uploading file to R2', { error: error.message });
            throw new Error(`Failed to upload file: ${error.message}`);
        }
    }

    /**
     * Delete a file from Cloudflare R2
     */
    async deleteFile(key: string): Promise<void> {
        if (!s3Client || !AWS_BUCKET_NAME) {
            throw new Error('R2 storage is not configured');
        }

        try {
            const command = new DeleteObjectCommand({
                Bucket: AWS_BUCKET_NAME,
                Key: key,
            });

            await s3Client.send(command);
            logger.info('File deleted from R2', { key });
        } catch (error: any) {
            logger.error('Error deleting file from R2', { error: error.message, key });
            throw new Error(`Failed to delete file: ${error.message}`);
        }
    }

    /**
     * Generate a signed URL for downloading a file
     */
    async getSignedUrl(
        key: string,
        expiresIn: number = 3600,
        filename?: string
    ): Promise<string> {
        if (!s3Client || !AWS_BUCKET_NAME) {
            throw new Error('R2 storage is not configured');
        }

        try {
            const downloadFilename = filename || key.split('/').pop() || 'download';

            const command = new GetObjectCommand({
                Bucket: AWS_BUCKET_NAME,
                Key: key,
                ResponseContentDisposition: `attachment; filename="${downloadFilename}"`,
            });

            const url = await getSignedUrl(s3Client, command, { expiresIn });
            return url;
        } catch (error: any) {
            logger.error('Error generating signed URL', { error: error.message, key });
            throw new Error(`Failed to generate download URL: ${error.message}`);
        }
    }

    /**
     * Get public URL for a file
     */
    getPublicUrl(key: string): string | null {
        if (!R2_PUBLIC_URL) {
            return null;
        }
        return `${R2_PUBLIC_URL}/${key}`;
    }
}

export const r2Service = new R2Service();
