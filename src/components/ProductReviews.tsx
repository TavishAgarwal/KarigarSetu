'use client';

import { useState, useEffect } from 'react';
import { Star, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth-context';
import { trackReviewSubmit } from '@/lib/analytics';

interface Review {
    id: string;
    rating: number;
    comment: string;
    buyerName: string;
    createdAt: string;
}

interface ProductReviewsProps {
    productId: string;
}

/**
 * Product review section with star ratings and comments.
 * Uses /api/reviews endpoints for CRUD operations.
 */
export default function ProductReviews({ productId }: ProductReviewsProps) {
    const { user, token } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    // Fetch reviews on mount
    useEffect(() => {
        async function fetchReviews() {
            try {
                const res = await fetch(`/api/reviews?productId=${productId}`);
                if (res.ok) {
                    const data = await res.json();
                    setReviews(data.reviews || []);
                }
            } catch (err) {
                console.error('Failed to load reviews:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchReviews();
    }, [productId]);

    const averageRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    const handleSubmit = async () => {
        if (!rating) {
            setError('Please select a rating');
            return;
        }
        if (!comment.trim()) {
            setError('Please write a review');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ productId, rating, comment: comment.trim() }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to submit review');
            }

            const data = await res.json();
            setReviews((prev) => [data.review, ...prev]);
            trackReviewSubmit(productId, rating);
            setRating(0);
            setComment('');
            setSubmitted(true);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900">Customer Reviews</h2>
                    <p className="text-sm text-gray-500">
                        {reviews.length > 0
                            ? `${reviews.length} review${reviews.length !== 1 ? 's' : ''} · ${averageRating.toFixed(1)} average`
                            : 'No reviews yet'}
                    </p>
                </div>
                {reviews.length > 0 && (
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`h-5 w-5 ${star <= Math.round(averageRating) ? 'text-amber-400 fill-current' : 'text-gray-200'}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Write a review */}
            {user && !submitted && (
                <div className="bg-gray-50 rounded-2xl p-5 mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Write a Review</h3>
                    <div className="flex items-center gap-1 mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                                className="p-0.5 transition-transform hover:scale-110"
                            >
                                <Star
                                    className={`h-6 w-6 transition-colors ${star <= (hoverRating || rating)
                                        ? 'text-amber-400 fill-current'
                                        : 'text-gray-300'
                                        }`}
                                />
                            </button>
                        ))}
                        {rating > 0 && (
                            <span className="ml-2 text-sm text-gray-500">
                                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                            </span>
                        )}
                    </div>
                    <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your experience with this product..."
                        className="mb-3 rounded-xl"
                        maxLength={500}
                    />
                    {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
                    <Button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            'Submit Review'
                        )}
                    </Button>
                </div>
            )}

            {submitted && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 text-center">
                    <p className="text-sm font-medium text-green-700">✓ Thank you for your review!</p>
                </div>
            )}

            {/* Review list */}
            {loading ? (
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="animate-pulse space-y-2">
                            <div className="h-4 bg-gray-100 rounded w-1/3" />
                            <div className="h-3 bg-gray-100 rounded w-2/3" />
                        </div>
                    ))}
                </div>
            ) : reviews.length > 0 ? (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-50 pb-4 last:border-0">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 bg-orange-100 rounded-full flex items-center justify-center">
                                        <span className="text-xs font-bold text-orange-600">
                                            {review.buyerName.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="text-sm font-medium text-gray-800">{review.buyerName}</span>
                                </div>
                                <div className="flex items-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`h-3.5 w-3.5 ${star <= review.rating ? 'text-amber-400 fill-current' : 'text-gray-200'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                            <p className="text-xs text-gray-400 mt-1">
                                {new Date(review.createdAt).toLocaleDateString('en-IN', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                })}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8">
                    <Star className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm text-gray-400">Be the first to review this product</p>
                </div>
            )}
        </div>
    );
}
