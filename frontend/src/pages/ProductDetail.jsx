import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, ArrowLeft, Check, X, Star } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import ReviewSection from '../components/ReviewSection';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useContext(CartContext);

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [quantity, setQuantity] = useState(1);

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
        <div className="container" style={{ padding: '4rem 0' }}>
            <button className="btn btn-outline" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => navigate(-1)}>
                <ArrowLeft size={16} /> Back
            </button>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1fr', gap: '4rem' }}>
                <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius)', overflow: 'hidden', aspectRatio: '3/4' }}>
                    <img 
                        src={selectedVariant?.image_url || product.image_url || 'https://via.placeholder.com/400x500'} 
                        alt={product.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <span className="badge" style={{ marginBottom: '1rem', display: 'inline-block' }}>{product.category?.name}</span>
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{product.name}</h1>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
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
                            <h4 style={{ marginBottom: '0.5rem' }}>Select Size</h4>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {availableSizes.map(size => {
                                    const available = isSizeAvailable(size);
                                    return (
                                        <button
                                            key={size}
                                            className={`btn ${selectedSize === size ? 'btn-primary' : 'btn-outline'}`}
                                            style={{ 
                                                minWidth: '3rem', 
                                                padding: '0.5rem',
                                                opacity: available ? 1 : 0.5,
                                                position: 'relative'
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
                            <h4 style={{ marginBottom: '0.5rem' }}>Select Color</h4>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {availableColors.map(color => {
                                    const available = isColorAvailable(color);
                                    return (
                                        <button
                                            key={color}
                                            className={`btn ${selectedColor === color ? 'btn-primary' : 'btn-outline'}`}
                                            style={{ 
                                                padding: '0.5rem 1rem',
                                                opacity: available ? 1 : 0.5,
                                                position: 'relative'
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
                        <div style={{ padding: '0.75rem', background: '#f8f9fa', borderRadius: '8px' }}>
                            {selectedVariant ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {selectedVariant.stock_quantity > 0 ? (
                                        <>
                                            <Check size={16} color="#28a745" />
                                            <span style={{ color: '#28a745' }}>
                                                {selectedVariant.stock_quantity} in stock - SKU: {selectedVariant.sku}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <X size={16} color="#dc3545" />
                                            <span style={{ color: '#dc3545' }}>Out of stock</span>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <span style={{ color: '#666' }}>Select size and color to see availability</span>
                            )}
                        </div>
                    )}

                    <div>
                        <h4 style={{ marginBottom: '0.5rem' }}>Quantity</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <button 
                                className="btn btn-outline" 
                                style={{ padding: '0.25rem 0.75rem' }} 
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            >
                                -
                            </button>
                            <span>{quantity}</span>
                            <button 
                                className="btn btn-outline" 
                                style={{ padding: '0.25rem 0.75rem' }} 
                                onClick={() => setQuantity(Math.min(availableStock || 999, quantity + 1))}
                            >
                                +
                            </button>
                            {availableStock !== null && (
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginLeft: '1rem' }}>
                                    {availableStock > 0 ? `${availableStock} in stock` : 'Out of stock'}
                                </span>
                            )}
                        </div>
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                        <button
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', fontSize: '1.1rem' }}
                            onClick={handleAddToCart}
                            disabled={(availableStock !== null && availableStock === 0) || adding}
                        >
                            <ShoppingCart size={20} />
                            {(availableStock !== null && availableStock === 0) 
                                ? 'Out of Stock' 
                                : adding 
                                    ? 'Adding to Cart...' 
                                    : 'Add to Cart'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <ReviewSection productId={id} />
        </div>
    );
};

export default ProductDetail;
