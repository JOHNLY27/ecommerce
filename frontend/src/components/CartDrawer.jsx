import { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { X, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CartDrawer = () => {
    const { cart, isCartOpen, setIsCartOpen, updateCartItemQuantity, removeFromCart } = useContext(CartContext);
    const navigate = useNavigate();

    // Do not render anything until opened, or use a CSS transform class. 
    // Here we conditionally render based on isCartOpen. 
    // Actually, to get transition effect, we need to render it always or manage mount state. 
    // Conditional rendering prevents the slide out animation. So we will just use pointer-events and opacity for backdrop, and transform for drawer.
    if (!isCartOpen && cart.length === 0) return null; // Small optimization

    const totalAmount = cart.reduce((total, item) => {
        const price = Number(item.variant?.price || item.product?.price || 0);
        return total + (item.quantity * price);
    }, 0);

    const handleCheckout = () => {
        setIsCartOpen(false);
        navigate('/cart');
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'flex-end',
            fontFamily: 'inherit',
            pointerEvents: isCartOpen ? 'auto' : 'none'
        }}>
            {/* Backdrop */}
            <div 
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(3px)',
                    opacity: isCartOpen ? 1 : 0,
                    transition: 'opacity 0.3s ease-in-out',
                    pointerEvents: isCartOpen ? 'auto' : 'none'
                }}
                onClick={() => setIsCartOpen(false)}
            ></div>

            {/* Drawer */}
            <div 
                style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '430px',
                    backgroundColor: 'var(--bg)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: isCartOpen ? '-5px 0 40px rgba(0,0,0,0.15)' : 'none',
                    transform: isCartOpen ? 'translateX(0)' : 'translateX(100%)',
                    transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    color: 'var(--text)'
                }}
            >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 1.5rem 1.25rem', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 800 }}>
                        <ShoppingBag size={22} /> Your Cart
                        <span style={{ backgroundColor: 'var(--primary)', color: 'white', fontSize: '0.75rem', padding: '0.15rem 0.6rem', borderRadius: '1rem' }}>
                            {cart.reduce((acc, i) => acc + i.quantity, 0)}
                        </span>
                    </h2>
                    <button onClick={() => setIsCartOpen(false)} style={{ background: '#f3f4f6', border: 'none', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#e5e7eb'} onMouseOut={(e) => e.currentTarget.style.background = '#f3f4f6'}>
                        <X size={20} />
                    </button>
                </div>

                {/* Items */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {cart.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <ShoppingBag size={32} style={{ color: '#9ca3af' }} />
                            </div>
                            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text)', fontSize: '1.1rem' }}>Your cart is empty</h3>
                            <p style={{ margin: '0 0 2rem', fontSize: '0.9rem' }}>Looks like you haven't added anything yet.</p>
                            <button 
                                onClick={() => { setIsCartOpen(false); navigate('/shop'); }}
                                style={{ padding: '0.9rem 2rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 700, transition: 'transform 0.2s', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                Start Shopping
                            </button>
                        </div>
                    ) : (
                        cart.map(item => {
                            const imgUrl = item.variant?.image_url || (item.product?.images && item.product.images.length > 0 ? (item.product.images[0].startsWith('http') ? item.product.images[0] : (item.product.images[0].startsWith('/storage') ? `${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'}${item.product.images[0]}` : `${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'}/storage/${item.product.images[0]}`)) : item.product?.image_url);
                            const itemPrice = Number(item.variant?.price || item.product?.price || 0);

                            return (
                            <div key={item.id} style={{ display: 'flex', gap: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                <img src={imgUrl || '/placeholder.jpg'} alt={item.product?.name} style={{ width: '90px', height: '110px', objectFit: 'cover', borderRadius: '8px', backgroundColor: '#f9fafb' }} />
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <h4 style={{ margin: '0 0 0.25rem', fontSize: '1rem', fontWeight: 600, lineHeight: 1.3, paddingRight: '0.5rem' }}>{item.product?.name}</h4>
                                        <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '0 0 0 0.5rem' }} title="Remove"><X size={18} /></button>
                                    </div>
                                    <p style={{ margin: '0 0 0.5rem', color: '#6b7280', fontSize: '0.85rem' }}>
                                        {item.size && `Size: ${item.size}`} {item.size && item.color && '|'} {item.color && `Color: ${item.color}`}
                                    </p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: '6px', overflow: 'hidden' }}>
                                            <button onClick={() => updateCartItemQuantity(item.id, Math.max(1, item.quantity - 1))} style={{ background: '#f9fafb', border: 'none', padding: '0.4rem 0.6rem', cursor: 'pointer', color: '#4b5563' }}><Minus size={14} /></button>
                                            <span style={{ padding: '0 0.75rem', fontSize: '0.9rem', fontWeight: 600, width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                                            <button onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)} style={{ background: '#f9fafb', border: 'none', padding: '0.4rem 0.6rem', cursor: 'pointer', color: '#4b5563' }}><Plus size={14} /></button>
                                        </div>
                                        <strong style={{ fontSize: '1.1rem', fontWeight: 700 }}>${(itemPrice * item.quantity).toFixed(2)}</strong>
                                    </div>
                                </div>
                            </div>
                        )})
                    )}
                </div>

                {/* Footer */}
                {cart.length > 0 && (
                    <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(0,0,0,0.05)', backgroundColor: 'var(--bg)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 800 }}>
                            <span>Subtotal</span>
                            <span>${totalAmount.toFixed(2)}</span>
                        </div>
                        <p style={{ margin: '0 0 1.25rem', fontSize: '0.85rem', color: '#6b7280' }}>Shipping and taxes calculated at checkout.</p>
                        <button 
                            onClick={handleCheckout}
                            style={{ 
                                width: '100%', 
                                padding: '1.15rem', 
                                background: 'var(--primary)', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '12px', 
                                fontSize: '1.05rem', 
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '0.5rem',
                                boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                                transition: 'transform 0.2s, box-shadow 0.2s'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 25px rgba(0,0,0,0.2)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)'; }}
                        >
                            Review & Checkout <ArrowRight size={20} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartDrawer;
