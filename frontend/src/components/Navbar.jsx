import { Link, useLocation } from 'react-router-dom';
import { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { ShoppingBag, User, LogOut, Settings, Star } from 'lucide-react';
import NotificationsDropdown from './NotificationsDropdown';

const SettingsDropdown = ({ user, onLogout }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef();

    useEffect(() => {
        const onDoc = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('click', onDoc);
        return () => document.removeEventListener('click', onDoc);
    }, []);

    const handleLogout = () => {
        setOpen(false);
        onLogout();
    };

    return (
        <div ref={ref} style={{ display: 'inline-block', position: 'relative', marginLeft: '0.5rem' }}>
            <button className="btn-icon" onClick={() => setOpen(v => !v)} title="Settings" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <Settings size={20} />
            </button>
            {open && (
                <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', background: 'white', border: '1px solid #ddd', borderRadius: 6, boxShadow: '0 6px 18px rgba(0,0,0,0.06)', minWidth: 200, zIndex: 40 }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Link to="/settings/general" className="nav-link" style={{ padding: '0.5rem 0.75rem' }} onClick={() => setOpen(false)}>General Settings</Link>
                        {user?.is_admin && (
                            <>
                                <Link to="/admin/payment-method" className="nav-link" style={{ padding: '0.5rem 0.75rem' }} onClick={() => setOpen(false)}>Payment method</Link>
                                <Link to="/admin/reviews" className="nav-link" style={{ padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setOpen(false)}>
                                    <Star size={16} /> Reviews
                                </Link>
                            </>
                        )}
                        <Link to="/settings/notifications" className="nav-link" style={{ padding: '0.5rem 0.75rem' }} onClick={() => setOpen(false)}>Notification Settings</Link>
                        <Link to="/settings/security" className="nav-link" style={{ padding: '0.5rem 0.75rem' }} onClick={() => setOpen(false)}>Security</Link>
                        
                        {/* Divider */}
                        <div style={{ borderTop: '1px solid #e0e0e0', margin: '0.25rem 0' }} />
                        
                        {/* Logout at bottom */}
                        <button 
                            onClick={handleLogout}
                            style={{ 
                                padding: '0.5rem 0.75rem', 
                                background: 'none', 
                                border: 'none', 
                                textAlign: 'left',
                                cursor: 'pointer',
                                color: '#dc3545',
                                fontSize: '0.9rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { cart } = useContext(CartContext);
    const location = useLocation();

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <nav className="navbar">
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <Link to="/" className="brand">PrimeWear</Link>

                <div className="nav-links">
                    <Link to="/" className={`nav-link ${isActive('/')}`}>Home</Link>
                    <Link to="/shop" className={`nav-link ${isActive('/shop')}`}>Shop</Link>
                    <Link to="/about" className={`nav-link ${isActive('/about')}`}>About Us</Link>
                </div>

                <div className="nav-actions" style={{ position: 'relative' }}>
                    {user ? (
                        <>
                            {user.is_admin && (
                                <Link to="/admin" className={`nav-link ${isActive('/admin')}`}>Admin</Link>
                            )}
                            <Link to="/orders" className={`nav-link ${isActive('/orders')}`}>Orders</Link>
                            <Link to="/profile" className={`nav-link ${isActive('/profile')}`} style={{ textTransform: 'none' }}>Hi, {user.name}</Link>

                            {/* Grouped controls: Bell -> Cart -> Settings (with logout inside) */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '0.5rem' }}>
                                <NotificationsDropdown />
                                <Link to="/cart" className="btn-icon cart-badge" style={{ position: 'relative' }}>
                                    <ShoppingBag size={20} />
                                    {cart.length > 0 && (
                                        <span className="cart-count">
                                            {cart.reduce((acc, item) => acc + item.quantity, 0)}
                                        </span>
                                    )}
                                </Link>

                                <SettingsDropdown user={user} onLogout={logout} />
                            </div>
                        </>
                    ) : (
                        <Link to="/login" className="btn-icon">
                            <User size={20} />
                        </Link>
                    )}
                    
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
