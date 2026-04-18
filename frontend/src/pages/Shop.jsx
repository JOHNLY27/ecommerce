import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Search, Star, Heart, Filter, ChevronDown } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchParams] = useSearchParams();
    const initialCategory = searchParams.get('category') === 'new' ? 'new' : (Number(searchParams.get('category')) || null);
    const [activeCategory, setActiveCategory] = useState(initialCategory);
    const initialSubcategory = searchParams.get('subcategory') || null;
    const [activeSubcategory, setActiveSubcategory] = useState(initialSubcategory);
    
    const initialSearch = searchParams.get('search') || '';
    const [searchInput, setSearchInput] = useState(initialSearch);
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [minPriceQuery, setMinPriceQuery] = useState('');
    const [maxPriceQuery, setMaxPriceQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const { addToCart } = useContext(CartContext);
    const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
    const navigate = useNavigate();
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    useEffect(() => {
        const cat = searchParams.get('category');
        setActiveCategory(cat === 'new' ? 'new' : (Number(cat) || null));
        setActiveSubcategory(searchParams.get('subcategory') || null);
        
        const q = searchParams.get('search');
        if (q !== null) {
            setSearchInput(q);
            setSearchQuery(q);
        }
    }, [searchParams]);

    // Live search debounce
    useEffect(() => {
        const handler = setTimeout(() => {
            setSearchQuery(searchInput);
            setMinPriceQuery(minPrice);
            setMaxPriceQuery(maxPrice);
        }, 400); // 400ms delay for live typing

        return () => clearTimeout(handler);
    }, [searchInput, minPrice, maxPrice]);

    useEffect(() => {
        fetchCategories();
        fetchProducts();
    }, [activeCategory, activeSubcategory, searchQuery, minPriceQuery, maxPriceQuery]);

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
            if (activeSubcategory) {
                params.append('subcategory', activeSubcategory);
            }
            if (searchQuery) {
                params.append('search', searchQuery);
            }
            if (minPriceQuery) params.append('min_price', minPriceQuery);
            if (maxPriceQuery) params.append('max_price', maxPriceQuery);
            
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
                padding: '8rem 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundImage: 'url("https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: 'white',
                textAlign: 'center',
                marginBottom: '4rem'
            }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.8))' }}></div>
                <div className="container" style={{ position: 'relative', zIndex: 10 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                <h1 style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', marginBottom: '1rem', color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Our Collection</h1>
                        <p style={{ fontSize: 'clamp(0.9rem, 2vw, 1.25rem)', maxWidth: '800px', margin: '0 auto', color: '#e0e0e0' }}>
                            Explore our curated selection of premium apparel and accessories.
                        </p>
                    </motion.div>
                </div>
            </section>

            <div className="container" style={{ paddingBottom: '4rem' }}>
                
                {/* Mobile Filter Toggle */}
                <button 
                    className="shop-mobile-filter-toggle"
                    onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                    style={{
                        display: 'none',
                        width: '100%',
                        padding: '0.85rem 1rem',
                        backgroundColor: '#fff',
                        border: '1px solid #eaeaea',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '1rem',
                        fontWeight: 600,
                        fontFamily: 'inherit',
                        marginBottom: '1rem'
                    }}
                >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Filter size={18} /> Filters & Categories</span>
                    <ChevronDown size={18} style={{ transform: mobileFiltersOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>

                <div className="shop-layout" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>

                {/* Sidebar Filters */}
                <aside className={`shop-sidebar ${mobileFiltersOpen ? 'open' : ''}`} style={{ width: '280px', flexShrink: 0, backgroundColor: 'var(--bg)', padding: '2rem', borderRadius: '24px', border: '1px solid var(--border)', position: 'sticky', top: '2rem', boxShadow: '0 15px 40px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                        <Filter size={20} />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: 'var(--text)' }}>Filters</h3>
                    </div>
                    
                    <div>
                        <div style={{ marginBottom: '2.5rem' }}>
                            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Search</h4>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <Search size={18} color="#888" style={{ position: 'absolute', left: '16px' }} />
                                <input type="text" placeholder="Search items..." value={searchInput} onChange={e => setSearchInput(e.target.value)} style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 3rem', borderRadius: '50px', border: '1px solid var(--border)', outline: 'none', fontSize: '0.95rem', backgroundColor: 'var(--bg-secondary)', transition: 'border-color 0.2s, box-shadow 0.2s', color: 'var(--text)' }} onFocus={e => { e.target.style.borderColor = 'var(--text)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,0,0,0.05)'; }} onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }} />
                            </div>
                        </div>

                        <div style={{ marginBottom: '2.5rem' }}>
                            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Categories</h4>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                <li>
                                    <button type="button" onClick={() => { setActiveCategory(null); setSearchInput(''); setSearchQuery(''); setMinPrice(''); setMaxPrice(''); setMinPriceQuery(''); setMaxPriceQuery(''); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', padding: '0.75rem 1rem', color: activeCategory === null ? 'var(--text)' : 'var(--text-muted)', fontWeight: activeCategory === null ? 700 : 500, cursor: 'pointer', textAlign: 'left', width: '100%', fontSize: '1rem', borderRadius: '12px', backgroundColor: activeCategory === null ? 'var(--bg-secondary)' : 'transparent', transition: 'all 0.2s' }} onMouseOver={e => { if (activeCategory !== null) e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'; }} onMouseOut={e => { if (activeCategory !== null) e.currentTarget.style.backgroundColor = 'transparent'; }}>
                                        <span>All Items</span>
                                        {activeCategory === null && <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--text)' }}></div>}
                                    </button>
                                </li>
                                <li>
                                    <button type="button" onClick={() => { setActiveCategory('new'); setSearchInput(''); setSearchQuery(''); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', padding: '0.75rem 1rem', color: activeCategory === 'new' ? 'var(--text)' : 'var(--text-muted)', fontWeight: activeCategory === 'new' ? 700 : 500, cursor: 'pointer', textAlign: 'left', width: '100%', fontSize: '1rem', borderRadius: '12px', backgroundColor: activeCategory === 'new' ? 'var(--bg-secondary)' : 'transparent', transition: 'all 0.2s' }} onMouseOver={e => { if (activeCategory !== 'new') e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'; }} onMouseOut={e => { if (activeCategory !== 'new') e.currentTarget.style.backgroundColor = 'transparent'; }}>
                                        <span>New Arrivals</span>
                                        {activeCategory === 'new' && <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--text)' }}></div>}
                                    </button>
                                </li>
                                {categories.map(c => (
                                    <li key={c.id}>
                                        <button type="button" onClick={() => { setActiveCategory(c.id); setActiveSubcategory(null); setSearchInput(''); setSearchQuery(''); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', padding: '0.75rem 1rem', color: activeCategory === c.id ? 'var(--text)' : 'var(--text-muted)', fontWeight: activeCategory === c.id ? 700 : 500, cursor: 'pointer', textAlign: 'left', width: '100%', fontSize: '1rem', borderRadius: '12px', backgroundColor: activeCategory === c.id ? 'var(--bg-secondary)' : 'transparent', transition: 'all 0.2s' }} onMouseOver={e => { if (activeCategory !== c.id) e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'; }} onMouseOut={e => { if (activeCategory !== c.id) e.currentTarget.style.backgroundColor = 'transparent'; }}>
                                            <span>{c.name}</span>
                                            {activeCategory === c.id && <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--text)' }}></div>}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div style={{ marginBottom: '2.5rem' }}>
                            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price Range</h4>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888', fontSize: '1rem', fontWeight: 600 }}>$</span>
                                    <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} style={{ width: '100%', padding: '0.75rem 0.5rem 0.75rem 1.6rem', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none', fontSize: '0.95rem', backgroundColor: 'var(--bg)', transition: 'border-color 0.2s', color: 'var(--text)' }} onFocus={e => e.target.style.borderColor = 'var(--text)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                                </div>
                                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>-</span>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888', fontSize: '1rem', fontWeight: 600 }}>$</span>
                                    <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} style={{ width: '100%', padding: '0.75rem 0.5rem 0.75rem 1.6rem', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none', fontSize: '0.95rem', backgroundColor: 'var(--bg)', transition: 'border-color 0.2s', color: 'var(--text)' }} onFocus={e => e.target.style.borderColor = 'var(--text)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                <div style={{ flex: 1, width: '100%' }}>
                    
                    {/* Subcategory Tabs based on Category */}
                    {(activeCategory === 2 || activeCategory === 3) && (
                        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginBottom: '2rem', borderBottom: '1px solid #eaeaea' }}>
                            <button
                                onClick={() => setActiveSubcategory(activeSubcategory === 'Tops' ? null : 'Tops')}
                                style={{
                                    background: 'none', border: 'none', fontSize: '1.25rem', padding: '0.5rem 1rem', cursor: 'pointer', outline: 'none',
                                    fontWeight: activeSubcategory === 'Tops' ? 600 : 400,
                                    color: activeSubcategory === 'Tops' ? '#e53e3e' : '#333',
                                    borderBottom: activeSubcategory === 'Tops' ? '2px solid #e53e3e' : '2px solid transparent',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Tops
                            </button>
                            <button
                                onClick={() => setActiveSubcategory(activeSubcategory === 'Bottoms' ? null : 'Bottoms')}
                                style={{
                                    background: 'none', border: 'none', fontSize: '1.25rem', padding: '0.5rem 1rem', cursor: 'pointer', outline: 'none',
                                    fontWeight: activeSubcategory === 'Bottoms' ? 600 : 400,
                                    color: activeSubcategory === 'Bottoms' ? '#e53e3e' : '#333',
                                    borderBottom: activeSubcategory === 'Bottoms' ? '2px solid #e53e3e' : '2px solid transparent',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Bottoms
                            </button>
                        </div>
                    )}

                    {activeCategory === 4 && (
                        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginBottom: '2rem', borderBottom: '1px solid #eaeaea' }}>
                            <button
                                onClick={() => setActiveSubcategory(activeSubcategory === "Men's" ? null : "Men's")}
                                style={{
                                    background: 'none', border: 'none', fontSize: '1.25rem', padding: '0.5rem 1rem', cursor: 'pointer', outline: 'none',
                                    fontWeight: activeSubcategory === "Men's" ? 600 : 400,
                                    color: activeSubcategory === "Men's" ? '#e53e3e' : '#333',
                                    borderBottom: activeSubcategory === "Men's" ? '2px solid #e53e3e' : '2px solid transparent',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Men's
                            </button>
                            <button
                                onClick={() => setActiveSubcategory(activeSubcategory === "Women's" ? null : "Women's")}
                                style={{
                                    background: 'none', border: 'none', fontSize: '1.25rem', padding: '0.5rem 1rem', cursor: 'pointer', outline: 'none',
                                    fontWeight: activeSubcategory === "Women's" ? 600 : 400,
                                    color: activeSubcategory === "Women's" ? '#e53e3e' : '#333',
                                    borderBottom: activeSubcategory === "Women's" ? '2px solid #e53e3e' : '2px solid transparent',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Women's
                            </button>
                        </div>
                    )}

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '4rem' }}>Loading...</div>
                    ) : (
                        <>
                            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{products.length} Products Found</h2>
                            </div>
                            {products.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>No products found matching your criteria.</div>
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
                                            <div className="product-image-container" onClick={() => navigate(`/product/${product.id}`)} style={{ cursor: 'pointer', position: 'relative', borderRadius: '16px' }}>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                                                    style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10, background: isInWishlist(product.id) ? 'var(--primary)' : 'rgba(255,255,255,0.95)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', transition: 'all 0.3s' }}
                                                    title={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                                                    onMouseOver={e => e.currentTarget.style.transform='scale(1.1)'}
                                                    onMouseOut={e => e.currentTarget.style.transform='scale(1)'}
                                                >
                                                    <Heart size={20} color={isInWishlist(product.id) ? '#fff' : '#444'} fill={isInWishlist(product.id) ? '#fff' : 'transparent'} />
                                                </button>
                                                <img src={(product.images && product.images.length > 0) ? (product.images[0].startsWith('http') ? product.images[0] : (product.images[0].startsWith('/storage') ? `${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'}${product.images[0]}` : `${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'}/storage/${product.images[0]}`)) : (product.image_url || 'https://via.placeholder.com/400x500')} alt={product.name} className="product-image" style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover' }} />
                                                {product.is_sale && (
                                                    <div style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: 'var(--primary)', color: 'var(--bg)', padding: '0.4rem 0.8rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 800, zIndex: 2, letterSpacing: '0.05em' }}>
                                                        SALE
                                                    </div>
                                                )}
                                                <div className="view-details-overlay">
                                                     <span className="overlay-btn">View Details</span>
                                                </div>
                                            </div>
                                            <div className="product-info">
                                                <div>
                                                    <h3 className="product-title" onClick={() => navigate(`/product/${product.id}`)} style={{ cursor: 'pointer' }}>{product.name}</h3>
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
                                                <div className="product-price">₱{Number(product.price).toFixed(2)}</div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>

            {/* Mobile responsive & dynamic styles for shop */}
            <style dangerouslySetInnerHTML={{__html: `
                .product-image-container { position: relative; overflow: hidden; }
                .product-image-container .product-image { transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
                .product-image-container:hover .product-image { transform: scale(1.08); }
                .product-image-container .view-details-overlay {
                    position: absolute; top: 0; left: 0; right: 0; bottom: 0;
                    background-color: rgba(0,0,0,0.2); opacity: 0;
                    display: flex; align-items: center; justify-content: center;
                    transition: opacity 0.4s;
                }
                .product-image-container:hover .view-details-overlay { opacity: 1 !important; }
                .product-image-container .overlay-btn {
                    background-color: var(--bg); color: var(--text); padding: 0.8rem 1.8rem;
                    border-radius: 50px; font-weight: 700;
                    transform: translateY(15px); transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                }
                .product-image-container:hover .overlay-btn { transform: translateY(0) !important; }

                @media (max-width: 900px) {
                    .shop-mobile-filter-toggle {
                        display: flex !important;
                    }
                    .shop-layout {
                        flex-direction: column !important;
                        gap: 0 !important;
                    }
                    .shop-sidebar {
                        width: 100% !important;
                        position: static !important;
                        display: none;
                        margin-bottom: 2rem;
                    }
                    .shop-sidebar.open {
                        display: block;
                    }
                }
            `}} />
        </div>
    );
};

export default Shop;
