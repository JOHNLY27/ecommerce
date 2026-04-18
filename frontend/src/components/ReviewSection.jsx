import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Star, ThumbsUp, Check, Camera, X, ChevronDown } from 'lucide-react';

const StarRating = ({ rating, size = 20, interactive = false, onChange }) => {
    const [hoverRating, setHoverRating] = useState(0);

    return (
        <div style={{ display: 'flex', gap: '2px' }}>
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={size}
                    style={{
                        cursor: interactive ? 'pointer' : 'default',
                        fill: star <= (hoverRating || rating) ? '#ffc107' : 'transparent',
                        stroke: star <= (hoverRating || rating) ? '#ffc107' : '#ddd',
                        transition: 'all 0.15s'
                    }}
                    onMouseEnter={interactive ? () => setHoverRating(star) : undefined}
                    onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
                    onClick={interactive && onChange ? () => onChange(star) : undefined}
                />
            ))}
        </div>
    );
};

const ReviewSection = ({ productId }) => {
    const { user } = useContext(AuthContext);
    const [reviews, setReviews] = useState([]);
    const [summary, setSummary] = useState({ average: 0, total: 0, distribution: {} });
    const [loading, setLoading] = useState(true);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [canReview, setCanReview] = useState({ can_review: false, has_reviewed: false, is_verified_purchase: false });
    
    // Form state
    const [rating, setRating] = useState(5);
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    
    // Filters
    const [filterRating, setFilterRating] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [verifiedOnly, setVerifiedOnly] = useState(false);
    const [withImages, setWithImages] = useState(false);

    useEffect(() => {
        fetchReviews();
        if (user) {
            checkCanReview();
        }
    }, [productId, filterRating, sortBy, verifiedOnly, withImages, user]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterRating) params.append('rating', filterRating);
            if (sortBy) params.append('sort_by', sortBy);
            if (verifiedOnly) params.append('verified_only', true);
            if (withImages) params.append('with_images', true);

            const res = await axios.get(`/products/${productId}/reviews?${params.toString()}`);
            setReviews(res.data.reviews.data || []);
            setSummary(res.data.summary);
        } catch (err) {
            console.error('Error fetching reviews', err);
        }
        setLoading(false);
    };

    const checkCanReview = async () => {
        try {
            const res = await axios.get(`/products/${productId}/can-review`);
            setCanReview(res.data);
        } catch (err) {
            console.error('Error checking review status', err);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!user) {
            alert('Please login to submit a review');
            return;
        }

        if (comment.length < 10) {
            alert('Review must be at least 10 characters');
            return;
        }

        setSubmitting(true);
        try {
            await axios.post(`/products/${productId}/reviews`, {
                rating,
                title,
                comment,
            });
            alert('Review submitted successfully!');
            setShowReviewForm(false);
            setRating(5);
            setTitle('');
            setComment('');
            fetchReviews();
            checkCanReview();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to submit review');
        }
        setSubmitting(false);
    };

    const handleMarkHelpful = async (reviewId) => {
        try {
            await axios.post(`/products/${productId}/reviews/${reviewId}/helpful`);
            fetchReviews();
        } catch (err) {
            console.error('Error marking helpful', err);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div style={{ marginTop: '3rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Customer Reviews</h2>

            {/* Rating Summary */}
            <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center', minWidth: '150px' }}>
                    <div style={{ fontSize: '3rem', fontWeight: 700 }}>{summary.average}</div>
                    <StarRating rating={Math.round(summary.average)} size={24} />
                    <div style={{ color: '#666', marginTop: '0.5rem' }}>{summary.total} reviews</div>
                </div>

                {/* Rating Distribution */}
                <div style={{ flex: 1, minWidth: '200px' }}>
                    {[5, 4, 3, 2, 1].map((star) => {
                        const dist = summary.distribution[star] || { count: 0, percentage: 0 };
                        return (
                            <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                <span style={{ width: '12px', fontSize: '0.85rem' }}>{star}</span>
                                <Star size={12} style={{ fill: '#ffc107', stroke: '#ffc107' }} />
                                <div style={{ flex: 1, height: '8px', background: '#e9ecef', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ width: `${dist.percentage}%`, height: '100%', background: '#ffc107' }} />
                                </div>
                                <span style={{ width: '40px', fontSize: '0.85rem', color: '#666' }}>{dist.count}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Write Review Button */}
                <div style={{ minWidth: '200px' }}>
                    {user && !canReview.has_reviewed && (
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowReviewForm(true)}
                            style={{ width: '100%' }}
                        >
                            Write a Review
                        </button>
                    )}
                    {canReview.has_reviewed && (
                        <div style={{ padding: '0.75rem', background: '#d4edda', borderRadius: '8px', color: '#155724' }}>
                            <Check size={16} style={{ marginRight: '0.5rem' }} />
                            You've reviewed this product
                        </div>
                    )}
                    {!user && (
                        <div style={{ padding: '0.75rem', background: '#f8f9fa', borderRadius: '8px', color: '#666' }}>
                            <a href="/login" style={{ color: '#007bff' }}>Login</a> to write a review
                        </div>
                    )}
                </div>
            </div>

            {/* Review Form Modal */}
            {showReviewForm && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem'
                }}>
                    <div style={{
                        background: 'white', borderRadius: '12px', padding: '2rem',
                        width: '100%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0 }}>Write a Review</h3>
                            <button onClick={() => setShowReviewForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        {canReview.is_verified_purchase && (
                            <div style={{ padding: '0.75rem', background: '#d4edda', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Check size={16} color="#155724" />
                                <span style={{ color: '#155724' }}>Verified Purchase</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmitReview}>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label className="form-label">Rating</label>
                                <div style={{ marginTop: '0.5rem' }}>
                                    <StarRating rating={rating} size={32} interactive onChange={setRating} />
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label className="form-label">Title (optional)</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Summarize your review"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    maxLength={255}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label className="form-label">Review *</label>
                                <textarea
                                    className="form-control"
                                    rows={5}
                                    placeholder="Share your experience with this product..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    required
                                    minLength={10}
                                    maxLength={2000}
                                />
                                <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                                    {comment.length}/2000 characters (minimum 10)
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="button" className="btn btn-outline" onClick={() => setShowReviewForm(false)} style={{ flex: 1 }}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={submitting || comment.length < 10} style={{ flex: 1 }}>
                                    {submitting ? 'Submitting...' : 'Submit Review'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                <select
                    value={filterRating}
                    onChange={(e) => setFilterRating(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                >
                    <option value="">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                </select>

                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="highest">Highest Rated</option>
                    <option value="lowest">Lowest Rated</option>
                    <option value="helpful">Most Helpful</option>
                </select>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        checked={verifiedOnly}
                        onChange={(e) => setVerifiedOnly(e.target.checked)}
                    />
                    Verified Only
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        checked={withImages}
                        onChange={(e) => setWithImages(e.target.checked)}
                    />
                    With Images
                </label>
            </div>

            {/* Reviews List */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading reviews...</div>
            ) : reviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                    No reviews yet. Be the first to review this product!
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {reviews.map((review) => (
                        <div key={review.id} style={{ padding: '1.5rem', border: '1px solid #e9ecef', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <strong>{review.user?.name || 'Anonymous'}</strong>
                                        {review.is_verified_purchase && (
                                            <span style={{
                                                display: 'flex', alignItems: 'center', gap: '0.25rem',
                                                fontSize: '0.75rem', color: '#155724', background: '#d4edda',
                                                padding: '0.25rem 0.5rem', borderRadius: '4px'
                                            }}>
                                                <Check size={12} /> Verified Purchase
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                                        <StarRating rating={review.rating} size={14} />
                                        <span style={{ fontSize: '0.85rem', color: '#666' }}>{formatDate(review.created_at)}</span>
                                    </div>
                                </div>
                            </div>

                            {review.title && (
                                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>{review.title}</h4>
                            )}

                            <p style={{ margin: '0 0 1rem 0', color: '#333', lineHeight: '1.6' }}>{review.comment}</p>

                            {/* Review Images */}
                            {review.images && review.images.length > 0 && (
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                    {review.images.map((img, idx) => (
                                        <img
                                            key={idx}
                                            src={img}
                                            alt={`Review image ${idx + 1}`}
                                            style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer' }}
                                        />
                                    ))}
                                </div>
                            )}

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <button
                                    onClick={() => handleMarkHelpful(review.id)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        background: 'none', border: '1px solid #ddd', padding: '0.5rem 1rem',
                                        borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem'
                                    }}
                                >
                                    <ThumbsUp size={14} /> Helpful ({review.helpful_count})
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReviewSection;
