import { useContext, useState, useEffect } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag } from 'lucide-react';

const Cart = () => {
    const { cart, removeFromCart, checkout } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [address, setAddress] = useState('');
    const [contact, setContact] = useState('');
    const [city, setCity] = useState('');
    const [selectedItemIds, setSelectedItemIds] = useState([]);
    const [initialized, setInitialized] = useState(false);

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
        const success = await checkout(paymentMethod, address, contact, city, selectedItemIds);
        if (success) {
            alert("Order placed successfully!");
            navigate('/orders');
        }
    };

    const total = cart
        .filter(item => selectedItemIds.includes(item.id))
        .reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

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
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '4rem', marginTop: '3rem' }}>
                <div>
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
                        <div key={item.id} style={{ display: 'flex', gap: '2rem', padding: '2rem 0', borderBottom: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <input 
                                    type="checkbox" 
                                    checked={selectedItemIds.includes(item.id)} 
                                    onChange={() => toggleSelection(item.id)}
                                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#000' }}
                                />
                            </div>
                            <div style={{ width: '120px', aspectRatio: '3/4', backgroundColor: 'var(--bg-secondary)' }}>
                                <img src={item.product?.image_url} alt={item.product?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{item.product?.name}</h3>
                                        <span style={{ fontWeight: '600', fontSize: '1.25rem' }}>${Number(item.product?.price).toFixed(2)}</span>
                                    </div>
                                    <div style={{ color: 'var(--text-muted)', display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                        <span>Quantity: {item.quantity}</span>
                                        {item.size && <span>Size: {item.size}</span>}
                                        {item.color && <span>Color: {item.color}</span>}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <button className="btn-icon" onClick={() => removeFromCart(item.id)} style={{ color: 'var(--danger)' }}>
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '2.5rem', alignSelf: 'start', borderRadius: 'var(--radius)' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', textTransform: 'uppercase' }}>Order Summary</h2>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                        <span>Subtotal</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', fontSize: '1.5rem', fontWeight: '600' }}>
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
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

                    <div className="form-group" style={{ marginTop: '1rem' }}>
                        <label className="form-label">Delivery Address</label>
                        <textarea
                            className="form-control"
                            rows="2"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Enter your full delivery address"
                            required
                        ></textarea>
                    </div>

                    <div className="form-group" style={{ marginTop: '1rem' }}>
                        <label className="form-label">Contact Number</label>
                        <input
                            type="text"
                            className="form-control"
                            value={contact}
                            onChange={(e) => setContact(e.target.value)}
                            placeholder="e.g. 09123456789"
                            required
                        />
                    </div>

                    <div className="form-group" style={{ marginTop: '1rem', marginBottom: '2rem' }}>
                        <label className="form-label">City</label>
                        <input
                            type="text"
                            className="form-control"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Enter your City"
                            required
                        />
                    </div>

                    <button className="btn btn-primary" style={{ width: '100%', padding: '1.25rem' }} onClick={handleCheckout}>
                        Proceed to Checkout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart;
