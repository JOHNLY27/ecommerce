import React, { useContext } from 'react';
import { WishlistContext } from '../context/WishlistContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Heart } from 'lucide-react';

const WishlistPage = () => {
    const { wishlist, toggleWishlist } = useContext(WishlistContext);
    const navigate = useNavigate();

    return (
        <div className="container" style={{ padding: '4rem 1rem', maxWidth: '1200px', margin: '0 auto', minHeight: '60vh' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'center' }}>My Wishlist</h1>
            
            {wishlist.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 0', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                    <Heart size={64} color="#ccc" style={{ marginBottom: '1rem' }} />
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Your wishlist is empty</h2>
                    <p style={{ color: '#666', marginBottom: '2rem' }}>Browse our shop to find items you love!</p>
                    <Link to="/shop" className="btn btn-primary">Go to Shop</Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2.5rem' }}>
                    {wishlist.map((item) => {
                        const product = item.product;
                        if (!product) return null;
                        
                        let img = product.image_url || 'https://via.placeholder.com/300x400';
                        if (product.images && product.images.length > 0) {
                            img = product.images[0].startsWith('http') ? product.images[0] : (product.images[0].startsWith('/storage') ? `${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'}${product.images[0]}` : `${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'}/storage/${product.images[0]}`);
                        }

                        return (
                            <div key={item.id} className="product-card" style={{ cursor: 'pointer', position: 'relative' }} onClick={() => navigate(`/product/${product.id}`)}>
                                <div className="product-image-container" style={{ aspectRatio: '3/4', overflow: 'hidden', borderRadius: '8px' }}>
                                    <img src={img} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                                        style={{ position: 'absolute', top: '10px', right: '10px', background: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', cursor: 'pointer', zIndex: 10, color: '#dc3545' }}
                                        title="Remove from wishlist"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', fontWeight: '600' }}>{product.name}</h3>
                                    <p style={{ fontWeight: 'bold' }}>₱{Number(product.price).toFixed(2)}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default WishlistPage;
