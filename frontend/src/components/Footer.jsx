import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
    return (
        <footer style={{ backgroundColor: 'var(--primary)', color: 'white', paddingTop: '4rem', paddingBottom: '2rem' }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>

                    {/* Brand Info */}
                    <div>
                        <h3 style={{ fontSize: '1.5rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1.5rem', color: 'var(--accent)' }}>PrimeWear</h3>
                        <p style={{ color: '#a0a0a0', marginBottom: '1.5rem', lineHeight: '1.8' }}>
                            Redefining modern luxury. Discover exclusive collections crafted for the contemporary individual.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <a href="#" style={{ color: 'white', transition: 'color 0.3s' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent)'} onMouseOut={(e) => e.currentTarget.style.color = 'white'}>
                                <Facebook size={20} />
                            </a>
                            <a href="#" style={{ color: 'white', transition: 'color 0.3s' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent)'} onMouseOut={(e) => e.currentTarget.style.color = 'white'}>
                                <Twitter size={20} />
                            </a>
                            <a href="#" style={{ color: 'white', transition: 'color 0.3s' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent)'} onMouseOut={(e) => e.currentTarget.style.color = 'white'}>
                                <Instagram size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 style={{ fontSize: '1.125rem', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quick Links</h4>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <li><Link to="/" style={{ color: '#a0a0a0', textDecoration: 'none' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent)'} onMouseOut={(e) => e.currentTarget.style.color = '#a0a0a0'}>Home</Link></li>
                            <li><Link to="/shop" style={{ color: '#a0a0a0', textDecoration: 'none' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent)'} onMouseOut={(e) => e.currentTarget.style.color = '#a0a0a0'}>Shop</Link></li>
                            <li><Link to="/about" style={{ color: '#a0a0a0', textDecoration: 'none' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent)'} onMouseOut={(e) => e.currentTarget.style.color = '#a0a0a0'}>About Us</Link></li>
                            <li><Link to="/login" style={{ color: '#a0a0a0', textDecoration: 'none' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent)'} onMouseOut={(e) => e.currentTarget.style.color = '#a0a0a0'}>My Account</Link></li>
                        </ul>
                    </div>

                    {/* Customer Care */}
                    <div>
                        <h4 style={{ fontSize: '1.125rem', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer Care</h4>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <li><a href="#" style={{ color: '#a0a0a0', textDecoration: 'none' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent)'} onMouseOut={(e) => e.currentTarget.style.color = '#a0a0a0'}>FAQ</a></li>
                            <li><a href="#" style={{ color: '#a0a0a0', textDecoration: 'none' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent)'} onMouseOut={(e) => e.currentTarget.style.color = '#a0a0a0'}>Shipping & Returns</a></li>
                            <li><a href="#" style={{ color: '#a0a0a0', textDecoration: 'none' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent)'} onMouseOut={(e) => e.currentTarget.style.color = '#a0a0a0'}>Size Guide</a></li>
                            <li><a href="#" style={{ color: '#a0a0a0', textDecoration: 'none' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent)'} onMouseOut={(e) => e.currentTarget.style.color = '#a0a0a0'}>Contact Us</a></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 style={{ fontSize: '1.125rem', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact Us</h4>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: '#a0a0a0' }}>
                                <MapPin size={18} style={{ color: 'var(--accent)', marginTop: '0.2rem', flexShrink: 0 }} />
                                <span>Buhangin, Butuan City<br />AGUSAN DEL NORTE, 8600</span>
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#a0a0a0' }}>
                                <Phone size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                                <span>(63+)9949479270</span>
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#a0a0a0' }}>
                                <Mail size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                                <span>support@primewear.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid #333', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <p style={{ color: '#777', fontSize: '0.875rem' }}>
                        &copy; {new Date().getFullYear()} PrimeWear. All rights reserved.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', color: '#777', fontSize: '0.875rem' }}>
                        <a href="#" style={{ color: '#777', textDecoration: 'none' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent)'} onMouseOut={(e) => e.currentTarget.style.color = '#777'}>Privacy Policy</a>
                        <span>|</span>
                        <a href="#" style={{ color: '#777', textDecoration: 'none' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent)'} onMouseOut={(e) => e.currentTarget.style.color = '#777'}>Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
