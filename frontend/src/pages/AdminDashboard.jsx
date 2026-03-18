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
    Clock,
    Search,
    Filter,
    Download,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Layers,
    Plus,
    Edit2,
    Trash2
} from 'lucide-react';

const AdminDashboard = () => {
    const { user, loading } = useContext(AuthContext);
    const navigate = useNavigate();

    const [stats, setStats] = useState({ revenue: 0, orders: 0, products: 0, users: 0 });
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'products'

    // Inventory filters and search
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [stockFilter, setStockFilter] = useState('');
    const [sortBy, setSortBy] = useState('name');

    const [showProductForm, setShowProductForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [productForm, setProductForm] = useState({
        name: '', description: '', price: '', stock_quantity: '', category_id: '', image_url: '', sizes: '', colors: '', is_new_arrival: false, is_sale: false
    });
    const [quickEditStock, setQuickEditStock] = useState({ id: null, value: '' });

    // Variant management state
    const [showVariantModal, setShowVariantModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [variants, setVariants] = useState([]);
    const [variantForm, setVariantForm] = useState({
        sku: '', size: '', color: '', price: '', stock_quantity: 0, image_url: '', is_active: true
    });
    const [editingVariant, setEditingVariant] = useState(null);
    const [showBulkCreate, setShowBulkCreate] = useState(false);
    const [bulkForm, setBulkForm] = useState({
        sizes: '', colors: '', base_sku: '', price: '', stock_quantity: 0
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

    // Filter and sort products
    const getFilteredProducts = () => {
        let filtered = [...products];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(query) || 
                (p.sku && p.sku.toLowerCase().includes(query)) ||
                p.id.toString().includes(query)
            );
        }

        // Category filter
        if (categoryFilter) {
            filtered = filtered.filter(p => p.category_id === parseInt(categoryFilter));
        }

        // Stock filter
        if (stockFilter) {
            switch (stockFilter) {
                case 'in_stock':
                    filtered = filtered.filter(p => p.stock_quantity > 5);
                    break;
                case 'low_stock':
                    filtered = filtered.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 5);
                    break;
                case 'out_of_stock':
                    filtered = filtered.filter(p => p.stock_quantity === 0);
                    break;
            }
        }

        // Sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'price_low':
                    return a.price - b.price;
                case 'price_high':
                    return b.price - a.price;
                case 'stock_low':
                    return a.stock_quantity - b.stock_quantity;
                case 'stock_high':
                    return b.stock_quantity - a.stock_quantity;
                default:
                    return 0;
            }
        });

        return filtered;
    };

    // Get stock status
    const getStockStatus = (quantity) => {
        if (quantity === 0) return { label: 'Out of Stock', color: '#dc3545', icon: XCircle };
        if (quantity <= 5) return { label: 'Low Stock', color: '#ffc107', icon: AlertTriangle };
        return { label: 'In Stock', color: '#28a745', icon: CheckCircle2 };
    };

    // Calculate inventory value
    const getInventoryValue = () => {
        return products.reduce((acc, p) => acc + (p.price * p.stock_quantity), 0);
    };

    // Quick stock update
    const handleQuickStockUpdate = async (productId, newStock) => {
        try {
            const product = products.find(p => p.id === productId);
            await axios.put(`/admin/products/${productId}`, {
                ...product,
                stock_quantity: parseInt(newStock)
            });
            setProducts(products.map(p => p.id === productId ? { ...p, stock_quantity: parseInt(newStock) } : p));
            setQuickEditStock({ id: null, value: '' });
        } catch (error) {
            console.error('Error updating stock', error);
            alert('Failed to update stock');
        }
    };

    // Export inventory to CSV
    const exportInventory = () => {
        const headers = ['ID', 'Name', 'Category', 'Price', 'Stock', 'Status', 'Inventory Value'];
        const rows = products.map(p => {
            const status = getStockStatus(p.stock_quantity).label;
            return [
                p.id,
                p.name,
                p.category?.name || 'N/A',
                p.price,
                p.stock_quantity,
                status,
                (p.price * p.stock_quantity).toFixed(2)
            ];
        });

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `inventory_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // ==================== VARIANT MANAGEMENT ====================

    const openVariantModal = async (product) => {
        setSelectedProduct(product);
        setShowVariantModal(true);
        await fetchVariants(product.id);
    };

    const fetchVariants = async (productId) => {
        try {
            const res = await axios.get(`/admin/products/${productId}/variants`);
            setVariants(res.data);
        } catch (error) {
            console.error('Error fetching variants', error);
            setVariants([]);
        }
    };

    const handleAddVariant = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`/admin/products/${selectedProduct.id}/variants`, {
                ...variantForm,
                price: variantForm.price || null,
                stock_quantity: parseInt(variantForm.stock_quantity) || 0
            });
            await fetchVariants(selectedProduct.id);
            resetVariantForm();
        } catch (error) {
            console.error('Error adding variant', error);
            alert(error.response?.data?.message || 'Failed to add variant');
        }
    };

    const handleUpdateVariant = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/admin/products/${selectedProduct.id}/variants/${editingVariant.id}`, {
                ...variantForm,
                price: variantForm.price || null,
                stock_quantity: parseInt(variantForm.stock_quantity) || 0
            });
            await fetchVariants(selectedProduct.id);
            resetVariantForm();
        } catch (error) {
            console.error('Error updating variant', error);
            alert(error.response?.data?.message || 'Failed to update variant');
        }
    };

    const handleDeleteVariant = async (variantId) => {
        if (!window.confirm('Are you sure you want to delete this variant?')) return;
        try {
            await axios.delete(`/admin/products/${selectedProduct.id}/variants/${variantId}`);
            await fetchVariants(selectedProduct.id);
        } catch (error) {
            console.error('Error deleting variant', error);
            alert('Failed to delete variant');
        }
    };

    const handleBulkCreateVariants = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`/admin/products/${selectedProduct.id}/variants/bulk`, {
                sizes: bulkForm.sizes.split(',').map(s => s.trim()).filter(Boolean),
                colors: bulkForm.colors.split(',').map(c => c.trim()).filter(Boolean),
                base_sku: bulkForm.base_sku,
                price: bulkForm.price || null,
                stock_quantity: parseInt(bulkForm.stock_quantity) || 0
            });
            await fetchVariants(selectedProduct.id);
            setShowBulkCreate(false);
            setBulkForm({ sizes: '', colors: '', base_sku: '', price: '', stock_quantity: 0 });
            if (res.data.total_skipped > 0) {
                alert(`${res.data.total_created} variants created. ${res.data.total_skipped} were skipped (duplicate SKUs).`);
            }
        } catch (error) {
            console.error('Error bulk creating variants', error);
            alert(error.response?.data?.message || 'Failed to create variants');
        }
    };

    const openEditVariant = (variant) => {
        setEditingVariant(variant);
        setVariantForm({
            sku: variant.sku,
            size: variant.size || '',
            color: variant.color || '',
            price: variant.price || '',
            stock_quantity: variant.stock_quantity,
            image_url: variant.image_url || '',
            is_active: variant.is_active
        });
    };

    const resetVariantForm = () => {
        setEditingVariant(null);
        setVariantForm({
            sku: '', size: '', color: '', price: '', stock_quantity: 0, image_url: '', is_active: true
        });
    };

    const closeVariantModal = () => {
        setShowVariantModal(false);
        setSelectedProduct(null);
        setVariants([]);
        resetVariantForm();
        setShowBulkCreate(false);
        // Refresh products to get updated variant counts
        fetchDashboardData();
    };

    const filteredProducts = getFilteredProducts();
    const inventoryValue = getInventoryValue();
    const lowStockCount = products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 5).length;
    const outOfStockCount = products.filter(p => p.stock_quantity === 0).length;

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
                    Inventory
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
                    {/* Inventory Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px', borderLeft: '4px solid #007bff' }}>
                            <div style={{ fontSize: '0.85rem', color: '#666' }}>Total Products</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{products.length}</div>
                        </div>
                        <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px', borderLeft: '4px solid #28a745' }}>
                            <div style={{ fontSize: '0.85rem', color: '#666' }}>Inventory Value</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatCurrency(inventoryValue)}</div>
                        </div>
                        <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px', borderLeft: '4px solid #ffc107' }}>
                            <div style={{ fontSize: '0.85rem', color: '#666' }}>Low Stock</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: lowStockCount > 0 ? '#ffc107' : '#28a745' }}>{lowStockCount}</div>
                        </div>
                        <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px', borderLeft: '4px solid #dc3545' }}>
                            <div style={{ fontSize: '0.85rem', color: '#666' }}>Out of Stock</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: outOfStockCount > 0 ? '#dc3545' : '#28a745' }}>{outOfStockCount}</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <h2>Inventory</h2>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-outline" onClick={exportInventory} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Download size={16} /> Export CSV
                            </button>
                            <button className="btn btn-primary" onClick={openAddForm}>Add New Product</button>
                        </div>
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

                    {/* Filters and Search */}
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ width: '100%', padding: '0.5rem 0.75rem 0.5rem 2.25rem', border: '1px solid #ddd', borderRadius: '4px' }}
                            />
                        </div>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            style={{ padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
                        >
                            <option value="">All Categories</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <select
                            value={stockFilter}
                            onChange={(e) => setStockFilter(e.target.value)}
                            style={{ padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
                        >
                            <option value="">All Stock Levels</option>
                            <option value="in_stock">In Stock (&gt;5)</option>
                            <option value="low_stock">Low Stock (1-5)</option>
                            <option value="out_of_stock">Out of Stock (0)</option>
                        </select>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{ padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
                        >
                            <option value="name">Sort by Name</option>
                            <option value="price_low">Price: Low to High</option>
                            <option value="price_high">Price: High to Low</option>
                            <option value="stock_low">Stock: Low to High</option>
                            <option value="stock_high">Stock: High to Low</option>
                        </select>
                    </div>

                    {/* Results count */}
                    <div style={{ marginBottom: '1rem', color: '#666', fontSize: '0.9rem' }}>
                        Showing {filteredProducts.length} of {products.length} products
                    </div>

                    <div className="table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Name</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Stock Status</th>
                                    <th>Quick Update</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.length === 0 ? (
                                    <tr><td colSpan="7">No products found matching your filters.</td></tr>
                                ) : (
                                    filteredProducts.map(product => {
                                        const stockStatus = getStockStatus(product.stock_quantity);
                                        const StatusIcon = stockStatus.icon;
                                        return (
                                            <tr key={product.id} style={{ backgroundColor: product.stock_quantity === 0 ? '#fff5f5' : product.stock_quantity <= 5 ? '#fffbf0' : 'transparent' }}>
                                                <td>
                                                    <img src={product.image_url || 'https://via.placeholder.com/50'} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                                                </td>
                                                <td>
                                                    <strong>{product.name}</strong>
                                                    <div style={{ fontSize: '0.75rem', color: '#666' }}>ID: #{product.id}</div>
                                                    {product.is_new_arrival && (
                                                        <span className="badge" style={{ fontSize: '0.65rem', backgroundColor: 'var(--success)', color: 'white', marginTop: '0.25rem', display: 'inline-block' }}>NEW</span>
                                                    )}
                                                    {product.is_sale && (
                                                        <span className="badge" style={{ fontSize: '0.65rem', backgroundColor: '#c62828', color: 'white', marginLeft: '0.5rem', marginTop: '0.25rem', display: 'inline-block' }}>SALE</span>
                                                    )}
                                                </td>
                                                <td>{product.category?.name}</td>
                                                <td>{formatCurrency(product.price)}</td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <StatusIcon size={16} color={stockStatus.color} />
                                                        <span style={{ 
                                                            padding: '0.25rem 0.5rem', 
                                                            borderRadius: '4px', 
                                                            fontSize: '0.75rem', 
                                                            fontWeight: 600,
                                                            backgroundColor: stockStatus.color + '20',
                                                            color: stockStatus.color
                                                        }}>
                                                            {stockStatus.label}
                                                        </span>
                                                    </div>
                                                    <div style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: '0.25rem' }}>
                                                        {product.stock_quantity} units
                                                    </div>
                                                </td>
                                                <td>
                                                    {quickEditStock.id === product.id ? (
                                                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                                                            <input
                                                                type="number"
                                                                value={quickEditStock.value}
                                                                onChange={(e) => setQuickEditStock({ ...quickEditStock, value: e.target.value })}
                                                                style={{ width: '60px', padding: '0.25rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                                                autoFocus
                                                            />
                                                            <button
                                                                onClick={() => handleQuickStockUpdate(product.id, quickEditStock.value)}
                                                                style={{ padding: '0.25rem 0.5rem', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                                            >
                                                                ✓
                                                            </button>
                                                            <button
                                                                onClick={() => setQuickEditStock({ id: null, value: '' })}
                                                                style={{ padding: '0.25rem 0.5rem', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setQuickEditStock({ id: product.id, value: product.stock_quantity.toString() })}
                                                            className="btn btn-outline text-sm"
                                                            style={{ padding: '0.25rem 0.75rem' }}
                                                        >
                                                            Update Stock
                                                        </button>
                                                    )}
                                                </td>
                                                <td>
                                                    <button className="btn btn-outline text-sm" onClick={() => openEditForm(product)} style={{ marginRight: '0.5rem', padding: '0.25rem 0.75rem' }}>Edit</button>
                                                    <button 
                                                        className="btn btn-outline text-sm" 
                                                        onClick={() => openVariantModal(product)} 
                                                        style={{ marginRight: '0.5rem', padding: '0.25rem 0.75rem', color: '#6f42c1', borderColor: '#6f42c1' }}
                                                    >
                                                        <Layers size={14} style={{ marginRight: '0.25rem' }} />
                                                        Variants {product.variants?.length > 0 ? `(${product.variants.length})` : ''}
                                                    </button>
                                                    <button className="btn btn-outline text-sm" onClick={() => handleDeleteProduct(product.id)} style={{ padding: '0.25rem 0.75rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}>Delete</button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Variant Management Modal */}
            {showVariantModal && selectedProduct && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem'
                }}>
                    <div style={{
                        background: 'white', borderRadius: '8px', width: '100%', maxWidth: '900px',
                        maxHeight: '90vh', overflow: 'auto', padding: '1.5rem'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div>
                                <h2 style={{ margin: 0 }}>Product Variants</h2>
                                <div style={{ color: '#666', fontSize: '0.9rem' }}>{selectedProduct.name}</div>
                            </div>
                            <button onClick={closeVariantModal} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        </div>

                        {/* Variant Actions */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                            <button 
                                className="btn btn-primary" 
                                onClick={() => { resetVariantForm(); setShowBulkCreate(false); }}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                            >
                                <Plus size={16} /> Add Single Variant
                            </button>
                            <button 
                                className="btn btn-outline" 
                                onClick={() => setShowBulkCreate(!showBulkCreate)}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                            >
                                <Layers size={16} /> Bulk Create
                            </button>
                        </div>

                        {/* Bulk Create Form */}
                        {showBulkCreate && (
                            <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                                <h4 style={{ marginTop: 0 }}>Bulk Create Variants</h4>
                                <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem' }}>
                                    Enter sizes and colors to automatically generate all combinations.
                                </p>
                                <form onSubmit={handleBulkCreateVariants}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                        <div className="form-group">
                                            <label className="form-label">Base SKU</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="e.g., TSHIRT001"
                                                value={bulkForm.base_sku}
                                                onChange={e => setBulkForm({ ...bulkForm, base_sku: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Sizes (comma-separated)</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="S, M, L, XL"
                                                value={bulkForm.sizes}
                                                onChange={e => setBulkForm({ ...bulkForm, sizes: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Colors (comma-separated)</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Red, Blue, Black"
                                                value={bulkForm.colors}
                                                onChange={e => setBulkForm({ ...bulkForm, colors: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Price (leave empty for parent price)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="form-control"
                                                placeholder="Optional"
                                                value={bulkForm.price}
                                                onChange={e => setBulkForm({ ...bulkForm, price: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Initial Stock</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={bulkForm.stock_quantity}
                                                onChange={e => setBulkForm({ ...bulkForm, stock_quantity: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '1rem' }}>
                                        <button type="submit" className="btn btn-primary">Generate Variants</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Single Variant Form */}
                        {!showBulkCreate && (
                            <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                                <h4 style={{ marginTop: 0 }}>{editingVariant ? 'Edit Variant' : 'Add New Variant'}</h4>
                                <form onSubmit={editingVariant ? handleUpdateVariant : handleAddVariant}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                                        <div className="form-group">
                                            <label className="form-label">SKU *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={variantForm.sku}
                                                onChange={e => setVariantForm({ ...variantForm, sku: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Size</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="e.g., M, L, XL"
                                                value={variantForm.size}
                                                onChange={e => setVariantForm({ ...variantForm, size: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Color</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="e.g., Red, Blue"
                                                value={variantForm.color}
                                                onChange={e => setVariantForm({ ...variantForm, color: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Price Override</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="form-control"
                                                placeholder="Leave empty for parent price"
                                                value={variantForm.price}
                                                onChange={e => setVariantForm({ ...variantForm, price: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Stock Quantity *</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={variantForm.stock_quantity}
                                                onChange={e => setVariantForm({ ...variantForm, stock_quantity: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Image URL</label>
                                            <input
                                                type="url"
                                                className="form-control"
                                                placeholder="Optional variant image"
                                                value={variantForm.image_url}
                                                onChange={e => setVariantForm({ ...variantForm, image_url: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group" style={{ display: 'flex', alignItems: 'center' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={variantForm.is_active}
                                                    onChange={e => setVariantForm({ ...variantForm, is_active: e.target.checked })}
                                                />
                                                Active
                                            </label>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                                        <button type="submit" className="btn btn-primary">
                                            {editingVariant ? 'Update Variant' : 'Add Variant'}
                                        </button>
                                        {editingVariant && (
                                            <button type="button" className="btn btn-outline" onClick={resetVariantForm}>
                                                Cancel Edit
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Variants List */}
                        <h4 style={{ marginBottom: '0.5rem' }}>Existing Variants ({variants.length})</h4>
                        {variants.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#666', background: '#f8f9fa', borderRadius: '8px' }}>
                                No variants yet. Add variants to track size/color combinations with individual stock and pricing.
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>SKU</th>
                                            <th>Size</th>
                                            <th>Color</th>
                                            <th>Price</th>
                                            <th>Stock</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {variants.map(variant => {
                                            const variantStockStatus = getStockStatus(variant.stock_quantity);
                                            return (
                                                <tr key={variant.id} style={{ opacity: variant.is_active ? 1 : 0.5 }}>
                                                    <td><code style={{ background: '#f0f0f0', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>{variant.sku}</code></td>
                                                    <td>{variant.size || '-'}</td>
                                                    <td>{variant.color || '-'}</td>
                                                    <td>
                                                        {variant.price 
                                                            ? formatCurrency(variant.price) 
                                                            : <span style={{ color: '#999' }}>Parent price</span>
                                                        }
                                                    </td>
                                                    <td>
                                                        <span style={{
                                                            padding: '0.25rem 0.5rem',
                                                            borderRadius: '4px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 600,
                                                            backgroundColor: variantStockStatus.color + '20',
                                                            color: variantStockStatus.color
                                                        }}>
                                                            {variant.stock_quantity} units
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span style={{
                                                            padding: '0.25rem 0.5rem',
                                                            borderRadius: '4px',
                                                            fontSize: '0.75rem',
                                                            backgroundColor: variant.is_active ? '#28a745' : '#6c757d',
                                                            color: 'white'
                                                        }}>
                                                            {variant.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-outline text-sm"
                                                            onClick={() => openEditVariant(variant)}
                                                            style={{ marginRight: '0.5rem', padding: '0.25rem 0.5rem' }}
                                                        >
                                                            <Edit2 size={14} />
                                                        </button>
                                                        <button
                                                            className="btn btn-outline text-sm"
                                                            onClick={() => handleDeleteVariant(variant.id)}
                                                            style={{ padding: '0.25rem 0.5rem', color: '#dc3545', borderColor: '#dc3545' }}
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
