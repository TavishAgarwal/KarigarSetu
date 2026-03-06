/**
 * Google Cloud Storage helper for media uploads.
 * Replaces local/Cloudinary image storage with GCS buckets.
 *
 * Features:
 * - Upload files to GCS with public URLs
 * - Generate signed upload URLs for secure client-side uploads
 * - Auto-optimize images before upload via sharp
 *
 * SERVER-SIDE ONLY.
 */
import { Storage } from '@google-cloud/storage';
import { getGoogleCloudConfig } from './googleCloud';

let storageInstance: Storage | null = null;

function getStorage(): Storage {
    if (storageInstance) return storageInstance;

    const config = getGoogleCloudConfig();

    if (config) {
        storageInstance = new Storage({
            projectId: config.projectId,
            credentials: {
                client_email: config.clientEmail,
                private_key: config.privateKey,
            },
        });
    } else {
        // Uses Application Default Credentials
        storageInstance = new Storage();
    }

    return storageInstance;
}

function getBucketName(): string {
    const bucketName = process.env.GCS_BUCKET_NAME;
    if (!bucketName) {
        throw new Error('GCS_BUCKET_NAME environment variable is not set.');
    }
    return bucketName;
}

/**
 * Optimize an image before upload using sharp.
 * Converts to WebP, resizes to max dimensions, and compresses.
 */
async function optimizeImage(
    buffer: Buffer,
    options: { maxWidth?: number; maxHeight?: number; quality?: number } = {}
): Promise<{ buffer: Buffer; mimeType: string }> {
    const { maxWidth = 1920, maxHeight = 1920, quality = 80 } = options;

    try {
        // Dynamic import to avoid issues when sharp is not available
        const sharp = (await import('sharp')).default;

        const optimized = await sharp(buffer)
            .resize(maxWidth, maxHeight, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality })
            .toBuffer();

        return { buffer: optimized, mimeType: 'image/webp' };
    } catch (error) {
        console.warn('[CloudStorage] sharp optimization failed, uploading original:', error);
        return { buffer, mimeType: 'image/jpeg' };
    }
}

/**
 * Upload a file to Google Cloud Storage.
 * Returns the public URL of the uploaded file.
 */
export async function uploadToGCS(
    file: File,
    folder: string = 'products'
): Promise<string> {
    const storage = getStorage();
    const bucketName = getBucketName();
    const bucket = storage.bucket(bucketName);

    // Read file into buffer
    const arrayBuffer = await file.arrayBuffer();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let buffer: any = Buffer.from(new Uint8Array(arrayBuffer));
    let mimeType = file.type;

    // Optimize images before upload
    const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (imageTypes.includes(file.type)) {
        const optimized = await optimizeImage(buffer);
        buffer = optimized.buffer;
        mimeType = optimized.mimeType;
    }

    // Generate a unique filename
    const ext = mimeType === 'image/webp' ? 'webp' : file.name.split('.').pop() || 'jpg';
    const filename = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

    const blob = bucket.file(filename);
    const stream = blob.createWriteStream({
        resumable: false,
        contentType: mimeType,
        metadata: {
            cacheControl: 'public, max-age=31536000',
        },
    });

    return new Promise((resolve, reject) => {
        stream.on('error', (err) => {
            console.error('[CloudStorage] Upload error:', err);
            reject(err);
        });

        stream.on('finish', async () => {
            try {
                // Make the file publicly readable
                await blob.makePublic();
                const publicUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;
                resolve(publicUrl);
            } catch (err) {
                console.error('[CloudStorage] Make public error:', err);
                reject(err);
            }
        });

        stream.end(buffer);
    });
}

/**
 * Generate a signed URL for secure client-side uploads.
 * The client can use this URL to upload directly to GCS.
 */
export async function getSignedUploadUrl(
    filename: string,
    contentType: string,
    folder: string = 'products'
): Promise<{ uploadUrl: string; publicUrl: string }> {
    const storage = getStorage();
    const bucketName = getBucketName();
    const bucket = storage.bucket(bucketName);

    const fullPath = `${folder}/${Date.now()}-${filename}`;
    const file = bucket.file(fullPath);

    const [url] = await file.getSignedUrl({
        version: 'v4',
        action: 'write',
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
        contentType,
    });

    return {
        uploadUrl: url,
        publicUrl: `https://storage.googleapis.com/${bucketName}/${fullPath}`,
    };
}

/**
 * Delete a file from GCS by its public URL.
 */
export async function deleteFromGCS(publicUrl: string): Promise<void> {
    const storage = getStorage();
    const bucketName = getBucketName();

    const prefix = `https://storage.googleapis.com/${bucketName}/`;
    if (!publicUrl.startsWith(prefix)) return;

    const filename = publicUrl.replace(prefix, '');
    const bucket = storage.bucket(bucketName);

    try {
        await bucket.file(filename).delete();
    } catch (error) {
        console.error('[CloudStorage] Delete error:', error);
    }
}
