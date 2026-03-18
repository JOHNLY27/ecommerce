import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = () => {
    return (
        <div>
            <section style={{
                position: 'relative',
                minHeight: '80vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundImage: 'url("https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                color: 'white',
                textAlign: 'center'
            }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' }}></div>
                <div className="container" style={{ position: 'relative', zIndex: 10 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 style={{ fontSize: '4.5rem', marginBottom: '1.5rem', color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.1 }}>Redefine Your Style</h1>
                        <p style={{ fontSize: '1.25rem', maxWidth: '800px', margin: '0 auto 2.5rem', color: '#e0e0e0', lineHeight: 1.6 }}>
                            Discover the latest trends in men's and women's fashion with PrimeWear. Premium quality, exclusive designs.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <Link to="/shop" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1rem' }}>Shop Collection</Link>
                            <Link to="/shop?category=new" className="btn btn-outline" style={{ color: 'white', borderColor: 'white', padding: '1rem 2.5rem', fontSize: '1rem' }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = 'var(--primary)'; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'white'; }}>New Arrivals</Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            <section style={{ padding: '6rem 0' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2>Featured Categories</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
                        <Link to="/shop?category=1" style={{ display: 'block', overflow: 'hidden', position: 'relative', aspectRatio: '4/5' }}>
                            <img src="https://images.unsplash.com/photo-1617137968427-85924c800a22?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="Men" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s', ':hover': { transform: 'scale(1.05)' } }} />
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '2rem', background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)', color: 'white' }}>
                                <h3>Men</h3>
                            </div>
                        </Link>
                        <Link to="/shop?category=2" style={{ display: 'block', overflow: 'hidden', position: 'relative', aspectRatio: '4/5' }}>
                            <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="Women" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} />
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '2rem', background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)', color: 'white' }}>
                                <h3>Women</h3>
                            </div>
                        </Link>
                        <Link to="/shop?category=3" style={{ display: 'block', overflow: 'hidden', position: 'relative', aspectRatio: '4/5' }}>
                            <img src="https://images.unsplash.com/photo-1509319117193-57bab727e09d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="Accessories" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} />
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '2rem', background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)', color: 'white' }}>
                                <h3>Accessories</h3>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
