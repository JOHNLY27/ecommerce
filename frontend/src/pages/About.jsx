import { motion } from 'framer-motion';

const About = () => {
    return (
        <div>
            <section style={{
                position: 'relative',
                minHeight: '60vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundImage: 'url("https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                color: 'white',
                textAlign: 'center'
            }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)' }}></div>
                <div className="container" style={{ position: 'relative', zIndex: 10 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 style={{ fontSize: '4rem', marginBottom: '1rem', color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em' }}>About PrimeWear</h1>
                        <p style={{ fontSize: '1.25rem', maxWidth: '800px', margin: '0 auto', color: '#e0e0e0' }}>
                            Elevating everyday luxury through meticulous craftsmanship and timeless design.
                        </p>
                    </motion.div>
                </div>
            </section>

            <section style={{ padding: '6rem 0', backgroundColor: 'var(--bg)' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>
                        <div>
                            <img
                                src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
                                alt="Fashion Craftsmanship"
                                style={{ width: '100%', height: 'auto', borderRadius: 'var(--radius)' }}
                            />
                        </div>
                        <div>
                            <h2 style={{ marginBottom: '1.5rem', fontSize: '2.5rem', color: 'var(--primary)' }}>Our Heritage</h2>
                            <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)', fontSize: '1.125rem' }}>
                                Founded with a passion for exceptional quality, PrimeWear seeks to redefine modern fashion by combining classic silhouettes with contemporary sensibilities. We believe that true luxury lies in the details—the perfect stitch, the finest fabric, the impeccable fit.
                            </p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>
                                Every piece in our collection is thoughtfully curated to empower you, allowing your unique style to speak volumes. Welcome to the world of PrimeWear, where elegance meets everyday ease.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
