import { useContext, useState, useEffect } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, Plus, Minus } from 'lucide-react';
import axios from 'axios';

const Cart = () => {
    const { cart, removeFromCart, updateCartItemQuantity, checkout } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [referenceNumber, setReferenceNumber] = useState('');
    const [address, setAddress] = useState('');
    const [contact, setContact] = useState('');
    const [city, setCity] = useState('');
    const [selectedItemIds, setSelectedItemIds] = useState([]);
    const [initialized, setInitialized] = useState(false);

    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [validatingCoupon, setValidatingCoupon] = useState(false);
    const [couponError, setCouponError] = useState('');
    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (user) {
            setContact(user.phone || '');
            setAddress(user.address || '');
            
            // Try to extract city if address has commas (e.g., Street, Barangay, City, Province, Country)
            const parts = (user.address || '').split(',');
            if (parts.length >= 3) {
                setCity(parts[parts.length - 3].trim());
            } else {
                setCity('Saved on profile');
            }
        }
    }, [user]);

    useEffect(() => {
        const fetchCoupons = async () => {
            try {
                const res = await axios.get('/coupons/active');
                setAvailableCoupons(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchCoupons();
    }, []);

    useEffect(() => {
        if (!initialized && cart.length > 0) {
            setSelectedItemIds(cart.map(item => item.id));
            setInitialized(true);
        } else if (cart.length === 0) {
            setInitialized(false);
            setSelectedItemIds([]);
        }
    }, [cart, initialized]);

    const toggleSelection = (id) => {
        setSelectedItemIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const selectAll = () => {
        if (selectedItemIds.length === cart.length) {
            setSelectedItemIds([]);
        } else {
            setSelectedItemIds(cart.map(item => item.id));
        }
    };
    const navigate = useNavigate();

    const handleCheckout = async () => {
        if (selectedItemIds.length === 0) {
            alert("Please select at least one item to checkout.");
            return;
        }
        if (!address.trim() || !contact.trim() || !city.trim()) {
            alert("Please provide complete delivery details (Address, Contact, and City).");
            return;
        }
        if (paymentMethod === 'GCash' && (!referenceNumber.trim() || referenceNumber.trim().length < 8)) {
            alert("Please provide a valid GCash Reference Number.");
            return;
        }
        
        setIsProcessing(true);
        const success = await checkout(paymentMethod, address, contact, city, selectedItemIds, appliedCoupon?.code, referenceNumber);
        setIsProcessing(false);
        
        if (success) {
            alert("Order placed successfully!");
            navigate('/orders');
        }
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setValidatingCoupon(true);
        setCouponError('');
        try {
            const res = await axios.post('/coupons/validate', { code: couponCode });
            setAppliedCoupon(res.data.coupon);
            setCouponError('');
        } catch (error) {
            setCouponError(error.response?.data?.message || 'Invalid coupon code');
            setAppliedCoupon(null);
        } finally {
            setValidatingCoupon(false);
        }
    };


    const subtotal = cart
        .filter(item => selectedItemIds.includes(item.id))
        .reduce((acc, item) => {
            const price = item.variant?.price || item.product?.price || 0;
            return acc + (price * item.quantity);
        }, 0);

    let discountAmount = 0;
    if (appliedCoupon) {
        if (appliedCoupon.type === 'percent') {
            discountAmount = subtotal * (appliedCoupon.value / 100);
        } else {
            discountAmount = appliedCoupon.value;
        }
        if (discountAmount > subtotal) discountAmount = subtotal;
    }

    const total = subtotal - discountAmount;

    if (!user) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '10rem 0' }}>
                <h2>Please login to view your cart</h2>
                <Link to="/login" className="btn btn-primary" style={{ marginTop: '2rem' }}>Login</Link>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '10rem 0' }}>
                <ShoppingBag size={64} style={{ margin: '0 auto 2rem', color: 'var(--text-muted)' }} />
                <h2>Your cart is empty</h2>
                <Link to="/shop" className="btn btn-primary" style={{ marginTop: '2rem' }}>Continue Shopping</Link>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '4rem 0' }}>
            <h1>Shopping Cart</h1>
            <div className="cart-layout" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '4rem', marginTop: '3rem' }}>
                <div className="cart-items">
                    <div style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <input
                            type="checkbox"
                            checked={selectedItemIds.length === cart.length && cart.length > 0}
                            onChange={selectAll}
                            style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#000' }}
                        />
                        <span style={{ fontWeight: 'bold' }}>Select All</span>
                    </div>
                    {cart.map(item => (
                        <div key={item.id} className="cart-item" style={{ display: 'flex', gap: '2rem', padding: '2rem 0', borderBottom: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <input
                                    type="checkbox"
                                    checked={selectedItemIds.includes(item.id)}
                                    onChange={() => toggleSelection(item.id)}
                                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#000' }}
                                />
                            </div>
                            <div className="cart-item-image" style={{ width: '120px', aspectRatio: '3/4', backgroundColor: 'var(--bg-secondary)', flexShrink: 0 }}>
                                <img src={item.variant?.image_url || (item.product?.images && item.product.images.length > 0 ? (item.product.images[0].startsWith('http') ? item.product.images[0] : (item.product.images[0].startsWith('/storage') ? `${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'}${item.product.images[0]}` : `${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'}/storage/${item.product.images[0]}`)) : item.product?.image_url)} alt={item.product?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div className="cart-item-info" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{item.product?.name}</h3>
                                        <span style={{ fontWeight: '600', fontSize: '1.25rem' }}>
                                            ₱{Number(item.variant?.price || item.product?.price || 0).toFixed(2)}
                                        </span>
                                    </div>
                                    <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                                            <button
                                                className="btn-icon"
                                                onClick={() => {
                                                    if (item.quantity > 1) {
                                                        updateCartItemQuantity(item.id, item.quantity - 1);
                                                    }
                                                }}
                                                disabled={item.quantity <= 1}
                                                style={{ padding: '0.25rem 0.5rem', background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)', borderRadius: 0, opacity: item.quantity <= 1 ? 0.5 : 1 }}
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <span style={{ padding: '0.25rem 1rem', fontWeight: '500', minWidth: '3rem', textAlign: 'center', color: 'var(--text)' }}>
                                                {item.quantity}
                                            </span>
                                            <button
                                                className="btn-icon"
                                                onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                                                style={{ padding: '0.25rem 0.5rem', background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border)', borderRadius: 0 }}
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                        {(item.variant?.size || item.size) && <span>Size: {item.variant?.size || item.size}</span>}
                                        {(item.variant?.color || item.color) && <span>Color: {item.variant?.color || item.color}</span>}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                                    <button className="btn-icon" onClick={() => removeFromCart(item.id)} style={{ color: 'var(--danger)', padding: 0 }}>
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="cart-summary" style={{ backgroundColor: 'var(--bg-secondary)', padding: '2.5rem', alignSelf: 'start', borderRadius: 'var(--radius)' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', textTransform: 'uppercase' }}>Order Summary</h2>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                        <span>Subtotal</span>
                        <span>₱{subtotal.toFixed(2)}</span>
                    </div>

                    <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
                        <label className="form-label" style={{ fontSize: '0.9rem' }}>Promo Code / Coupon</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Enter code"
                                value={couponCode}
                                onChange={e => setCouponCode(e.target.value)}
                                disabled={appliedCoupon !== null}
                                style={{ flex: 1, textTransform: 'uppercase' }}
                            />
                            {appliedCoupon ? (
                                <button className="btn btn-outline" onClick={() => { setAppliedCoupon(null); setCouponCode(''); }} style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>Remove</button>
                            ) : (
                                <button id="apply-coupon-btn" className="btn btn-outline" onClick={handleApplyCoupon} disabled={!couponCode || validatingCoupon}>{validatingCoupon ? '...' : 'Apply'}</button>
                            )}
                        </div>
                        {couponError && <div style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.5rem' }}>{couponError}</div>}
                        {appliedCoupon && (
                            <div style={{ color: '#2ecc71', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: '500' }}>
                                Coupon '{appliedCoupon.code}' applied! (-₱{discountAmount.toFixed(2)})
                            </div>
                        )}
                        {availableCoupons.length > 0 && !appliedCoupon && (
                            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '6px', border: '1px dashed #ccc' }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>AVAILABLE PROMOS</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {availableCoupons.map(c => (
                                        <div
                                            key={c.id}
                                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '0.6rem 0.75rem', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #eaeaea', transition: 'border-color 0.2s' }}
                                            onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
                                            onMouseOut={(e) => { e.currentTarget.style.borderColor = '#eaeaea'; }}
                                            onClick={() => {
                                                setCouponCode(c.code);
                                                setTimeout(() => {
                                                    document.getElementById('apply-coupon-btn')?.click();
                                                }, 100);
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{ fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', backgroundColor: 'var(--bg-secondary)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem', letterSpacing: '0.05em' }}>{c.code}</span>
                                                <span style={{ fontSize: '0.85rem', color: '#555', fontWeight: '500' }}>
                                                    {c.type === 'percent' ? `${c.value}% OFF` : `₱${c.value} OFF`}
                                                </span>
                                            </div>
                                            <button className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>Use</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', fontSize: '1.5rem', fontWeight: '600' }}>
                        <span>Total</span>
                        <span>₱{total.toFixed(2)}</span>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Payment Method</label>
                        <select
                            className="form-control"
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                        >
                            <option value="COD">Cash on Delivery (COD)</option>
                            <option value="GCash">GCash</option>
                        </select>
                    </div>

                    {paymentMethod === 'GCash' && (
                        <div style={{ marginTop: '1.5rem', marginBottom: '1rem', backgroundColor: '#f0f4f8', padding: '1.5rem', borderRadius: '12px', border: '1px solid #cce0ff' }}>
                            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'inline-block', backgroundColor: 'white', padding: '0.75rem', borderRadius: '12px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
                                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=gcash://send?number=09949479270" alt="GCash QR Code" style={{ width: '120px', height: '120px' }} />
                                </div>
                                <div style={{ fontWeight: '800', marginTop: '1rem', fontSize: '1.25rem', color: '#005CEE', letterSpacing: '-0.02em' }}>Primewear Official GCash</div>
                                <div style={{ color: '#444', fontSize: '1.1rem', fontWeight: 600 }}>0994-947-9270</div>
                            </div>
                            <div className="form-group">
                                <label className="form-label" style={{ color: '#005CEE', fontWeight: 700 }}>GCash Reference Number <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={referenceNumber}
                                    onChange={(e) => setReferenceNumber(e.target.value)}
                                    placeholder="Enter 13-digit Reference No."
                                    style={{ borderColor: '#cce0ff', backgroundColor: '#fff' }}
                                    required
                                />
                                <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.75rem', lineHeight: 1.5 }}>
                                    Please transfer the exact total amount (<strong>₱{total.toFixed(2)}</strong>) to the number above and enter your reference number to verify your order.
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="form-group" style={{ marginTop: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <label className="form-label" style={{ marginBottom: 0 }}>Delivery Address</label>
                        </div>
                        <textarea
                            className="form-control"
                            rows="2"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            disabled
                            style={{ backgroundColor: 'var(--bg-secondary)', cursor: 'not-allowed', color: '#555' }}
                        ></textarea>
                    </div>

                    <div className="form-group" style={{ marginTop: '1rem' }}>
                        <label className="form-label">Contact Number</label>
                        <input
                            type="text"
                            className="form-control"
                            value={contact}
                            onChange={(e) => setContact(e.target.value)}
                            disabled
                            style={{ backgroundColor: 'var(--bg-secondary)', cursor: 'not-allowed', color: '#555' }}
                        />
                    </div>

                    <div className="form-group" style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
                        <label className="form-label">City</label>
                        <input
                            type="text"
                            className="form-control"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            disabled
                            style={{ backgroundColor: 'var(--bg-secondary)', cursor: 'not-allowed', color: '#555' }}
                        />
                    </div>
                    
                    <div style={{ textAlign: 'right', marginBottom: '2rem' }}>
                        <Link to="/profile" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600' }}>✏️ Edit Address in Profile</Link>
                    </div>

                    <button className="btn btn-primary" style={{ width: '100%', padding: '1.25rem', opacity: isProcessing ? 0.7 : 1, cursor: isProcessing ? 'not-allowed' : 'pointer' }} onClick={handleCheckout} disabled={isProcessing}>
                        {isProcessing ? 'Processing Order...' : 'Proceed to Checkout'}
                    </button>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media (max-width: 900px) {
                    .cart-layout {
                        grid-template-columns: 1fr !important;
                        gap: 2rem !important;
                    }
                    .cart-item {
                        gap: 1rem !important;
                        position: relative;
                    }
                    .cart-item-image {
                        width: 80px !important;
                    }
                    .cart-item-info h3 {
                        font-size: 1rem !important;
                    }
                    .cart-item-info span {
                        font-size: 1rem !important;
                    }
                    .cart-summary {
                        padding: 1.5rem !important;
                    }
                }
                @media (max-width: 480px) {
                    .cart-item {
                        align-items: flex-start !important;
                    }
                }
            `}} />
        </div>
    );
};

export default Cart;
