'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import Image from 'next/image';

interface UploadWidgetProps {
    onUpload: (url: string) => void;
    currentImage?: string;
    /** Optional callback to capture the raw File before upload (for offline storage) */
    onFileSelected?: (file: File) => void;
}

export default function UploadWidget({ onUpload, currentImage, onFileSelected }: UploadWidgetProps) {
    const { token } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentImage || null);
    const [dragOver, setDragOver] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        if (!file) return;

        // Notify parent about the raw file (for offline storage)
        onFileSelected?.(file);

        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(file);

        // Upload
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/upload', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                onUpload(data.imageUrl);
            }
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const clearImage = () => {
        setPreview(null);
        onUpload('');
    };

    return (
        <div
            className={`relative border-2 border-dashed rounded-2xl transition-all ${dragOver
                ? 'border-orange-500 bg-orange-50'
                : preview
                    ? 'border-gray-200 bg-gray-50'
                    : 'border-orange-300 bg-orange-50/50'
                }`}
            onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
        >
            <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
            />

            {preview ? (
                <div className="relative aspect-[4/3]">
                    <Image
                        src={preview}
                        alt="Preview"
                        fill
                        className="object-cover rounded-2xl"
                    />
                    <button
                        onClick={clearImage}
                        className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                    {uploading && (
                        <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">
                            <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 px-6">
                    <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mb-4">
                        <Camera className="h-7 w-7 text-white" />
                    </div>
                    <p className="font-semibold text-gray-900 mb-1">Tap to Open Camera</p>
                    <p className="text-sm text-gray-500 mb-4">You can add up to 5 photos</p>
                    <Button
                        variant="outline"
                        onClick={() => fileRef.current?.click()}
                        className="border-orange-500 text-orange-600 hover:bg-orange-50 rounded-lg"
                        disabled={uploading}
                    >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose from Gallery
                    </Button>
                </div>
            )}
        </div>
    );
}
