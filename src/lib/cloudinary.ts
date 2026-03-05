import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// Local file upload fallback when Cloudinary is not configured
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

// Cloudinary upload (when configured)
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

export async function uploadImage(file: File): Promise<string> {
    // Use Cloudinary if configured, otherwise local
    if (process.env.CLOUDINARY_CLOUD_NAME) {
        return uploadImageCloudinary(file);
    }
    return uploadImageLocal(file);
}
