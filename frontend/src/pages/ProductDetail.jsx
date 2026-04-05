import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, ArrowLeft, Check, X, Star, Heart } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import ReviewSection from '../components/ReviewSection';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useContext(CartContext);
    const { toggleWishlist, isInWishlist } = useContext(WishlistContext);

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const [relatedProducts, setRelatedProducts] = useState([]);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const res = await axios.get(`/products/${id}`);
            setProduct(res.data);
            // Set defaults for sizes/colors
            if (res.data.available_sizes && res.data.available_sizes.length > 0) {
                setSelectedSize(res.data.available_sizes[0]);
            } else if (res.data.sizes && res.data.sizes.length > 0) {
                setSelectedSize(res.data.sizes[0]);
            }
            if (res.data.available_colors && res.data.available_colors.length > 0) {
                setSelectedColor(res.data.available_colors[0]);
            } else if (res.data.colors && res.data.colors.length > 0) {
                setSelectedColor(res.data.colors[0]);
            }

            // Fetch related products
            if (res.data.category_id) {
                try {
                    const relatedRes = await axios.get(`/products?category_id=${res.data.category_id}`);
                    const related = relatedRes.data.filter(p => p.id !== res.data.id).slice(0, 4);
                    setRelatedProducts(related);
                } catch (e) {
                    console.error("Failed to fetch related products", e);
                }
            }

        } catch (err) {
            console.error("Error fetching product", err);
        }
        setLoading(false);
    };

    // Update selected variant when size/color changes
    useEffect(() => {
        if (product && product.variants && product.variants.length > 0) {
            const variant = product.variants.find(v => 
                v.size === selectedSize && v.color === selectedColor
            );
            setSelectedVariant(variant || null);
        }
    }, [selectedSize, selectedColor, product]);

    const [adding, setAdding] = useState(false);

    const handleAddToCart = async () => {
        // If product has variants, require variant selection
        if (product.variants && product.variants.length > 0) {
            if (!selectedVariant) {
                alert('Please select a valid size and color combination');
                return;
            }
            if (selectedVariant.stock_quantity === 0) {
                alert('This variant is out of stock');
                return;
            }
        } else {
            // Legacy: check sizes/colors
            if (product.sizes && product.sizes.length > 0 && !selectedSize) {
                alert('Please select a size');
                return;
            }
            if (product.colors && product.colors.length > 0 && !selectedColor) {
                alert('Please select a color');
                return;
            }
        }

        setAdding(true);
        try {
            const variantId = selectedVariant ? selectedVariant.id : null;
            await addToCart(product.id, quantity, selectedSize, selectedColor, variantId);
            alert('Added to cart!');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to add to cart');
        }
        setAdding(false);
    };

    // Get available stock
    const getAvailableStock = () => {
        if (selectedVariant) {
            return selectedVariant.stock_quantity;
        }
        if (product.variants && product.variants.length > 0) {
            // Sum of all matching variants or show message
            return null;
        }
        return product.stock_quantity;
    };

    // Get effective price
    const getEffectivePrice = () => {
        if (selectedVariant && selectedVariant.price) {
            return selectedVariant.price;
        }
        return product.price;
    };

    // Get available sizes for a selected color (from variants)
    const getAvailableSizes = () => {
        if (product.variants && product.variants.length > 0) {
            if (selectedColor) {
                return product.variants
                    .filter(v => v.color === selectedColor && v.stock_quantity > 0)
                    .map(v => v.size)
                    .filter(Boolean);
            }
            return product.available_sizes || [];
        }
        return product.sizes || [];
    };

    // Get available colors for a selected size (from variants)
    const getAvailableColors = () => {
        if (product.variants && product.variants.length > 0) {
            if (selectedSize) {
                return product.variants
                    .filter(v => v.size === selectedSize && v.stock_quantity > 0)
                    .map(v => v.color)
                    .filter(Boolean);
            }
            return product.available_colors || [];
        }
        return product.colors || [];
    };

    // Check if a size is available for the selected color
    const isSizeAvailable = (size) => {
        if (product.variants && product.variants.length > 0) {
            const variant = product.variants.find(v => 
                v.size === size && v.color === selectedColor
            );
            return variant && variant.stock_quantity > 0;
        }
        return true;
    };

    // Check if a color is available for the selected size
    const isColorAvailable = (color) => {
        if (product.variants && product.variants.length > 0) {
            const variant = product.variants.find(v => 
                v.color === color && v.size === selectedSize
            );
            return variant && variant.stock_quantity > 0;
        }
        return true;
    };

    if (loading) return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Loading...</div>;
    if (!product) return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Product not found.</div>;

    const availableStock = getAvailableStock();
    const effectivePrice = getEffectivePrice();
    const availableSizes = getAvailableSizes();
    const availableColors = getAvailableColors();

    return (
        <div className="container" style={{ padding: '4rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Lightbox Overlay */}
            {isZoomed && (() => {
                let imgs = [];
                if (selectedVariant && selectedVariant.image_url) imgs.push(selectedVariant.image_url);
                if (product.images && product.images.length > 0) {
                    imgs = [...imgs, ...product.images.map(img => img.startsWith('http') ? img : (img.startsWith('/storage') ? `${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'}${img}` : `${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'}/storage/${img}`))];
                } else if (product.image_url) {
                    if (!imgs.includes(product.image_url)) imgs.push(product.image_url);
                }
                if (imgs.length === 0) imgs = ['https://via.placeholder.com/400x500'];
                const currentImage = imgs[currentImageIndex] || imgs[0];

                return (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'zoom-out' }} onClick={() => setIsZoomed(false)}>
                        <button style={{ position: 'absolute', top: '30px', right: '30px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X size={40} /></button>
                        <img src={currentImage} style={{ maxHeight: '90vh', maxWidth: '90vw', objectFit: 'contain' }} alt="Zoomed" />
                    </div>
                );
            })()}

            <button className="btn btn-outline" style={{ border: 'none', background: 'transparent', padding: '0', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }} onClick={() => navigate(-1)}>
                <ArrowLeft size={16} /> Back
            </button>
            <div className="product-detail-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '4rem', alignItems: 'start' }}>
                <div className="product-image-section" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius)', overflow: 'hidden', aspectRatio: '3/4', position: 'relative', width: '100%', maxWidth: '550px', margin: '0 auto' }}>
                    {(() => {
                        let imgs = [];
                        if (selectedVariant && selectedVariant.image_url) imgs.push(selectedVariant.image_url);
                        if (product.images && product.images.length > 0) {
                            imgs = [...imgs, ...product.images.map(img => img.startsWith('http') ? img : (img.startsWith('/storage') ? `${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'}${img}` : `${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'}/storage/${img}`))];
                        } else if (product.image_url) {
                            if (!imgs.includes(product.image_url)) imgs.push(product.image_url);
                        }
                        if (imgs.length === 0) imgs = ['https://via.placeholder.com/400x500'];

                        const currentImage = imgs[currentImageIndex] || imgs[0];

                        return (
                            <>
                                {imgs.map((img, idx) => (
                                    <img 
                                        key={idx}
                                        src={img} 
                                        alt={`${product.name} - ${idx + 1}`} 
                                        style={{ 
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%', 
                                            height: '100%', 
                                            objectFit: 'cover', 
                                            cursor: 'zoom-in',
                                            opacity: currentImageIndex === idx ? 1 : 0,
                                            transition: 'opacity 0.3s ease-in-out',
                                            zIndex: currentImageIndex === idx ? 2 : 1,
                                            pointerEvents: currentImageIndex === idx ? 'auto' : 'none'
                                        }} 
                                        onClick={() => setIsZoomed(true)}
                                    />
                                ))}
                                {imgs.length > 1 && (
                                    <>
                                        <button 
                                            onClick={() => setCurrentImageIndex(prev => prev === 0 ? imgs.length - 1 : prev - 1)}
                                            style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyCenter: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', zIndex: 5 }}
                                            aria-label="Previous image"
                                        >
                                            <span style={{ fontSize: '20px', fontWeight: 'bold' }}>&#10094;</span>
                                        </button>
                                        <button 
                                            onClick={() => setCurrentImageIndex(prev => prev === imgs.length - 1 ? 0 : prev + 1)}
                                            style={{ position: 'absolute', top: '50%', right: '10px', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyCenter: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', zIndex: 5 }}
                                            aria-label="Next image"
                                        >
                                            <span style={{ fontSize: '20px', fontWeight: 'bold' }}>&#10095;</span>
                                        </button>
                                        <div style={{ position: 'absolute', bottom: '15px', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '8px', zIndex: 5 }}>
                                            {imgs.map((_, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setCurrentImageIndex(idx)}
                                                    style={{ width: '10px', height: '10px', borderRadius: '50%', background: idx === currentImageIndex ? 'var(--primary)' : 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.1)', padding: 0, cursor: 'pointer' }}
                                                    aria-label={`Go to image ${idx + 1}`}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </>
                        );
                    })()}
                </div>

                <div className="product-info-section" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <span className="badge" style={{ marginBottom: '1rem', display: 'inline-block', fontSize: '0.85rem' }}>{product.category?.name}</span>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: '0.5rem', fontWeight: 700 }}>{product.name}</h1>
                            <button 
                                onClick={() => toggleWishlist(product.id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}
                                title="Add to Wishlist"
                            >
                                <Heart size={28} color={isInWishlist(product.id) ? '#dc3545' : '#000'} fill={isInWishlist(product.id) ? '#dc3545' : 'transparent'} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${Number(effectivePrice).toFixed(2)}</p>
                            {selectedVariant && selectedVariant.price && selectedVariant.price !== product.price && (
                                <span style={{ fontSize: '1rem', color: '#999', textDecoration: 'line-through' }}>
                                    ${Number(product.price).toFixed(2)}
                                </span>
                            )}
                        </div>
                        {/* Rating Display */}
                        {product.reviews_count > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <div style={{ display: 'flex', gap: '2px' }}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            size={16}
                                            style={{
                                                fill: star <= Math.round(product.average_rating) ? '#ffc107' : 'transparent',
                                                stroke: star <= Math.round(product.average_rating) ? '#ffc107' : '#ddd',
                                            }}
                                        />
                                    ))}
                                </div>
                                <span style={{ fontWeight: 600 }}>{product.average_rating}</span>
                                <span style={{ color: '#666' }}>({product.reviews_count} reviews)</span>
                            </div>
                        )}
                    </div>

                    <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                        {product.description || 'No description available for this product.'}
                    </p>

                    {/* Size Selection */}
                    {availableSizes.length > 0 && (
                        <div>
                            <h4 style={{ marginBottom: '0.75rem' }}>Select Size</h4>
                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                {availableSizes.map(size => {
                                    const available = isSizeAvailable(size);
                                    return (
                                        <button
                                            key={size}
                                            className={`btn ${selectedSize === size ? 'btn-primary' : 'btn-outline'}`}
                                            style={{ 
                                                minWidth: '3.5rem', 
                                                padding: '0.75rem 0.5rem',
                                                opacity: available ? 1 : 0.5,
                                                position: 'relative',
                                                fontSize: '0.9rem'
                                            }}
                                            onClick={() => setSelectedSize(size)}
                                            disabled={!available}
                                        >
                                            {size}
                                            {!available && (
                                                <span style={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    left: '0',
                                                    right: '0',
                                                    height: '1px',
                                                    background: '#999',
                                                    transform: 'rotate(-45deg)'
                                                }} />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Color Selection */}
                    {availableColors.length > 0 && (
                        <div>
                            <h4 style={{ marginBottom: '0.75rem' }}>Select Color</h4>
                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                {availableColors.map(color => {
                                    const available = isColorAvailable(color);
                                    return (
                                        <button
                                            key={color}
                                            className={`btn ${selectedColor === color ? 'btn-primary' : 'btn-outline'}`}
                                            style={{ 
                                                padding: '0.75rem 1.25rem',
                                                opacity: available ? 1 : 0.5,
                                                position: 'relative',
                                                fontSize: '0.9rem'
                                            }}
                                            onClick={() => setSelectedColor(color)}
                                            disabled={!available}
                                        >
                                            {color}
                                            {!available && (
                                                <span style={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    left: '0',
                                                    right: '0',
                                                    height: '1px',
                                                    background: '#999',
                                                    transform: 'rotate(-45deg)'
                                                }} />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Variant Stock Info */}
                    {product.variants && product.variants.length > 0 && (
                        <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #eee' }}>
                            {selectedVariant ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {selectedVariant.stock_quantity > 0 ? (
                                        <>
                                            <Check size={18} color="#28a745" />
                                            <span style={{ color: '#28a745', fontWeight: 500 }}>
                                                {selectedVariant.stock_quantity} in stock - SKU: {selectedVariant.sku}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <X size={18} color="#dc3545" />
                                            <span style={{ color: '#dc3545', fontWeight: 500 }}>Out of stock</span>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <span style={{ color: '#666' }}>Select size and color to see availability</span>
                            )}
                        </div>
                    )}

                    <div>
                        <h4 style={{ marginBottom: '0.75rem' }}>Quantity</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '4px' }}>
                                <button 
                                    className="btn-icon" 
                                    style={{ padding: '0.5rem 1rem', background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)', borderRadius: 0 }} 
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                >
                                    -
                                </button>
                                <span style={{ padding: '0 1.5rem', fontWeight: 600 }}>{quantity}</span>
                                <button 
                                    className="btn-icon" 
                                    style={{ padding: '0.5rem 1rem', background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border)', borderRadius: 0 }} 
                                    onClick={() => setQuantity(Math.min(availableStock || 999, quantity + 1))}
                                >
                                    +
                                </button>
                            </div>
                            {availableStock !== null && (
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    {availableStock > 0 ? `${availableStock} in stock` : 'Sold out'}
                                </span>
                            )}
                        </div>
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                        <button
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '1.25rem', display: 'flex', justifyContent: 'center', gap: '0.75rem', fontSize: '1.1rem', fontWeight: 700 }}
                            onClick={handleAddToCart}
                            disabled={(availableStock !== null && availableStock === 0) || adding}
                        >
                            <ShoppingCart size={22} />
                            {(availableStock !== null && availableStock === 0) 
                                ? 'Out of Stock' 
                                : adding 
                                    ? 'Adding...' 
                                    : 'Add to Cart'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Related Products Section */}
            {relatedProducts.length > 0 && (
                <div className="related-products-section" style={{ marginTop: '5rem', marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', marginBottom: '2rem', textAlign: 'center', fontWeight: '700' }}>You May Also Like</h2>
                    <div className="product-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '2rem' }}>
                        {relatedProducts.map(rel => {
                            let relImg = rel.image_url || 'https://via.placeholder.com/300x400';
                            if (rel.images && rel.images.length > 0) {
                                relImg = rel.images[0].startsWith('http') ? rel.images[0] : (rel.images[0].startsWith('/storage') ? `${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'}${rel.images[0]}` : `${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'}/storage/${rel.images[0]}`);
                            }
                            return (
                                <div key={rel.id} className="product-card cursor-pointer" onClick={() => { navigate(`/product/${rel.id}`); window.scrollTo(0,0); }} style={{ cursor: 'pointer' }}>
                                    <div className="product-image-container" style={{ aspectRatio: '3/4', overflow: 'hidden', borderRadius: '8px', backgroundColor: '#f9f9f9', position: 'relative' }}>
                                        <img 
                                            src={relImg} 
                                            alt={rel.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                                        <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem', fontWeight: '600', color: 'var(--text)' }}>{rel.name}</h3>
                                        <p style={{ fontWeight: 'bold', color: 'var(--text)' }}>${Number(rel.price).toFixed(2)}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Reviews Section */}
            <ReviewSection productId={id} />

            <style dangerouslySetInnerHTML={{__html: `
                @media (max-width: 900px) {
                    .product-detail-grid {
                        grid-template-columns: 1fr !important;
                        gap: 2rem !important;
                    }
                    .product-image-section {
                        max-width: 100% !important;
                    }
                    .product-info-section {
                        padding: 0 0.5rem;
                    }
                }
            `}} />
        </div>
    );
};

export default ProductDetail;
