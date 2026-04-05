import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Package, Star, CheckCircle, X, RotateCcw, Check } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

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

const OrderTracking = ({ status }) => {
    const steps = ['pending', 'processing', 'shipped', 'completed'];
    
    if (status === 'cancelled') {
        return (
            <div style={{ padding: '1rem 1.5rem', backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', color: '#991b1b', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', fontSize: '0.95rem' }}>
                <div style={{ background: '#f87171', color: 'white', borderRadius: '50%', padding: '0.25rem' }}><X size={16} strokeWidth={3} /></div>
                Order Cancelled
            </div>
        );
    }

    if (status === 'refund_requested' || status === 'refunded') {
        return (
            <div style={{ padding: '1rem 1.5rem', backgroundColor: '#e0e7ff', border: '1px solid #c7d2fe', borderRadius: '8px', color: '#3730a3', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', fontSize: '0.95rem' }}>
                <div style={{ background: '#818cf8', color: 'white', borderRadius: '50%', padding: '0.25rem' }}><RotateCcw size={16} strokeWidth={3} /></div>
                {status === 'refund_requested' ? 'Refund Requested & Pending Approval' : 'Order Refunded Successfully'}
            </div>
        );
    }
    
    const currentIndex = steps.indexOf(status) === -1 ? 0 : steps.indexOf(status);

    return (
        <div style={{ marginBottom: '2.5rem', marginTop: '1.5rem', padding: '0 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                {/* Background Line */}
                <div style={{ position: 'absolute', top: '16px', left: '0', right: '0', height: '4px', backgroundColor: '#f3f4f6', transform: 'translateY(-50%)', zIndex: 1, borderRadius: '4px' }}></div>
                {/* Active Line */}
                <div style={{ position: 'absolute', top: '16px', left: '0', height: '4px', backgroundColor: 'var(--primary)', transform: 'translateY(-50%)', zIndex: 2, width: `${(currentIndex / 3) * 100}%`, transition: 'width 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)', borderRadius: '4px' }}></div>
                
                {['Placed', 'Processing', 'Shipped', 'Delivered'].map((label, index) => {
                    const isCompleted = index <= currentIndex;
                    const isActive = index === currentIndex;
                    return (
                        <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 3 }}>
                            <div style={{ 
                                width: '32px', height: '32px', borderRadius: '50%', 
                                backgroundColor: isCompleted ? 'var(--primary)' : '#fff',
                                border: isCompleted ? '3px solid var(--primary)' : '3px solid #e5e7eb',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: isCompleted ? 'var(--bg)' : '#9ca3af',
                                boxShadow: isActive ? '0 0 0 5px rgba(0,0,0,0.05)' : 'none',
                                transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                            }}>
                                {isCompleted ? <Check size={16} strokeWidth={4} /> : <div style={{width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#d1d5db'}}></div>}
                            </div>
                            <span style={{ marginTop: '0.75rem', fontSize: '0.8rem', fontWeight: isCompleted ? '700' : '600', color: isCompleted ? 'var(--text)' : '#9ca3af', letterSpacing: '0.02em', textTransform: 'uppercase' }}>{label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const OrderHistory = () => {
    const { addToCart } = useContext(CartContext);
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewModal, setReviewModal] = useState({ isOpen: false, products: [], orderId: null });
    const [processingOrderId, setProcessingOrderId] = useState(null);

    const handleBuyAgain = async (item) => {
        try {
            await addToCart(item.product_id, 1, item.size, item.color, item.variant_id);
            if (window.confirm('Item added to your cart! Do you want to checkout now?')) {
                navigate('/cart');
            }
        } catch (err) {
            alert('Failed to add to cart. Product might be out of stock.');
        }
    };

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

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) return;
        setProcessingOrderId(orderId);
        try {
            await axios.post(`/orders/${orderId}/cancel`);
            setOrders(prev => prev.map(order => order.id === orderId ? { ...order, status: 'cancelled' } : order));
            alert('Order cancelled successfully.');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to cancel order');
        } finally {
            setProcessingOrderId(null);
        }
    };

    const handleRequestRefund = async (orderId) => {
        if (!window.confirm('Are you sure you want to request a refund for this order?')) return;
        setProcessingOrderId(orderId);
        try {
            await axios.post(`/orders/${orderId}/refund`);
            setOrders(prev => prev.map(order => order.id === orderId ? { ...order, status: 'refund_requested' } : order));
            alert('Refund requested successfully. We will review your request shortly.');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to request refund');
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
                        <div key={order.id} className="order-card" style={{ border: '1px solid #eee', borderRadius: '10px', padding: 'clamp(1rem, 3vw, 1.5rem)', background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                            <div className="order-header" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: 'clamp(1rem, 2.5vw, 1.25rem)' }}>Order #{order.id}</h3>
                                    <p style={{ color: '#666', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ 
                                        display: 'inline-block', 
                                        padding: '0.25rem 0.75rem', 
                                        borderRadius: '999px', 
                                        fontSize: '0.75rem',
                                        backgroundColor: order.status === 'completed' ? '#d1fae5' : order.status === 'cancelled' ? '#fee2e2' : ['refund_requested', 'refunded'].includes(order.status) ? '#e0e7ff' : '#fef3c7',
                                        color: order.status === 'completed' ? '#065f46' : order.status === 'cancelled' ? '#991b1b' : ['refund_requested', 'refunded'].includes(order.status) ? '#3730a3' : '#92400e',
                                        textTransform: 'capitalize',
                                        fontWeight: 'bold',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {order.status}
                                    </span>
                                    {order.received_at && (
                                        <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end', color: '#10b981', fontSize: '0.75rem' }}>
                                            <CheckCircle size={12} /> Received
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <OrderTracking status={order.status} />
                            
                            <div style={{ marginBottom: '1rem' }}>
                                {order.items.map(item => (
                                    <div key={item.id} className="order-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px dashed #eee', gap: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                                            <img src={item.variant?.image_url || (item.product?.images && item.product.images.length > 0 ? (item.product.images[0].startsWith('http') ? item.product.images[0] : (item.product.images[0].startsWith('/storage') ? `${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'}${item.product.images[0]}` : `${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'}/storage/${item.product.images[0]}`)) : item.product?.image_url)} alt={item.product?.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '5px', backgroundColor: 'var(--bg-secondary)', flexShrink: 0 }} />
                                            <div style={{ minWidth: 0 }}>
                                                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product?.name || 'Unknown'}</p>
                                                <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#666' }}>
                                                    Qty: {item.quantity} {item.size && `| Size: ${item.size}`} {item.color && `| Color: ${item.color}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ alignSelf: 'center', textAlign: 'right', flexShrink: 0 }}>
                                            <div style={{ fontWeight: 'bold', marginBottom: (order.status === 'completed' && order.received_at) ? '0.5rem' : '0', fontSize: '1rem' }}>
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </div>
                                            {order.status === 'completed' && order.received_at && (
                                                <button 
                                                    onClick={() => handleBuyAgain(item)}
                                                    style={{ 
                                                        background: 'transparent',
                                                        border: '1px solid var(--primary)',
                                                        color: 'var(--primary)',
                                                        padding: '0.3rem 0.6rem',
                                                        borderRadius: '6px',
                                                        fontSize: '0.75rem',
                                                        cursor: 'pointer',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '0.25rem',
                                                        fontWeight: '600'
                                                    }}
                                                >
                                                    <RotateCcw size={12} /> Buy Again
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="order-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1.5rem', flexWrap: 'wrap' }}>
                                <div style={{ flex: '1 1 200px' }}>
                                    <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: '#555' }}>
                                        <strong>Payment:</strong> {order.payment_method}
                                    </p>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#555', lineHeight: '1.4' }}>
                                        <strong>Address:</strong> {order.address}, {order.city}
                                    </p>
                                    {order.coupon_code && (
                                        <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>
                                            Coupon Applied: {order.coupon_code} (-${Number(order.discount_amount).toFixed(2)})
                                        </p>
                                    )}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Total: ${Number(order.total_amount).toFixed(2)}</h3>
                                    
                                    {order.status === 'pending' && (
                                        <button
                                            onClick={() => handleCancelOrder(order.id)}
                                            disabled={processingOrderId === order.id}
                                            style={{
                                                padding: '0.65rem 1.25rem',
                                                background: processingOrderId === order.id ? '#ccc' : '#ef4444',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                cursor: processingOrderId === order.id ? 'not-allowed' : 'pointer',
                                                fontWeight: 'bold',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            {processingOrderId === order.id ? '...' : 'Cancel Order'}
                                        </button>
                                    )}

                                    {order.status === 'completed' && !order.received_at && (
                                        <button
                                            onClick={() => handleMarkReceived(order.id)}
                                            disabled={processingOrderId === order.id}
                                            style={{
                                                padding: '0.65rem 1.25rem',
                                                background: processingOrderId === order.id ? '#ccc' : '#10b981',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                cursor: processingOrderId === order.id ? 'not-allowed' : 'pointer',
                                                fontWeight: 'bold',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            <CheckCircle size={18} />
                                            {processingOrderId === order.id ? '...' : 'Order Received'}
                                        </button>
                                    )}

                                    {(order.status === 'completed' || order.status === 'delivered') && (
                                        <button
                                            onClick={() => handleRequestRefund(order.id)}
                                            disabled={processingOrderId === order.id}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                background: 'transparent',
                                                color: '#6366f1',
                                                border: '1px solid #6366f1',
                                                borderRadius: '8px',
                                                cursor: processingOrderId === order.id ? 'not-allowed' : 'pointer',
                                                fontWeight: 'bold',
                                                fontSize: '0.85rem'
                                            }}
                                        >
                                            Request Refund
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style dangerouslySetInnerHTML={{__html: `
                @media (max-width: 600px) {
                    .order-header {
                        flex-direction: column !important;
                        gap: 1rem !important;
                        text-align: left !important;
                    }
                    .order-header > div:last-child {
                        text-align: left !important;
                    }
                    .order-header > div:last-child > div {
                        justify-content: flex-start !important;
                    }
                    .order-item {
                        flex-direction: column !important;
                        align-items: flex-start !important;
                    }
                    .order-item > div:last-child {
                        text-align: left !important;
                        align-self: flex-start !important;
                        margin-top: 0.5rem;
                        display: flex;
                        width: 100%;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .order-footer {
                        flex-direction: column !important;
                        align-items: flex-start !important;
                    }
                    .order-footer > div:last-child {
                        align-items: flex-start !important;
                        width: 100%;
                    }
                }
            `}} />


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
