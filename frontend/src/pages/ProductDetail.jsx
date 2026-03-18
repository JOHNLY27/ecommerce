import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { CartContext } from '../context/CartContext';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useContext(CartContext);

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const res = await axios.get(`/products/${id}`);
            setProduct(res.data);
            if (res.data.sizes && res.data.sizes.length > 0) {
                setSelectedSize(res.data.sizes[0]);
            }
            if (res.data.colors && res.data.colors.length > 0) {
                setSelectedColor(res.data.colors[0]);
            }
        } catch (err) {
            console.error("Error fetching product", err);
        }
        setLoading(false);
    };

    const [adding, setAdding] = useState(false);

    const handleAddToCart = async () => {
        if (product.sizes && product.sizes.length > 0 && !selectedSize) {
            alert('Please select a size');
            return;
        }
        if (product.colors && product.colors.length > 0 && !selectedColor) {
            alert('Please select a color');
            return;
        }

        setAdding(true);
        // Using context instead of raw axios to ensure the badge updates
        try {
            await addToCart(product.id, quantity, selectedSize, selectedColor);
            alert('Added to cart!');
        } catch (err) {
            console.error(err);
        }
        setAdding(false);
    };

    if (loading) return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Loading...</div>;
    if (!product) return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Product not found.</div>;

    return (
        <div className="container" style={{ padding: '4rem 0' }}>
            <button className="btn btn-outline" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => navigate(-1)}>
                <ArrowLeft size={16} /> Back
            </button>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1fr', gap: '4rem' }}>
                <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius)', overflow: 'hidden', aspectRatio: '3/4' }}>
                    <img src={product.image_url || 'https://via.placeholder.com/400x500'} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <span className="badge" style={{ marginBottom: '1rem', display: 'inline-block' }}>{product.category?.name}</span>
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{product.name}</h1>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${Number(product.price).toFixed(2)}</p>
                    </div>

                    <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                        {product.description || 'No description available for this product.'}
                    </p>

                    {product.sizes && product.sizes.length > 0 && (
                        <div>
                            <h4 style={{ marginBottom: '0.5rem' }}>Select Size</h4>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {product.sizes.map(size => (
                                    <button
                                        key={size}
                                        className={`btn ${selectedSize === size ? 'btn-primary' : 'btn-outline'}`}
                                        style={{ minWidth: '3rem', padding: '0.5rem' }}
                                        onClick={() => setSelectedSize(size)}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {product.colors && product.colors.length > 0 && (
                        <div>
                            <h4 style={{ marginBottom: '0.5rem' }}>Select Color</h4>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {product.colors.map(color => (
                                    <button
                                        key={color}
                                        className={`btn ${selectedColor === color ? 'btn-primary' : 'btn-outline'}`}
                                        style={{ padding: '0.5rem 1rem' }}
                                        onClick={() => setSelectedColor(color)}
                                    >
                                        {color}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <h4 style={{ marginBottom: '0.5rem' }}>Quantity</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <button className="btn btn-outline" style={{ padding: '0.25rem 0.75rem' }} onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                            <span>{quantity}</span>
                            <button className="btn btn-outline" style={{ padding: '0.25rem 0.75rem' }} onClick={() => setQuantity(quantity + 1)}>+</button>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginLeft: '1rem' }}>
                                {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                            </span>
                        </div>
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                        <button
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', fontSize: '1.1rem' }}
                            onClick={handleAddToCart}
                            disabled={product.stock_quantity === 0 || adding}
                        >
                            <ShoppingCart size={20} />
                            {product.stock_quantity === 0 ? 'Out of Stock' : adding ? 'Adding to Cart...' : 'Add to Cart'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
