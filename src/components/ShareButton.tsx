'use client';

import { useState } from 'react';
import { Share2, Check, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackShare } from '@/lib/analytics';

interface ShareButtonProps {
    title: string;
    text: string;
    url?: string;
    className?: string;
}

/**
 * Share button that uses the native Web Share API (mobile)
 * or falls back to copying the URL to clipboard (desktop).
 */
export default function ShareButton({ title, text, url, className }: ShareButtonProps) {
    const [copied, setCopied] = useState(false);

    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

    const handleShare = async () => {
        // Try native share (works on mobile, some desktop browsers)
        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share({ title, text, url: shareUrl });
                trackShare(title, 'native');
                return;
            } catch (err) {
                // User cancelled or share failed — fall through to clipboard
                if ((err as Error).name === 'AbortError') return;
            }
        }

        // Fallback: copy to clipboard
        try {
            await navigator.clipboard.writeText(shareUrl);
            trackShare(title, 'clipboard');
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Final fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = shareUrl;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <Button
            variant="outline"
            onClick={handleShare}
            aria-label={copied ? 'Link copied' : 'Share this product'}
            className={`transition-all ${copied
                ? 'border-green-500 text-green-600 bg-green-50'
                : 'border-gray-200 hover:border-orange-300 text-gray-700'
                } ${className || ''}`}
        >
            {copied ? (
                <>
                    <Check className="h-4 w-4 mr-1.5" />
                    Copied!
                </>
            ) : (
                <>
                    <Share2 className="h-4 w-4 mr-1.5" />
                    Share
                </>
            )}
        </Button>
    );
}

/**
 * Compact share icon button for use inside cards.
 */
export function ShareIconButton({ title, text, url }: ShareButtonProps) {
    const [copied, setCopied] = useState(false);
    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

    const handleShare = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share({ title, text, url: shareUrl });
                return;
            } catch (err) {
                if ((err as Error).name === 'AbortError') return;
            }
        }

        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // silent fail
        }
    };

    return (
        <button
            onClick={handleShare}
            aria-label={copied ? 'Link copied' : 'Share this product'}
            className="w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all shadow-sm"
        >
            {copied ? (
                <Check className="h-4 w-4 text-green-500" />
            ) : (
                <LinkIcon className="h-4 w-4 text-gray-500" />
            )}
        </button>
    );
}
