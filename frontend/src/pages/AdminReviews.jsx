import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Star, Check, X, ThumbsUp, Search, Filter, Trash2, Star as StarIcon, Award } from 'lucide-react';

const AdminReviews = () => {
    const { user, loading } = useContext(AuthContext);
    const navigate = useNavigate();

    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, verified: 0, average_rating: 0 });
    const [loadingReviews, setLoadingReviews] = useState(true);
    
    // Filters
    const [statusFilter, setStatusFilter] = useState('');
    const [ratingFilter, setRatingFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [verifiedOnly, setVerifiedOnly] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (!user) return navigate('/login');
            if (!user.is_admin) return navigate('/');
            fetchReviews();
        }
    }, [user, loading, navigate, statusFilter, ratingFilter, searchQuery, verifiedOnly]);

    const fetchReviews = async () => {
        setLoadingReviews(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter) params.append('status', statusFilter);
            if (ratingFilter) params.append('rating', ratingFilter);
            if (searchQuery) params.append('search', searchQuery);
            if (verifiedOnly) params.append('verified_only', true);

            const res = await axios.get(`/admin/reviews?${params.toString()}`);
            setReviews(res.data.reviews.data || []);
            setStats(res.data.stats);
        } catch (err) {
            console.error('Error fetching reviews', err);
        }
        setLoadingReviews(false);
    };

    const handleApprove = async (id) => {
        try {
            await axios.post(`/admin/reviews/${id}/approve`);
            fetchReviews();
        } catch (err) {
            alert('Failed to approve review');
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Are you sure you want to reject this review?')) return;
        try {
            await axios.post(`/admin/reviews/${id}/reject`);
            fetchReviews();
        } catch (err) {
            alert('Failed to reject review');
        }
    };

    const handleToggleFeatured = async (id) => {
        try {
            await axios.post(`/admin/reviews/${id}/feature`);
            fetchReviews();
        } catch (err) {
            alert('Failed to toggle featured status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to permanently delete this review?')) return;
        try {
            await axios.delete(`/admin/reviews/${id}`);
            fetchReviews();
        } catch (err) {
            alert('Failed to delete review');
        }
    };

    const handleBulkApprove = async () => {
        const pendingReviews = reviews.filter(r => !r.is_approved);
        if (pendingReviews.length === 0) {
            alert('No pending reviews to approve');
            return;
        }
        if (!window.confirm(`Approve ${pendingReviews.length} pending reviews?`)) return;
        
        try {
            await axios.post('/admin/reviews/bulk-approve', {
                ids: pendingReviews.map(r => r.id)
            });
            fetchReviews();
        } catch (err) {
            alert('Failed to bulk approve reviews');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const StarRating = ({ rating }) => (
        <div style={{ display: 'flex', gap: '1px' }}>
            {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                    key={star}
                    size={14}
                    style={{
                        fill: star <= rating ? '#ffc107' : 'transparent',
                        stroke: star <= rating ? '#ffc107' : '#ddd',
                    }}
                />
            ))}
        </div>
    );

    if (loading || !user) return <div className="loading">Loading...</div>;

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Review Moderation</h1>
                <Link to="/admin" className="btn btn-outline">Back to Dashboard</Link>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px', borderLeft: '4px solid #007bff' }}>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>Total Reviews</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.total}</div>
                </div>
                <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px', borderLeft: '4px solid #ffc107' }}>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>Pending</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: stats.pending > 0 ? '#ffc107' : '#28a745' }}>{stats.pending}</div>
                </div>
                <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px', borderLeft: '4px solid #28a745' }}>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>Approved</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.approved}</div>
                </div>
                <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px', borderLeft: '4px solid #6f42c1' }}>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>Verified</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.verified}</div>
                </div>
                <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px', borderLeft: '4px solid #17a2b8' }}>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>Avg Rating</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.average_rating} / 5</div>
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                    <input
                        type="text"
                        placeholder="Search by product, user, or content..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem 0.75rem 0.5rem 2.25rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                </select>
                <select
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                >
                    <option value="">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                </select>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        checked={verifiedOnly}
                        onChange={(e) => setVerifiedOnly(e.target.checked)}
                    />
                    Verified Only
                </label>
                {stats.pending > 0 && (
                    <button className="btn btn-primary" onClick={handleBulkApprove}>
                        Approve All Pending ({stats.pending})
                    </button>
                )}
            </div>

            {/* Reviews Table */}
            {loadingReviews ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading reviews...</div>
            ) : reviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>No reviews found.</div>
            ) : (
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>User</th>
                                <th>Rating</th>
                                <th>Review</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reviews.map((review) => (
                                <tr key={review.id} style={{ opacity: review.is_approved ? 1 : 0.7 }}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <img
                                                src={review.product?.image_url || 'https://via.placeholder.com/40'}
                                                alt={review.product?.name}
                                                style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
                                            />
                                            <div>
                                                <strong>{review.product?.name}</strong>
                                                <div style={{ fontSize: '0.75rem', color: '#666' }}>{review.product?.category?.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div>
                                            <strong>{review.user?.name}</strong>
                                            <div style={{ fontSize: '0.75rem', color: '#666' }}>{review.user?.email}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <StarRating rating={review.rating} />
                                    </td>
                                    <td style={{ maxWidth: '300px' }}>
                                        {review.title && <strong style={{ display: 'block', marginBottom: '0.25rem' }}>{review.title}</strong>}
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#333', lineHeight: '1.4' }}>
                                            {review.comment.length > 150 ? review.comment.substring(0, 150) + '...' : review.comment}
                                        </p>
                                        {review.images && review.images.length > 0 && (
                                            <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.5rem' }}>
                                                {review.images.slice(0, 3).map((img, idx) => (
                                                    <img key={idx} src={img} alt="" style={{ width: 30, height: 30, objectFit: 'cover', borderRadius: 2 }} />
                                                ))}
                                                {review.images.length > 3 && <span style={{ fontSize: '0.75rem', color: '#666' }}>+{review.images.length - 3}</span>}
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                textAlign: 'center',
                                                background: review.is_approved ? '#d4edda' : '#fff3cd',
                                                color: review.is_approved ? '#155724' : '#856404',
                                            }}>
                                                {review.is_approved ? 'Approved' : 'Pending'}
                                            </span>
                                            {review.is_verified_purchase && (
                                                <span style={{
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem',
                                                    textAlign: 'center',
                                                    background: '#cce5ff',
                                                    color: '#004085',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.25rem'
                                                }}>
                                                    <Check size={12} /> Verified
                                                </span>
                                            )}
                                            {review.is_featured && (
                                                <span style={{
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem',
                                                    textAlign: 'center',
                                                    background: '#fff3cd',
                                                    color: '#856404',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.25rem'
                                                }}>
                                                    <Award size={12} /> Featured
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div>{formatDate(review.created_at)}</div>
                                        {review.helpful_count > 0 && (
                                            <div style={{ fontSize: '0.75rem', color: '#666', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <ThumbsUp size={12} /> {review.helpful_count}
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                            {!review.is_approved && (
                                                <button
                                                    className="btn btn-outline text-sm"
                                                    onClick={() => handleApprove(review.id)}
                                                    style={{ padding: '0.25rem 0.5rem', color: '#28a745', borderColor: '#28a745' }}
                                                >
                                                    <Check size={14} /> Approve
                                                </button>
                                            )}
                                            {review.is_approved && (
                                                <button
                                                    className="btn btn-outline text-sm"
                                                    onClick={() => handleReject(review.id)}
                                                    style={{ padding: '0.25rem 0.5rem', color: '#ffc107', borderColor: '#ffc107' }}
                                                >
                                                    <X size={14} /> Reject
                                                </button>
                                            )}
                                            <button
                                                className="btn btn-outline text-sm"
                                                onClick={() => handleToggleFeatured(review.id)}
                                                style={{ padding: '0.25rem 0.5rem', color: review.is_featured ? '#856404' : '#6f42c1', borderColor: review.is_featured ? '#856404' : '#6f42c1' }}
                                            >
                                                <Award size={14} /> {review.is_featured ? 'Unfeature' : 'Feature'}
                                            </button>
                                            <button
                                                className="btn btn-outline text-sm"
                                                onClick={() => handleDelete(review.id)}
                                                style={{ padding: '0.25rem 0.5rem', color: '#dc3545', borderColor: '#dc3545' }}
                                            >
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminReviews;
