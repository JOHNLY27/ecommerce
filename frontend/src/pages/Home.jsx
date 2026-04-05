import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Truck, ShieldCheck, RefreshCw, Award, Star, ArrowRight, Mail, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useContext } from 'react';
import { WishlistContext } from '../context/WishlistContext';

const Home = () => {
    const [trendingProducts, setTrendingProducts] = useState([]);
    const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
    const navigate = useNavigate();

    const [currentBg, setCurrentBg] = useState(0);
    const heroSlides = [
        {
            image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
            title: "Redefine Your Style",
            subtitle: "Discover the latest trends in fashion with PrimeWear. Premium quality, exclusive designs, unparalleled confidence.",
            buttons: [
                { text: "Shop Collection", link: "/shop", primary: true },
                { text: "New Arrivals", link: "/shop?category=new", primary: false }
            ]
        },
        {
            image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
            title: "Modern Essentials",
            subtitle: "Discover pieces that blend comfort and contemporary style seamlessly. Perfect for any occasion.",
            buttons: [
                { text: "Shop Essentials", link: "/shop?category=essentials", primary: true }
            ]
        },
        {
            image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
            title: "Premium Collection",
            subtitle: "Elevate your everyday style with our handcrafted statement pieces, designed to impress and built to last.",
            buttons: [
                { text: "Explore Now", link: "/shop?category=premium", primary: true }
            ]
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentBg((prev) => (prev + 1) % heroSlides.length);
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    const nextSlide = () => setCurrentBg((prev) => (prev + 1) % heroSlides.length);
    const prevSlide = () => setCurrentBg((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1));

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                // Fetch products specifically marked as Trending by Admin
                const res = await axios.get('/products?is_trending=1');
                const data = Array.isArray(res.data) ? res.data : [];
                setTrendingProducts(data.slice(0, 8));
            } catch (err) {
                console.error("Failed to fetch trending products", err);
            }
        };
        fetchTrending();
    }, []);

    const features = [
        { icon: <Truck size={36} strokeWidth={1.5} />, title: 'Free Shipping', desc: 'On all orders over $100' },
        { icon: <RefreshCw size={36} strokeWidth={1.5} />, title: '30-Day Returns', desc: 'Hassle-free exchange policy' },
        { icon: <ShieldCheck size={36} strokeWidth={1.5} />, title: 'Secure Checkout', desc: '100% encrypted payments' },
        { icon: <Award size={36} strokeWidth={1.5} />, title: 'Premium Quality', desc: 'Top-tier materials & design' },
    ];

    return (
        <div style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
            {/* HERO SECTION */}
            <section style={{
                position: 'relative',
                minHeight: '95vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                textAlign: 'center',
                padding: '2rem 0',
                overflow: 'hidden'
            }}>
                {heroSlides.map((slide, idx) => (
                    <div
                        key={idx}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundImage: `url("${slide.image}")`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            opacity: currentBg === idx ? 1 : 0,
                            transition: 'opacity 1.5s ease-in-out',
                            zIndex: 1
                        }}
                    />
                ))}
                {/* Premium Gradient Overlay instead of flat gray/black */}
                <div style={{ 
                    position: 'absolute', 
                    top: 0, left: 0, right: 0, bottom: 0, 
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(0, 0, 0, 0.3) 50%, rgba(15, 23, 42, 0.7) 100%)', 
                    zIndex: 2 
                }}></div>

                {/* Navigation Arrows */}
                <button onClick={prevSlide} style={{ position: 'absolute', left: 'clamp(1rem, 3vw, 3rem)', top: '50%', transform: 'translateY(-50%)', zIndex: 20, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', transition: 'all 0.3s' }} className="hero-nav-btn">
                    <ChevronLeft size={32} />
                </button>
                <button onClick={nextSlide} style={{ position: 'absolute', right: 'clamp(1rem, 3vw, 3rem)', top: '50%', transform: 'translateY(-50%)', zIndex: 20, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', transition: 'all 0.3s' }} className="hero-nav-btn">
                    <ChevronRight size={32} />
                </button>

                <div className="container" style={{ position: 'relative', zIndex: 10 }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentBg}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h1 style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)', marginBottom: '1.5rem', color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.1, fontWeight: 800 }}>{heroSlides[currentBg].title}</h1>
                            <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', maxWidth: '800px', margin: '0 auto 3rem', color: '#e0e0e0', lineHeight: 1.6 }}>
                                {heroSlides[currentBg].subtitle}
                            </p>
                            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                {heroSlides[currentBg].buttons.map((btn, bIdx) => (
                                    <Link key={bIdx} to={btn.link} className={btn.primary ? "btn btn-primary" : "btn btn-outline"} style={btn.primary ? { padding: '1.2rem 3rem', fontSize: '1.1rem', fontWeight: 600 } : { color: 'white', borderColor: 'white', padding: '1.2rem 3rem', fontSize: '1.1rem', fontWeight: 600 }} {...(!btn.primary ? { onMouseOver: (e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = 'var(--primary)'; }, onMouseOut: (e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'white'; } } : {})}>
                                        {btn.text}
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Pagination Dots */}
                <div style={{ position: 'absolute', bottom: '2.5rem', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '1rem', zIndex: 20 }}>
                    {heroSlides.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentBg(idx)}
                            style={{
                                width: currentBg === idx ? '32px' : '12px',
                                height: '12px',
                                borderRadius: '12px',
                                padding: 0,
                                border: 'none',
                                backgroundColor: currentBg === idx ? 'var(--primary)' : 'rgba(255,255,255,0.4)',
                                cursor: 'pointer',
                                transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                            }}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>
            </section>

            {/* TRUST BADGES / FEATURES SECTION */}
            <section style={{ padding: 'clamp(2rem, 4vw, 3rem) 0', backgroundColor: 'var(--bg-secondary)', position: 'relative', overflow: 'hidden' }}>
                <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1, duration: 0.6, type: 'spring', stiffness: 90 }}
                                className="feature-card"
                                style={{
                                    padding: 'clamp(1.5rem, 2vw, 2rem) clamp(1rem, 2vw, 1.5rem)',
                                    backgroundColor: 'var(--bg)',
                                    borderRadius: '20px',
                                    textAlign: 'center',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
                                    border: '1px solid rgba(0,0,0,0.03)',
                                    borderTop: '4px solid var(--primary)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                                }}
                            >
                                <div className="feature-icon-wrapper" style={{
                                    width: 'clamp(50px, 6vw, 60px)',
                                    height: 'clamp(50px, 6vw, 60px)',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, var(--primary) 0%, rgba(0,0,0,0.8) 100%)',
                                    color: 'white',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginBottom: '1rem',
                                    boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                                    transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                                }}>
                                    {feature.icon}
                                </div>
                                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>{feature.title}</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* TRENDING PRODUCTS SECTION */}
            <section style={{ padding: 'clamp(3rem, 6vw, 6rem) 0' }}>
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Trending Now</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Top picks for the season, updated daily.</p>
                        </div>
                        <Link to="/shop" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }} className="hover-underline">
                            View All <ArrowRight size={20} />
                        </Link>
                    </div>

                    {trendingProducts.length > 0 ? (
                        <div className="product-grid">
                            {trendingProducts.map((product, idx) => (
                                <motion.div
                                    key={product.id}
                                    className="product-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                                    onClick={() => navigate(`/product/${product.id}`)}
                                    style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                                >
                                    <div className="product-image-container" style={{ position: 'relative', overflow: 'hidden' }}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                                            style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10, background: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}
                                            title={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                                        >
                                            <Heart size={18} color={isInWishlist(product.id) ? '#dc3545' : '#666'} fill={isInWishlist(product.id) ? '#dc3545' : 'transparent'} />
                                        </button>
                                        <img src={(product.images && product.images.length > 0) ? (product.images[0].startsWith('http') ? product.images[0] : (product.images[0].startsWith('/storage') ? `${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'}${product.images[0]}` : `${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'}/storage/${product.images[0]}`)) : (product.image_url || 'https://via.placeholder.com/400x500')} alt={product.name} className="product-image" style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover' }} />
                                        {product.is_sale && (
                                            <div style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: '#c62828', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, zIndex: 2, letterSpacing: '0.05em' }}>
                                                SALE
                                            </div>
                                        )}
                                        <div className="view-details-overlay" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.2)', opacity: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.3s' }}>
                                            <span style={{ backgroundColor: 'white', color: 'black', padding: '0.8rem 1.5rem', borderRadius: '30px', fontWeight: 600, transform: 'translateY(10px)', transition: 'transform 0.3s' }} className="overlay-btn">View Details</span>
                                        </div>
                                    </div>
                                    <div className="product-info" style={{ padding: '1.5rem 1rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <h3 className="product-title" style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{product.name}</h3>
                                                    <span className="product-category" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{product.category?.name}</span>
                                                </div>
                                                <div className="product-price" style={{ fontSize: '1.1rem', fontWeight: 700 }}>${Number(product.price).toFixed(2)}</div>
                                            </div>
                                            {product.reviews_count > 0 && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.75rem' }}>
                                                    <div style={{ display: 'flex', gap: '1px' }}>
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <Star
                                                                key={star}
                                                                size={14}
                                                                style={{
                                                                    fill: star <= Math.round(product.average_rating) ? '#ffc107' : 'transparent',
                                                                    stroke: star <= Math.round(product.average_rating) ? '#ffc107' : '#ddd',
                                                                }}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span style={{ fontSize: '0.8rem', color: '#666' }}>({product.reviews_count})</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
                            <p style={{ color: 'var(--text-muted)' }}>Loading trending gear...</p>
                        </div>
                    )}
                </div>
            </section>

            {/* FEATURED CATEGORIES */}
            <section style={{ padding: 'clamp(4rem, 8vw, 8rem) 0', backgroundColor: 'var(--bg)' }}>
                <div className="container">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        style={{ textAlign: 'center', marginBottom: 'clamp(3rem, 5vw, 5rem)' }}
                    >
                        <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em', color: 'var(--text)' }}>Shop By Category</h2>
                        <div style={{ width: '60px', height: '4px', backgroundColor: 'var(--primary)', margin: '1rem auto' }}></div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Find exactly what you're looking for.</p>
                    </motion.div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: '2rem' }}>
                        {[
                            { id: 1, title: "Men", img: "https://images.unsplash.com/photo-1617137968427-85924c800a22?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" },
                            { id: 2, title: "Women", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" },
                            { id: 3, title: "Accessories", img: "https://images.unsplash.com/photo-1509319117193-57bab727e09d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" }
                        ].map((cat, idx) => (
                            <motion.div
                                key={cat.id}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.15, duration: 0.7, type: 'spring', stiffness: 80 }}
                            >
                                <Link to={`/shop?category=${cat.id}`} className="category-card" style={{ display: 'block', overflow: 'hidden', position: 'relative', aspectRatio: '3/4', borderRadius: '24px', boxShadow: '0 15px 35px rgba(0,0,0,0.1)' }}>
                                    <img src={cat.img} alt={cat.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }} className="zoom-hover-img" />
                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '2.5rem', transition: 'background 0.5s ease' }} className="cat-overlay">
                                        <h3 style={{ color: 'white', fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', transform: 'translateY(15px)', transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }} className="cat-title">{cat.title}</h3>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: '1.1rem', transform: 'translateY(15px)', opacity: 0, transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }} className="cat-link">
                                            Explore <ArrowRight size={20} className="cat-arrow" style={{ transition: 'transform 0.4s ease' }} />
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* NEWSLETTER SECTION */}
            <section style={{
                padding: 'clamp(5rem, 8vw, 8rem) 0',
                position: 'relative',
                backgroundImage: 'url("https://images.unsplash.com/photo-1558769132-cb1aea458c5e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 100%)' }}></div>
                <div className="container" style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: '800px' }}>
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                        <Mail size={56} style={{ color: 'white', marginBottom: '2rem', margin: '0 auto', opacity: 0.9 }} />
                    </motion.div>
                    <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1, duration: 0.5 }} style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'white', marginBottom: '1rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                        Join the PrimeWear VIP
                    </motion.h2>
                    <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.5 }} style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'clamp(1.1rem, 2vw, 1.3rem)', marginBottom: '3rem', lineHeight: 1.6 }}>
                        Be the first to access exclusive collections, early sales, and insider styling tips. Plus, receive 15% off your first luxury order.
                    </motion.p>
                    <motion.form initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3, duration: 0.5 }} style={{ display: 'flex', gap: '0.8rem', maxWidth: '600px', margin: '0 auto', flexWrap: 'wrap' }} onSubmit={(e) => { e.preventDefault(); alert("Thanks for subscribing!"); }}>
                        <input type="email" placeholder="Your email address" required style={{ flex: '1 1 250px', padding: '1.25rem 1.75rem', borderRadius: '50px', border: 'none', fontSize: '1.1rem', outline: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }} />
                        <button type="submit" style={{ padding: '1.25rem 2.5rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: 700, fontSize: '1.1rem', flex: '0 0 auto', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', transition: 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>Subscribe</button>
                    </motion.form>
                </div>
            </section>

            {/* Inline styles for dynamic hover effects */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .zoom-hover:hover {
                    transform: scale(1.08);
                }
                .feature-card:hover {
                    transform: translateY(-12px) !important;
                    box-shadow: 0 25px 50px rgba(0,0,0,0.1) !important;
                }
                .feature-card:hover .feature-icon-wrapper {
                    transform: scale(1.15) rotate(10deg) !important;
                    box-shadow: 0 15px 30px rgba(0,0,0,0.2) !important;
                }
                .product-image-container:hover .view-details-overlay {
                    opacity: 1 !important;
                }
                .product-image-container:hover .overlay-btn {
                    transform: translateY(0) !important;
                }
                .category-card:hover .zoom-hover-img {
                    transform: scale(1.08);
                }
                .category-card:hover .cat-overlay {
                    background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 60%, transparent 100%) !important;
                }
                .category-card:hover .cat-title {
                    transform: translateY(0) !important;
                }
                .category-card:hover .cat-link {
                    transform: translateY(0) !important;
                    opacity: 1 !important;
                    color: #fff !important;
                }
                .category-card:hover .cat-arrow {
                    transform: translateX(8px) !important;
                }
                .hero-nav-btn:hover {
                    background: rgba(255,255,255,0.3) !important;
                    transform: translateY(-50%) scale(1.1) !important;
                }
            `}} />
        </div>
    );
};

export default Home;
