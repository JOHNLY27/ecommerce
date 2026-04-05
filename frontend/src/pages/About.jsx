import { motion } from 'framer-motion';
import { ShieldCheck, Gem, Leaf, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
};

const About = () => {
    return (
        <div style={{ backgroundColor: 'var(--bg)' }}>
            {/* Hero Section */}
            <section style={{
                position: 'relative',
                minHeight: '70vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundImage: 'url("https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: 'white',
                textAlign: 'center'
            }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 100%)' }}></div>
                <div className="container" style={{ position: 'relative', zIndex: 10 }}>
                    <motion.div initial="hidden" animate="visible" variants={fadeIn}>
                        <h1 style={{ fontSize: 'clamp(3rem, 5vw, 5rem)', marginBottom: '1rem', color: 'white', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 900 }}>Our Story</h1>
                        <p style={{ fontSize: '1.25rem', maxWidth: '800px', margin: '0 auto', color: '#e0e0e0', lineHeight: 1.6, fontWeight: 300 }}>
                            Elevating everyday luxury through meticulous craftsmanship, timeless design, and an uncompromising commitment to quality.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Heritage Section */}
            <section style={{ padding: '8rem 0' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap: 'clamp(2rem, 5vw, 5rem)', alignItems: 'center' }}>
                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
                            <div style={{ position: 'relative' }}>
                                <img
                                    src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
                                    alt="Fashion Craftsmanship"
                                    style={{ width: '100%', height: 'auto', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                                />
                                <div style={{ position: 'absolute', bottom: '-40px', right: '-40px', background: 'var(--text)', color: 'var(--bg)', padding: '2.5rem', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', border: '4px solid var(--bg)' }}>
                                    <h3 style={{ fontSize: '3rem', margin: '0 0 0.25rem', fontWeight: 900, lineHeight: 1 }}>10+</h3>
                                    <p style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem', fontWeight: 600, color: '#aaa' }}>Years of Excellence</p>
                                </div>
                            </div>
                        </motion.div>
                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
                            <h2 style={{ marginBottom: '1.5rem', fontSize: '3rem', color: 'var(--text)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 }}>The PrimeWear Standard.</h2>
                            <p style={{ marginBottom: '1.5rem', color: '#4b5563', fontSize: '1.15rem', lineHeight: 1.8 }}>
                                Founded with a singular passion for exceptional quality, PrimeWear seeks to redefine modern fashion by combining classic silhouettes with unapologetic contemporary sensibilities. 
                            </p>
                            <p style={{ color: '#4b5563', fontSize: '1.15rem', lineHeight: 1.8, marginBottom: '2.5rem' }}>
                                We believe that true luxury isn't just about a label; it lies purely in the details. The perfect stitch, the finest imported fabric, and the impeccable, tailored fit. Every piece in our collection is thoughtfully curated to empower you, allowing your unique style to speak volumes before you even say a word.
                            </p>
                            <img src="https://upload.wikimedia.org/wikipedia/commons/preview/f/f3/Signature_of_John_Hancock.svg" alt="Founder Signature" style={{ height: '45px', opacity: 0.6, filter: 'grayscale(1) invert(0)', mixBlendMode: 'multiply' }} />
                            <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: '#111', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>John Doe, Founder & CEO</p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Core Values Section */}
            <section style={{ padding: '8rem 0', backgroundColor: '#fcfcfc', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '4rem', color: 'var(--text)' }}>Our Core Values</h2>
                    </motion.div>
                    
                    <motion.div 
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '3rem' }}
                        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
                    >
                        <motion.div variants={fadeIn} style={{ padding: '3.5rem 2rem', backgroundColor: '#fff', borderRadius: '24px', boxShadow: '0 15px 40px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.02)', transition: 'transform 0.3s' }} onMouseOver={e=>e.currentTarget.style.transform='translateY(-10px)'} onMouseOut={e=>e.currentTarget.style.transform='translateY(0)'}>
                            <div style={{ width: '80px', height: '80px', margin: '0 auto 1.5rem', backgroundColor: '#f0f9ff', border: '1px solid #e0f2fe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9' }}>
                                <Gem size={36} strokeWidth={1.5} />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 800 }}>Uncompromising Quality</h3>
                            <p style={{ color: '#6b7280', lineHeight: 1.7, fontSize: '1.05rem' }}>We source only the finest fabrics from globally renowned mills, ensuring every garment feels incredible and lasts for generations.</p>
                        </motion.div>

                        <motion.div variants={fadeIn} style={{ padding: '3.5rem 2rem', backgroundColor: '#fff', borderRadius: '24px', boxShadow: '0 15px 40px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.02)', transition: 'transform 0.3s' }} onMouseOver={e=>e.currentTarget.style.transform='translateY(-10px)'} onMouseOut={e=>e.currentTarget.style.transform='translateY(0)'}>
                            <div style={{ width: '80px', height: '80px', margin: '0 auto 1.5rem', backgroundColor: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
                                <Leaf size={36} strokeWidth={1.5} />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 800 }}>Sustainable Practices</h3>
                            <p style={{ color: '#6b7280', lineHeight: 1.7, fontSize: '1.05rem' }}>Fashion shouldn't cost the earth. We are continuously innovating our supply chain to reduce waste and carbon footprint dynamically.</p>
                        </motion.div>

                        <motion.div variants={fadeIn} style={{ padding: '3.5rem 2rem', backgroundColor: '#fff', borderRadius: '24px', boxShadow: '0 15px 40px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.02)', transition: 'transform 0.3s' }} onMouseOver={e=>e.currentTarget.style.transform='translateY(-10px)'} onMouseOut={e=>e.currentTarget.style.transform='translateY(0)'}>
                            <div style={{ width: '80px', height: '80px', margin: '0 auto 1.5rem', backgroundColor: '#faf5ff', border: '1px solid #f3e8ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}>
                                <ShieldCheck size={36} strokeWidth={1.5} />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 800 }}>Customer First</h3>
                            <p style={{ color: '#6b7280', lineHeight: 1.7, fontSize: '1.05rem' }}>Your satisfaction drives our innovation. We offer personalized styling support and a seamless return policy to guarantee happiness.</p>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={{ padding: '10rem 0', backgroundColor: 'var(--text)', color: 'var(--bg)', textAlign: 'center' }}>
                <div className="container">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
                        <h2 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>Ready to elevate your wardrobe?</h2>
                        <p style={{ fontSize: '1.25rem', color: '#9ca3af', marginBottom: '3.5rem', maxWidth: '600px', margin: '0 auto 3.5rem', lineHeight: 1.6 }}>
                            Discover our latest arrivals and experience the sheer difference of PrimeWear craftsmanship for yourself.
                        </p>
                        <Link to="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '1.25rem 3rem', backgroundColor: 'var(--bg)', color: 'var(--text)', fontWeight: 800, borderRadius: '50px', textDecoration: 'none', transition: 'transform 0.3s, box-shadow 0.3s' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 15px 30px rgba(255,255,255,0.15)'; }} onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                            Explore Collection <ArrowRight size={20} />
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default About;
