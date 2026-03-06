/**
 * Image upload utility with cascading backends:
 * 1. Google Cloud Storage (if GCS_BUCKET_NAME configured)
 * 2. Cloudinary (if CLOUDINARY_CLOUD_NAME configured)
 * 3. Local filesystem (always available as fallback)
 */
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { isCloudStorageEnabled } from './featureFlags';

// ─── Local file upload (always-available fallback) ─────────────────────────

export async function uploadImageLocal(file: File): Promise<string> {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    const filepath = path.join(uploadsDir, filename);

    await writeFile(filepath, buffer);

    return `/uploads/${filename}`;
}

// ─── Cloudinary upload ─────────────────────────────────────────────────────

export async function uploadImageCloudinary(file: File): Promise<string> {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
        throw new Error('Cloudinary not configured');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'karigarsetu');

    const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData }
    );

    if (!res.ok) throw new Error('Cloudinary upload failed');
    const data = await res.json();
    return data.secure_url;
}

// ─── Google Cloud Storage upload ───────────────────────────────────────────

async function uploadImageGCS(file: File): Promise<string> {
    const { uploadToGCS } = await import('./cloudStorage');
    return uploadToGCS(file, 'products');
}

// ─── Cascading upload: GCS → Cloudinary → Local ───────────────────────────

export async function uploadImage(file: File): Promise<string> {
    // Priority 1: Google Cloud Storage
    if (isCloudStorageEnabled()) {
        try {
            return await uploadImageGCS(file);
        } catch (error) {
            console.warn('[Upload] GCS upload failed, trying fallback:', error);
        }
    }

    // Priority 2: Cloudinary
    if (process.env.CLOUDINARY_CLOUD_NAME) {
        try {
            return await uploadImageCloudinary(file);
        } catch (error) {
            console.warn('[Upload] Cloudinary upload failed, trying local:', error);
        }
    }

    // Priority 3: Local filesystem
    return uploadImageLocal(file);
}
