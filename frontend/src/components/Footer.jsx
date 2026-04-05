import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="footer" style={{ backgroundColor: 'var(--primary)', color: 'white', padding: 'clamp(3rem, 6vw, 5rem) 0 clamp(2rem, 4vw, 3rem)' }}>
            <div className="container">
                <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'clamp(2rem, 4vw, 4rem)', marginBottom: '4rem' }}>

                    {/* Brand Info */}
                    <div className="footer-brand">
                        <h3 style={{ fontSize: '1.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1.5rem', color: 'var(--accent)', fontWeight: 800 }}>PrimeWear</h3>
                        <p style={{ color: '#aaa', marginBottom: '2rem', lineHeight: '1.8', fontSize: '0.95rem' }}>
                            Redefining modern luxury. Discover exclusive collections crafted for the contemporary individual.
                        </p>
                        <div style={{ display: 'flex', gap: '1.25rem' }}>
                            <a href="#" style={{ color: 'white', transition: 'all 0.3s' }} onMouseOver={(e) => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-3px)'; }} onMouseOut={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                                <Facebook size={22} />
                            </a>
                            <a href="#" style={{ color: 'white', transition: 'all 0.3s' }} onMouseOver={(e) => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-3px)'; }} onMouseOut={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                                <Twitter size={22} />
                            </a>
                            <a href="#" style={{ color: 'white', transition: 'all 0.3s' }} onMouseOver={(e) => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-3px)'; }} onMouseOut={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                                <Instagram size={22} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-links">
                        <h4 style={{ fontSize: '1.1rem', marginBottom: '1.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Quick Links</h4>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <li><Link to="/" style={{ color: '#aaa', textDecoration: 'none', transition: 'color 0.2s', fontSize: '0.95rem' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent)'} onMouseOut={(e) => e.currentTarget.style.color = '#aaa'}>Home</Link></li>
                            <li><Link to="/shop" style={{ color: '#aaa', textDecoration: 'none', transition: 'color 0.2s', fontSize: '0.95rem' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent)'} onMouseOut={(e) => e.currentTarget.style.color = '#aaa'}>Shop</Link></li>
                            <li><Link to="/about" style={{ color: '#aaa', textDecoration: 'none', transition: 'color 0.2s', fontSize: '0.95rem' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent)'} onMouseOut={(e) => e.currentTarget.style.color = '#aaa'}>About Us</Link></li>
                            <li><Link to="/login" style={{ color: '#aaa', textDecoration: 'none', transition: 'color 0.2s', fontSize: '0.95rem' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent)'} onMouseOut={(e) => e.currentTarget.style.color = '#aaa'}>My Account</Link></li>
                        </ul>
                    </div>

                    {/* Customer Care */}
                    <div className="footer-links">
                        <h4 style={{ fontSize: '1.1rem', marginBottom: '1.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Customer Care</h4>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <li><a href="#" style={{ color: '#aaa', textDecoration: 'none', transition: 'color 0.2s', fontSize: '0.95rem' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent)'} onMouseOut={(e) => e.currentTarget.style.color = '#aaa'}>FAQ</a></li>
                            <li><a href="#" style={{ color: '#aaa', textDecoration: 'none', transition: 'color 0.2s', fontSize: '0.95rem' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent)'} onMouseOut={(e) => e.currentTarget.style.color = '#aaa'}>Shipping & Returns</a></li>
                            <li><a href="#" style={{ color: '#aaa', textDecoration: 'none', transition: 'color 0.2s', fontSize: '0.95rem' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent)'} onMouseOut={(e) => e.currentTarget.style.color = '#aaa'}>Size Guide</a></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="footer-contact">
                        <h4 style={{ fontSize: '1.1rem', marginBottom: '1.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Contact Us</h4>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', color: '#aaa' }}>
                                <MapPin size={22} style={{ color: 'var(--accent)', marginTop: '0.1rem', flexShrink: 0 }} />
                                <span style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>Buhangin, Butuan City, Agusan del Norte, 8600</span>
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#aaa' }}>
                                <Phone size={20} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                                <span style={{ fontSize: '0.95rem' }}>+63 994 947 9270</span>
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#aaa' }}>
                                <Mail size={20} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                                <span style={{ fontSize: '0.95rem' }}>support@primewear.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                    <p style={{ color: '#777', fontSize: '0.85rem' }}>
                        &copy; {new Date().getFullYear()} PrimeWear. All rights reserved.
                    </p>
                    <div style={{ display: 'flex', gap: '1.5rem', color: '#777', fontSize: '0.85rem' }}>
                        <a href="#" style={{ color: '#777', textDecoration: 'none' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent)'} onMouseOut={(e) => e.currentTarget.style.color = '#777'}>Privacy Policy</a>
                        <a href="#" style={{ color: '#777', textDecoration: 'none' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent)'} onMouseOut={(e) => e.currentTarget.style.color = '#777'}>Terms of Service</a>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                @media (max-width: 600px) {
                    .footer-bottom {
                        flex-direction: column !important;
                        text-align: center !important;
                        justify-content: center !important;
                    }
                    .footer-grid {
                        text-align: center !important;
                    }
                    .footer-grid > div {
                        display: flex !important;
                        flex-direction: column !important;
                        align-items: center !important;
                    }
                    .footer-contact ul li {
                        justify-content: center !important;
                    }
                }
            `}} />
        </footer>
    );
};

export default Footer;
