import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { ShoppingBag, User, LogOut, Settings, Star, Heart, Menu, X, Search } from 'lucide-react';
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
    const { cart, setIsCartOpen } = useContext(CartContext);
    const { wishlist } = useContext(WishlistContext);
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isActive = (path) => location.pathname === path ? 'active' : '';

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname, location.search]);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [mobileMenuOpen]);

    return (
        <nav className="navbar">
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <Link to="/" className="brand">PrimeWear</Link>

                {/* Desktop Nav Links */}
                <div className="nav-links nav-desktop">
                    <Link to="/" className={`nav-link ${isActive('/')}`}>Home</Link>
                    <Link to="/shop" className={`nav-link ${isActive('/shop') && !location.search}`}>Shop</Link>
                    <Link to="/shop?category=2" className={`nav-link ${location.search.includes('category=2') ? 'active' : ''}`}>Men's</Link>
                    <Link to="/shop?category=3" className={`nav-link ${location.search.includes('category=3') ? 'active' : ''}`}>Women's</Link>
                    <Link to="/shop?category=4" className={`nav-link ${location.search.includes('category=4') ? 'active' : ''}`}>Accessories</Link>
                    <Link to="/about" className={`nav-link ${isActive('/about')}`}>About Us</Link>
                </div>

                {/* Desktop Nav Actions */}
                <div className="nav-actions nav-desktop" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <form 
                        onSubmit={(e) => { e.preventDefault(); navigate(`/shop?search=${e.target.search.value}`); }} 
                        style={{ display: 'flex', alignItems: 'center', background: '#f3f4f6', borderRadius: '50px', padding: '0.25rem 0.75rem', marginRight: '1rem', transition: 'all 0.3s' }}
                    >
                        <Search size={16} color="#6b7280" />
                        <input name="search" placeholder="Search..." style={{ border: 'none', background: 'transparent', outline: 'none', padding: '0.4rem 0.5rem', width: '140px', fontSize: '0.9rem' }} onFocus={e => e.currentTarget.parentElement.style.boxShadow = '0 0 0 2px rgba(0,0,0,0.05)'} onBlur={e => e.currentTarget.parentElement.style.boxShadow = 'none'} />
                    </form>

                    {user ? (
                        <>
                            {user.is_admin && (
                                <Link to="/admin" className={`nav-link ${isActive('/admin')}`}>Admin</Link>
                            )}
                            <Link to="/orders" className={`nav-link ${isActive('/orders')}`}>Orders</Link>
                            <Link to="/profile" className={`nav-link ${isActive('/profile')}`} style={{ textTransform: 'none' }}>Hi, {user.name}</Link>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '0.5rem' }}>
                                <NotificationsDropdown />
                                <Link to="/wishlist" className="btn-icon cart-badge" style={{ position: 'relative' }}>
                                    <Heart size={20} />
                                    {wishlist.length > 0 && (
                                        <span className="cart-count">
                                            {wishlist.length}
                                        </span>
                                    )}
                                </Link>
                                <button onClick={() => setIsCartOpen(true)} className="btn-icon cart-badge" style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
                                    <ShoppingBag size={20} />
                                    {cart.length > 0 && (
                                        <span className="cart-count">
                                            {cart.reduce((acc, item) => acc + item.quantity, 0)}
                                        </span>
                                    )}
                                </button>

                                <SettingsDropdown user={user} onLogout={logout} />
                            </div>
                        </>
                    ) : (
                        <Link to="/login" className="btn-icon">
                            <User size={20} />
                        </Link>
                    )}
                    
                </div>

                {/* Mobile: Icon actions + Hamburger */}
                <div className="nav-mobile-actions">
                    {user && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Link to="/wishlist" className="btn-icon cart-badge" style={{ position: 'relative' }}>
                                <Heart size={20} />
                                {wishlist.length > 0 && <span className="cart-count">{wishlist.length}</span>}
                            </Link>
                            <button onClick={() => setIsCartOpen(true)} className="btn-icon cart-badge" style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
                                <ShoppingBag size={20} />
                                {cart.length > 0 && <span className="cart-count">{cart.reduce((acc, item) => acc + item.quantity, 0)}</span>}
                            </button>
                        </div>
                    )}
                    <button 
                        className="btn-icon mobile-menu-toggle" 
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}>
                    <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
                        <div className="mobile-menu-header">
                            <span className="brand" style={{ fontSize: '1.25rem' }}>PrimeWear</span>
                            <button className="btn-icon" onClick={() => setMobileMenuOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                            <form 
                                onSubmit={(e) => { e.preventDefault(); setMobileMenuOpen(false); navigate(`/shop?search=${e.target.search.value}`); }} 
                                style={{ display: 'flex', alignItems: 'center', background: '#f3f4f6', borderRadius: '8px', padding: '0.4rem 0.75rem' }}
                            >
                                <Search size={18} color="#6b7280" />
                                <input name="search" placeholder="Search products..." style={{ border: 'none', background: 'transparent', outline: 'none', padding: '0.2rem 0.5rem', width: '100%', fontSize: '0.95rem', color: 'var(--text)' }} />
                            </form>
                        </div>

                        <div className="mobile-menu-links">
                            <Link to="/" className={`mobile-menu-link ${isActive('/')}`}>Home</Link>
                            <Link to="/shop" className={`mobile-menu-link ${isActive('/shop') && !location.search ? 'active' : ''}`}>Shop</Link>
                            <Link to="/shop?category=2" className={`mobile-menu-link ${location.search.includes('category=2') ? 'active' : ''}`}>Men's</Link>
                            <Link to="/shop?category=3" className={`mobile-menu-link ${location.search.includes('category=3') ? 'active' : ''}`}>Women's</Link>
                            <Link to="/shop?category=4" className={`mobile-menu-link ${location.search.includes('category=4') ? 'active' : ''}`}>Accessories</Link>
                            <Link to="/about" className={`mobile-menu-link ${isActive('/about')}`}>About Us</Link>
                        </div>

                        <div className="mobile-menu-divider" />

                        {user ? (
                            <div className="mobile-menu-links">
                                <Link to="/profile" className="mobile-menu-link" style={{ fontWeight: 600 }}>
                                    <User size={18} /> Hi, {user.name}
                                </Link>
                                <Link to="/orders" className="mobile-menu-link">Orders</Link>
                                <Link to="/wishlist" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>
                                    <Heart size={18} /> Wishlist {wishlist.length > 0 && `(${wishlist.length})`}
                                </Link>
                                <button className="mobile-menu-link" onClick={() => { setIsCartOpen(true); setMobileMenuOpen(false); }} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', color: 'inherit', fontSize: 'inherit', fontWeight: 'inherit' }}>
                                    <ShoppingBag size={18} /> Cart {cart.length > 0 && `(${cart.reduce((acc, item) => acc + item.quantity, 0)})`}
                                </button>
                                {user.is_admin && (
                                    <Link to="/admin" className="mobile-menu-link">Admin Dashboard</Link>
                                )}
                                <Link to="/settings/general" className="mobile-menu-link">
                                    <Settings size={18} /> Settings
                                </Link>
                                <div className="mobile-menu-divider" />
                                <button className="mobile-menu-link" onClick={() => { logout(); setMobileMenuOpen(false); }} style={{ color: '#dc3545', background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}>
                                    <LogOut size={18} /> Logout
                                </button>
                            </div>
                        ) : (
                            <div className="mobile-menu-links">
                                <Link to="/login" className="mobile-menu-link">
                                    <User size={18} /> Login / Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
