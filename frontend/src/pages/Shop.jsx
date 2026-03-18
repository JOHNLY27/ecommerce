import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ShoppingCart, Eye, Search, Star } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchParams] = useSearchParams();
    const initialCategory = searchParams.get('category') === 'new' ? 'new' : (Number(searchParams.get('category')) || null);
    const [activeCategory, setActiveCategory] = useState(initialCategory);
    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const { addToCart } = useContext(CartContext);
    const navigate = useNavigate();

    useEffect(() => {
        const cat = searchParams.get('category');
        setActiveCategory(cat === 'new' ? 'new' : (Number(cat) || null));
    }, [searchParams]);

    useEffect(() => {
        fetchCategories();
        fetchProducts();
    }, [activeCategory, searchQuery]);

    const fetchCategories = async () => {
        try {
            const res = await axios.get('/categories');
            setCategories(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            let url = '/products';
            const params = new URLSearchParams();
            if (activeCategory === 'new') {
                params.append('sort', 'new');
            } else if (activeCategory) {
                params.append('category_id', activeCategory);
            }
            if (searchQuery) {
                params.append('search', searchQuery);
            }
            if (params.toString()) {
                url += `?${params.toString()}`;
            }
            const res = await axios.get(url);
            setProducts(res.data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    return (
        <div>
            <section style={{
                position: 'relative',
                padding: '6rem 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundImage: 'url("https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                color: 'white',
                textAlign: 'center',
                marginBottom: '4rem'
            }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)' }}></div>
                <div className="container" style={{ position: 'relative', zIndex: 10 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 style={{ fontSize: '4rem', marginBottom: '1rem', color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Our Collection</h1>
                        <p style={{ fontSize: '1.25rem', maxWidth: '800px', margin: '0 auto', color: '#e0e0e0' }}>
                            Explore our curated selection of premium apparel and accessories.
                        </p>
                    </motion.div>
                </div>
            </section>

            <div className="container" style={{ paddingBottom: '4rem' }}>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '3rem' }}>
                    <form 
                        onSubmit={(e) => { e.preventDefault(); setSearchQuery(searchInput); }} 
                        style={{ display: 'flex', justifyContent: 'center', maxWidth: '500px', margin: '0 auto', width: '100%' }}
                    >
                        <input 
                            type="text" 
                            placeholder="Search products..." 
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '5px 0 0 5px', border: '1px solid #ccc', outline: 'none' }}
                        />
                        <button type="submit" className="btn btn-primary" style={{ borderRadius: '0 5px 5px 0', padding: '0.75rem 1.5rem', border: 'none' }}>
                            <Search size={20} />
                        </button>
                    </form>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                        className={`btn ${activeCategory === null ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => { setActiveCategory(null); setSearchInput(''); setSearchQuery(''); }}
                    >
                        All Items
                    </button>
                    <button
                        className={`btn ${activeCategory === 'new' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => { setActiveCategory('new'); setSearchInput(''); setSearchQuery(''); }}
                    >
                        New Arrivals
                    </button>
                    {categories.map(c => (
                        <button
                            key={c.id}
                            className={`btn ${activeCategory === c.id ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => { setActiveCategory(c.id); setSearchInput(''); setSearchQuery(''); }}
                        >
                            {c.name}
                        </button>
                    ))}
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem' }}>Loading...</div>
                ) : (
                    <motion.div
                        className="product-grid"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ staggerChildren: 0.1 }}
                    >
                        {products.map(product => (
                            <motion.div
                                key={product.id}
                                className="product-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div className="product-image-container">
                                    <img src={product.image_url} alt={product.name} className="product-image" />
                                    {product.is_sale && (
                                        <div style={{ position: 'absolute', top: '8px', left: '8px', backgroundColor: '#c62828', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                                            SALE
                                        </div>
                                    )}
                                    <div className="product-overlay">
                                        <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navigate(`/product/${product.id}`)}>
                                            <Eye size={18} /> View Details
                                        </button>
                                    </div>
                                </div>
                                <div className="product-info">
                                    <div>
                                        <h3 className="product-title">{product.name}</h3>
                                        <span className="product-category">{product.category?.name}</span>
                                        {/* Rating Display */}
                                        {product.reviews_count > 0 && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                                                <div style={{ display: 'flex', gap: '1px' }}>
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            size={12}
                                                            style={{
                                                                fill: star <= Math.round(product.average_rating) ? '#ffc107' : 'transparent',
                                                                stroke: star <= Math.round(product.average_rating) ? '#ffc107' : '#ddd',
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                                <span style={{ fontSize: '0.75rem', color: '#666' }}>({product.reviews_count})</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="product-price">${Number(product.price).toFixed(2)}</div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Shop;
