import { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Star, CheckCircle, X } from 'lucide-react';

const StarRating = ({ rating, size = 24, interactive = false, onChange }) => {
    const [hoverRating, setHoverRating] = useState(0);
    
    return (
        <div style={{ display: 'flex', gap: '4px' }}>
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={size}
                    style={{
                        cursor: interactive ? 'pointer' : 'default',
                        fill: star <= (hoverRating || rating) ? '#ffc107' : 'transparent',
                        stroke: star <= (hoverRating || rating) ? '#ffc107' : '#ddd',
                        transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={interactive ? () => setHoverRating(star) : undefined}
                    onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
                    onClick={interactive && onChange ? () => onChange(star) : undefined}
                />
            ))}
        </div>
    );
};

const ReviewModal = ({ isOpen, onClose, products, orderId, onReviewSubmitted }) => {
    const [currentProductIndex, setCurrentProductIndex] = useState(0);
    const [reviews, setReviews] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submittedReviews, setSubmittedReviews] = useState([]);

    const currentProduct = products[currentProductIndex];

    const updateReview = (field, value) => {
        setReviews(prev => ({
            ...prev,
            [currentProduct.id]: {
                ...prev[currentProduct.id],
                [field]: value
            }
        }));
    };

    const submitReview = async () => {
        const review = reviews[currentProduct.id];
        if (!review || !review.rating) {
            alert('Please select a rating');
            return;
        }

        setSubmitting(true);
        try {
            await axios.post(`/products/${currentProduct.id}/reviews`, {
                rating: review.rating,
                title: review.title || '',
                comment: review.comment || '',
            });
            
            setSubmittedReviews(prev => [...prev, currentProduct.id]);
            
            // Move to next product or close
            if (currentProductIndex < products.length - 1) {
                setCurrentProductIndex(prev => prev + 1);
            } else {
                onReviewSubmitted();
                onClose();
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    const skipReview = () => {
        if (currentProductIndex < products.length - 1) {
            setCurrentProductIndex(prev => prev + 1);
        } else {
            onClose();
        }
    };

    if (!isOpen || !currentProduct) return null;

    const currentReview = reviews[currentProduct.id] || {};

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '2rem',
                maxWidth: '500px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0 }}>Rate Your Purchase</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{ marginBottom: '1rem', color: '#666', fontSize: '0.9rem' }}>
                    Product {currentProductIndex + 1} of {products.length}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', background: '#f9f9f9', borderRadius: '8px' }}>
                    <img 
                        src={currentProduct.image_url || (currentProduct.image ? `/storage/${currentProduct.image}` : '/placeholder.jpg')} 
                        alt={currentProduct.name}
                        style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                    <div>
                        <h4 style={{ margin: '0 0 0.25rem' }}>{currentProduct.name}</h4>
                        {currentProduct.size && <span style={{ fontSize: '0.85rem', color: '#666' }}>Size: {currentProduct.size}</span>}
                        {currentProduct.color && <span style={{ fontSize: '0.85rem', color: '#666', marginLeft: '0.5rem' }}>Color: {currentProduct.color}</span>}
                    </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Your Rating *</label>
                    <StarRating 
                        rating={currentReview.rating || 0} 
                        size={32} 
                        interactive={true} 
                        onChange={(rating) => updateReview('rating', rating)} 
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Title (Optional)</label>
                    <input
                        type="text"
                        value={currentReview.title || ''}
                        onChange={(e) => updateReview('title', e.target.value)}
                        placeholder="Sum up your experience"
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            fontSize: '1rem'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Your Review (Optional)</label>
                    <textarea
                        value={currentReview.comment || ''}
                        onChange={(e) => updateReview('comment', e.target.value)}
                        placeholder="Share your thoughts about this product..."
                        rows={4}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            resize: 'vertical'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={skipReview}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            background: 'white',
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                    >
                        Skip
                    </button>
                    <button
                        onClick={submitReview}
                        disabled={submitting || !currentReview.rating}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            border: 'none',
                            borderRadius: '8px',
                            background: submitting || !currentReview.rating ? '#ccc' : '#000',
                            color: 'white',
                            cursor: submitting || !currentReview.rating ? 'not-allowed' : 'pointer',
                            fontSize: '1rem',
                            fontWeight: 'bold'
                        }}
                    >
                        {submitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewModal, setReviewModal] = useState({ isOpen: false, products: [], orderId: null });
    const [processingOrderId, setProcessingOrderId] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await axios.get('/orders');
            setOrders(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkReceived = async (orderId) => {
        if (!window.confirm('Confirm that you have received this order?')) return;
        
        setProcessingOrderId(orderId);
        try {
            const res = await axios.post(`/orders/${orderId}/received`);
            
            // Update order in state
            setOrders(prev => prev.map(order => 
                order.id === orderId 
                    ? { ...order, received_at: res.data.order.received_at }
                    : order
            ));
            
            // Open review modal with products
            if (res.data.products_to_review && res.data.products_to_review.length > 0) {
                setReviewModal({
                    isOpen: true,
                    products: res.data.products_to_review,
                    orderId: orderId
                });
            } else {
                alert('Order marked as received!');
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to mark order as received');
        } finally {
            setProcessingOrderId(null);
        }
    };

    const handleReviewSubmitted = () => {
        fetchOrders(); // Refresh orders
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading Orders...</div>;

    return (
        <div className="container" style={{ padding: '4rem 0' }}>
            <h1 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Package /> Your Orders
            </h1>
            {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', background: '#f9f9f9', borderRadius: '10px' }}>
                    <p>No orders found.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {orders.map(order => (
                        <div key={order.id} style={{ border: '1px solid #eee', borderRadius: '10px', padding: '1.5rem', background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <h3 style={{ margin: 0 }}>Order #{order.id}</h3>
                                    <p style={{ color: '#666', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ 
                                        display: 'inline-block', 
                                        padding: '0.25rem 0.75rem', 
                                        borderRadius: '999px', 
                                        fontSize: '0.85rem',
                                        backgroundColor: order.status === 'completed' ? '#d1fae5' : order.status === 'cancelled' ? '#fee2e2' : '#fef3c7',
                                        color: order.status === 'completed' ? '#065f46' : order.status === 'cancelled' ? '#991b1b' : '#92400e',
                                        textTransform: 'capitalize',
                                        fontWeight: 'bold'
                                    }}>
                                        {order.status}
                                    </span>
                                    {order.received_at && (
                                        <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end', color: '#10b981', fontSize: '0.85rem' }}>
                                            <CheckCircle size={14} /> Received on {new Date(order.received_at).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div style={{ marginBottom: '1rem' }}>
                                {order.items.map(item => (
                                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px dashed #eee' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <img src={item.product?.image_url} alt={item.product?.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px' }} />
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 'bold' }}>{item.product?.name || 'Unknown Product'}</p>
                                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>
                                                    Qty: {item.quantity} {item.size && `| Size: ${item.size}`} {item.color && `| Color: ${item.color}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ alignSelf: 'center', fontWeight: 'bold' }}>
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <p style={{ margin: '0 0 0.25rem', fontSize: '0.9rem', color: '#666' }}><strong>Payment:</strong> {order.payment_method}</p>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}><strong>Address:</strong> {order.address}, {order.city}</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <h3 style={{ margin: 0 }}>Total: ${Number(order.total_amount).toFixed(2)}</h3>
                                    
                                    {/* Show "Mark as Received" button for completed orders not yet received */}
                                    {order.status === 'completed' && !order.received_at && (
                                        <button
                                            onClick={() => handleMarkReceived(order.id)}
                                            disabled={processingOrderId === order.id}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                background: processingOrderId === order.id ? '#ccc' : '#10b981',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                cursor: processingOrderId === order.id ? 'not-allowed' : 'pointer',
                                                fontWeight: 'bold',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}
                                        >
                                            <CheckCircle size={18} />
                                            {processingOrderId === order.id ? 'Processing...' : 'Order Received'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ReviewModal
                isOpen={reviewModal.isOpen}
                onClose={() => setReviewModal({ isOpen: false, products: [], orderId: null })}
                products={reviewModal.products}
                orderId={reviewModal.orderId}
                onReviewSubmitted={handleReviewSubmitted}
            />
        </div>
    );
};

export default OrderHistory;
