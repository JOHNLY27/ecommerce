import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
    BarChart3,
    ShoppingBag,
    Users,
    DollarSign,
    Package,
    CheckCircle,
    Clock
} from 'lucide-react';

const AdminDashboard = () => {
    const { user, loading } = useContext(AuthContext);
    const navigate = useNavigate();

    const [stats, setStats] = useState({ revenue: 0, orders: 0, products: 0, users: 0 });
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'products'

    const [showProductForm, setShowProductForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [productForm, setProductForm] = useState({
        name: '', description: '', price: '', stock_quantity: '', category_id: '', image_url: '', sizes: '', colors: '', is_new_arrival: false, is_sale: false
    });

    useEffect(() => {
        if (!loading) {
            if (!user) {
                navigate('/login');
            } else if (!user.is_admin) {
                navigate('/');
            } else {
                fetchDashboardData();
            }
        }
    }, [user, loading, navigate]);

    const fetchDashboardData = async () => {
        try {
            const statsRes = await axios.get('/admin/stats');
            setStats(statsRes.data);

            const ordersRes = await axios.get('/admin/orders');
            setOrders(ordersRes.data);

            const productsRes = await axios.get('/admin/products');
            setProducts(productsRes.data);

            const categoriesRes = await axios.get('/categories');
            setCategories(categoriesRes.data);
        } catch (error) {
            console.error("Error fetching dashboard data", error);
        }
    };

    const handleAddEditProduct = async (e) => {
        e.preventDefault();
        try {
            const formData = {
                ...productForm,
                sizes: productForm.sizes ? productForm.sizes.split(',').map(s => s.trim()) : [],
                colors: productForm.colors ? productForm.colors.split(',').map(c => c.trim()) : []
            };
            if (editingProduct) {
                await axios.put(`/admin/products/${editingProduct.id}`, formData);
            } else {
                await axios.post('/admin/products', formData);
            }
            setShowProductForm(false);
            setEditingProduct(null);
            setProductForm({ name: '', description: '', price: '', stock_quantity: '', category_id: '', image_url: '', sizes: '', colors: '', is_new_arrival: false });

            const productsRes = await axios.get('/admin/products');
            setProducts(productsRes.data);

            const statsRes = await axios.get('/admin/stats');
            setStats(statsRes.data);
        } catch (error) {
            console.error("Error saving product", error);
            alert("Error saving product. Please check fields.");
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        try {
            await axios.delete(`/admin/products/${id}`);
            setProducts(products.filter(p => p.id !== id));

            const statsRes = await axios.get('/admin/stats');
            setStats(statsRes.data);
        } catch (error) {
            console.error("Error deleting product", error);
            alert("Error deleting product.");
        }
    };

    const openEditForm = (product) => {
        setEditingProduct(product);
        setProductForm({
            name: product.name,
            description: product.description || '',
            price: product.price,
            stock_quantity: product.stock_quantity,
            category_id: product.category_id,
            image_url: product.image_url || '',
            sizes: product.sizes ? product.sizes.join(', ') : '',
            colors: product.colors ? product.colors.join(', ') : '',
            is_new_arrival: !!product.is_new_arrival,
            is_sale: !!product.is_sale
        });
        setShowProductForm(true);
    };

    const openAddForm = () => {
        setEditingProduct(null);
        setProductForm({ name: '', description: '', price: '', stock_quantity: '', category_id: '', image_url: '', sizes: '', colors: '', is_new_arrival: false, is_sale: false });
        setShowProductForm(true);
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await axios.put(`/admin/orders/${orderId}/status`, { status: newStatus });
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        } catch (error) {
            console.error("Error updating order status", error);
        }
    };

    if (loading || !user) return <div className="loading">Loading Dashboard...</div>;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    return (
        <div className="admin-dashboard container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 className="admin-header">Admin Dashboard</h1>
                <Link to="/admin/reports" className="btn btn-outline">View Reports</Link>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon"><DollarSign /></div>
                    <div className="stat-info">
                        <h3>Total Revenue</h3>
                        <p>{formatCurrency(stats.revenue)}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><ShoppingBag /></div>
                    <div className="stat-info">
                        <h3>Total Orders</h3>
                        <p>{stats.orders}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><Package /></div>
                    <div className="stat-info">
                        <h3>Products</h3>
                        <p>{stats.products}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><Users /></div>
                    <div className="stat-info">
                        <h3>Total Users</h3>
                        <p>{stats.users}</p>
                    </div>
                </div>
            </div>

            <div className="admin-tabs">
                <button
                    className={activeTab === 'orders' ? 'btn btn-primary' : 'btn btn-outline'}
                    onClick={() => setActiveTab('orders')}
                >
                    Recent Orders
                </button>
                <button
                    className={activeTab === 'products' ? 'btn btn-primary' : 'btn btn-outline'}
                    onClick={() => setActiveTab('products')}
                    style={{ marginLeft: '1rem' }}
                >
                    Manage Products
                </button>
            </div>

            {activeTab === 'orders' && (
                <div className="admin-section">
                    <h2>Manage Orders</h2>
                    <div className="table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Date</th>
                                    <th>Total</th>
                                    <th>Payment</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.length === 0 ? (
                                    <tr><td colSpan="7">No orders yet.</td></tr>
                                ) : (
                                    orders.map(order => (
                                        <tr key={order.id}>
                                            <td>#{order.id}</td>
                                            <td>
                                                <div><strong>{order.user?.name}</strong></div>
                                                <div className="text-sm">{order.user?.email}</div>
                                                <div className="text-sm" style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                                    {order.contact} | {order.city}
                                                </div>
                                                <div className="text-sm" style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                                    {order.address}
                                                </div>
                                            </td>
                                            <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                            <td>{formatCurrency(order.total_amount)}</td>
                                            <td><span className="badge">{order.payment_method.toUpperCase()}</span></td>
                                            <td>
                                                <span className={`status-badge status-${order.status}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td>
                                                <select
                                                    className="form-input text-sm select-status"
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="processing">Processing</option>
                                                    <option value="shipped">Shipped</option>
                                                    <option value="completed">Completed</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'products' && (
                <div className="admin-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h2>Manage Products</h2>
                        <button className="btn btn-primary" onClick={openAddForm}>Add New Product</button>
                    </div>

                    {showProductForm && (
                        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '2rem', borderRadius: 'var(--radius)', marginBottom: '2rem' }}>
                            <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                            <form onSubmit={handleAddEditProduct} style={{ marginTop: '1rem', display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                                <div className="form-group">
                                    <label className="form-label">Product Name</label>
                                    <input type="text" className="form-control" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Category</label>
                                    <select className="form-control" value={productForm.category_id} onChange={e => setProductForm({ ...productForm, category_id: e.target.value })} required>
                                        <option value="">Select Category</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Price ($)</label>
                                    <input type="number" step="0.01" className="form-control" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Stock Quantity</label>
                                    <input type="number" className="form-control" value={productForm.stock_quantity} onChange={e => setProductForm({ ...productForm, stock_quantity: e.target.value })} required />
                                </div>
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label">Image URL</label>
                                    <input type="url" className="form-control" value={productForm.image_url} onChange={e => setProductForm({ ...productForm, image_url: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Sizes (comma-separated)</label>
                                    <input type="text" className="form-control" placeholder="S, M, L, XL" value={productForm.sizes} onChange={e => setProductForm({ ...productForm, sizes: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Colors (comma-separated)</label>
                                    <input type="text" className="form-control" placeholder="Red, Blue, Green" value={productForm.colors} onChange={e => setProductForm({ ...productForm, colors: e.target.value })} />
                                </div>
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label">Description</label>
                                    <textarea className="form-control" rows="3" value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })}></textarea>
                                </div>
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', textTransform: 'none', fontWeight: '500' }}>
                                        <input type="checkbox" checked={productForm.is_new_arrival} onChange={e => setProductForm({ ...productForm, is_new_arrival: e.target.checked })} style={{ width: '1.2rem', height: '1.2rem' }} />
                                        Mark as New Arrival (Featured in New Arrivals category)
                                    </label>
                                </div>
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', textTransform: 'none', fontWeight: '500' }}>
                                        <input type="checkbox" checked={productForm.is_sale} onChange={e => setProductForm({ ...productForm, is_sale: e.target.checked })} style={{ width: '1.2rem', height: '1.2rem' }} />
                                        Mark as Sale (Appears in SALE category)
                                    </label>
                                </div>
                                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                    <button type="button" className="btn btn-outline" onClick={() => setShowProductForm(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">{editingProduct ? 'Update Product' : 'Add Product'}</button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Name</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.length === 0 ? (
                                    <tr><td colSpan="6">No products found.</td></tr>
                                ) : (
                                    products.map(product => (
                                        <tr key={product.id}>
                                            <td>
                                                <img src={product.image_url || 'https://via.placeholder.com/50'} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                                            </td>
                                            <td><strong>{product.name}</strong></td>
                                            <td>{product.category?.name}</td>
                                            <td>{formatCurrency(product.price)}</td>
                                            <td>
                                                <div>{product.stock_quantity}</div>
                                                {product.is_new_arrival && (
                                                    <span className="badge" style={{ fontSize: '0.65rem', backgroundColor: 'var(--success)', color: 'white', marginTop: '0.25rem', display: 'inline-block' }}>NEW</span>
                                                )}
                                                {product.is_sale && (
                                                    <span className="badge" style={{ fontSize: '0.65rem', backgroundColor: '#c62828', color: 'white', marginLeft: '0.5rem', marginTop: '0.25rem', display: 'inline-block' }}>SALE</span>
                                                )}
                                            </td>
                                            <td>
                                                <button className="btn btn-outline text-sm" onClick={() => openEditForm(product)} style={{ marginRight: '0.5rem', padding: '0.25rem 0.75rem' }}>Edit</button>
                                                <button className="btn btn-outline text-sm" onClick={() => handleDeleteProduct(product.id)} style={{ padding: '0.25rem 0.75rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}>Delete</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
