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
    Trash2,
    LayoutDashboard,
    Home,
    LogOut,
    Menu,
    X,
    Star,
    CreditCard,
    Settings,
    FileText,
    FolderOpen
} from 'lucide-react';

const AdminDashboard = () => {
    const { user, loading, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [stats, setStats] = useState({ revenue: 0, orders: 0, products: 0, users: 0 });
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [couponForm, setCouponForm] = useState({ code: '', type: 'percent', value: '', usage_limit: '', expires_at: '' });

    // Category management state
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
    const [categorySearch, setCategorySearch] = useState('');
    const [showCouponForm, setShowCouponForm] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Inventory filters and search
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [stockFilter, setStockFilter] = useState('');
    const [sortBy, setSortBy] = useState('name');

    const [showProductForm, setShowProductForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [productForm, setProductForm] = useState({
        name: '', description: '', price: '', stock_quantity: '', category_id: '', subcategory: '', image_url: '', images: [], existing_images: [], sizes: '', colors: '', is_new_arrival: false, is_sale: false, is_trending: false
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

            const customersRes = await axios.get('/admin/customers');
            setCustomers(customersRes.data);

            const couponsRes = await axios.get('/admin/coupons');
            setCoupons(couponsRes.data);
        } catch (error) {
            console.error("Error fetching dashboard data", error);
        }
    };

    const handleAddEditProduct = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', productForm.name);
            formData.append('description', productForm.description || '');
            formData.append('price', productForm.price);
            formData.append('stock_quantity', productForm.stock_quantity);
            formData.append('category_id', productForm.category_id);
            if (productForm.subcategory) formData.append('subcategory', productForm.subcategory);
            if (productForm.image_url) formData.append('image_url', productForm.image_url);
            
            const sizesArr = productForm.sizes ? productForm.sizes.split(',').map(s => s.trim()) : [];
            const colorsArr = productForm.colors ? productForm.colors.split(',').map(c => c.trim()) : [];
            formData.append('sizes', JSON.stringify(sizesArr));
            formData.append('colors', JSON.stringify(colorsArr));
            formData.append('is_new_arrival', productForm.is_new_arrival ? 1 : 0);
            formData.append('is_sale', productForm.is_sale ? 1 : 0);
            formData.append('is_trending', productForm.is_trending ? 1 : 0);
            
            if (productForm.existing_images) {
                formData.append('existing_images', JSON.stringify(productForm.existing_images));
            }

            if (productForm.images && productForm.images.length > 0) {
                Array.from(productForm.images).forEach(file => {
                    formData.append('images[]', file);
                });
            }

            if (editingProduct) {
                formData.append('_method', 'PUT');
                await axios.post(`/admin/products/${editingProduct.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await axios.post('/admin/products', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            setShowProductForm(false);
            setEditingProduct(null);
            setProductForm({ name: '', description: '', price: '', stock_quantity: '', category_id: '', subcategory: '', image_url: '', images: [], existing_images: [], sizes: '', colors: '', is_new_arrival: false, is_sale: false, is_trending: false });

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
            subcategory: product.subcategory || '',
            image_url: product.image_url || '',
            images: [],
            existing_images: product.images || [],
            sizes: product.sizes ? product.sizes.join(', ') : '',
            colors: product.colors ? product.colors.join(', ') : '',
            is_new_arrival: !!product.is_new_arrival,
            is_sale: !!product.is_sale,
            is_trending: !!product.is_trending
        });
        setShowProductForm(true);
    };

    const openAddForm = () => {
        setEditingProduct(null);
        setProductForm({ name: '', description: '', price: '', stock_quantity: '', category_id: '', subcategory: '', image_url: '', images: [], existing_images: [], sizes: '', colors: '', is_new_arrival: false, is_sale: false, is_trending: false });
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
        return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
    };

    // Filter and sort products
    const getFilteredProducts = () => {
        let filtered = [...products];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(query) || 
                (p.sku && p.sku.toLowerCase().includes(query)) ||
                p.id.toString().includes(query)
            );
        }

        if (categoryFilter) {
            filtered = filtered.filter(p => p.category_id === parseInt(categoryFilter));
        }

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

    const getStockStatus = (quantity) => {
        if (quantity === 0) return { label: 'Out of Stock', color: '#dc3545', icon: XCircle };
        if (quantity <= 5) return { label: 'Low Stock', color: '#ffc107', icon: AlertTriangle };
        return { label: 'In Stock', color: '#28a745', icon: CheckCircle2 };
    };

    const getInventoryValue = () => {
        return products.reduce((acc, p) => acc + (p.price * p.stock_quantity), 0);
    };

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
        fetchDashboardData();
    };

    const handleAddCoupon = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/admin/coupons', couponForm);
            setShowCouponForm(false);
            setCouponForm({ code: '', type: 'percent', value: '', usage_limit: '', expires_at: '' });
            const couponsRes = await axios.get('/admin/coupons');
            setCoupons(couponsRes.data);
            alert("Coupon created successfully!");
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Error creating coupon");
        }
    };

    const handleDeleteCoupon = async (id) => {
        if (!window.confirm("Delete this coupon?")) return;
        try {
            await axios.delete(`/admin/coupons/${id}`);
            setCoupons(coupons.filter(c => c.id !== id));
        } catch (error) {
            console.error(error);
            alert("Error deleting coupon");
        }
    };

    // ==================== CATEGORY MANAGEMENT ====================

    const handleAddEditCategory = async (e) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await axios.put(`/admin/categories/${editingCategory.id}`, categoryForm);
            } else {
                await axios.post('/admin/categories', categoryForm);
            }
            setShowCategoryForm(false);
            setEditingCategory(null);
            setCategoryForm({ name: '', description: '' });
            const categoriesRes = await axios.get('/categories');
            setCategories(categoriesRes.data);
        } catch (error) {
            console.error('Error saving category', error);
            alert(error.response?.data?.message || 'Error saving category. Please check fields.');
        }
    };

    const openEditCategory = (category) => {
        setEditingCategory(category);
        setCategoryForm({ name: category.name, description: category.description || '' });
        setShowCategoryForm(true);
    };

    const openAddCategoryForm = () => {
        setEditingCategory(null);
        setCategoryForm({ name: '', description: '' });
        setShowCategoryForm(true);
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;
        try {
            await axios.delete(`/admin/categories/${id}`);
            setCategories(categories.filter(c => c.id !== id));
        } catch (error) {
            console.error('Error deleting category', error);
            alert(error.response?.data?.message || 'Error deleting category.');
        }
    };

    const getFilteredCategories = () => {
        if (!categorySearch) return categories;
        const q = categorySearch.toLowerCase();
        return categories.filter(c => c.name.toLowerCase().includes(q) || (c.description && c.description.toLowerCase().includes(q)));
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const filteredProducts = getFilteredProducts();
    const inventoryValue = getInventoryValue();
    const lowStockCount = products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 5).length;
    const outOfStockCount = products.filter(p => p.stock_quantity === 0).length;

    // Sidebar navigation items
    const sidebarNav = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'categories', label: 'Categories', icon: FolderOpen },
        { id: 'products', label: 'Products', icon: Package },
        { id: 'orders', label: 'Orders', icon: ShoppingBag },
        { id: 'customers', label: 'Customers', icon: Users },
        { id: 'coupons', label: 'Coupons', icon: CreditCard },
    ];

    const sidebarBottomNav = [
        { id: 'reports', label: 'Reports', icon: FileText, link: '/admin/reports' },
        { id: 'reviews', label: 'Reviews', icon: Star, link: '/admin/reviews' },
        { id: 'settings', label: 'Settings', icon: Settings, link: '/admin/settings' },
    ];

    return (
        <div className="admin-layout">
            {/* ===== SIDEBAR ===== */}
            <aside className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
                <div className="admin-sidebar-inner">
                    {/* Sidebar Header */}
                    <div className="admin-sidebar-header">
                        <div className="admin-sidebar-brand">
                            <Package size={24} />
                            {!sidebarCollapsed && <span>Admin Panel</span>}
                        </div>
                        <button 
                            className="admin-sidebar-toggle"
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        >
                            {sidebarCollapsed ? <Menu size={18} /> : <X size={18} />}
                        </button>
                    </div>

                    {/* Main Navigation */}
                    <nav className="admin-sidebar-nav">
                        {sidebarNav.map(item => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.id}
                                    className={`admin-sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                                    onClick={() => setActiveTab(item.id)}
                                    title={sidebarCollapsed ? item.label : ''}
                                >
                                    <Icon size={20} />
                                    {!sidebarCollapsed && <span>{item.label}</span>}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Divider */}
                    <div className="admin-sidebar-divider"></div>

                    {/* Secondary Navigation */}
                    <nav className="admin-sidebar-nav">
                        {sidebarBottomNav.map(item => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.id}
                                    to={item.link}
                                    className="admin-sidebar-item"
                                    title={sidebarCollapsed ? item.label : ''}
                                >
                                    <Icon size={20} />
                                    {!sidebarCollapsed && <span>{item.label}</span>}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Sidebar Footer */}
                    <div className="admin-sidebar-footer">
                        <Link to="/" className="admin-sidebar-item" title={sidebarCollapsed ? 'Back to Store' : ''}>
                            <Home size={20} />
                            {!sidebarCollapsed && <span>Back to Store</span>}
                        </Link>
                        <button className="admin-sidebar-item logout-item" onClick={handleLogout} title={sidebarCollapsed ? 'Logout' : ''}>
                            <LogOut size={20} />
                            {!sidebarCollapsed && <span>Logout</span>}
                        </button>
                    </div>
                </div>
            </aside>

            {/* ===== MAIN CONTENT ===== */}
            <div className="admin-main" style={{ marginLeft: sidebarCollapsed ? '72px' : '260px' }}>
                {/* Top Bar */}
                <header className="admin-topbar">
                    <div className="admin-topbar-left">
                        <h1 className="admin-page-title">
                            {activeTab === 'dashboard' && 'Dashboard'}
                            {activeTab === 'categories' && 'Categories'}
                            {activeTab === 'products' && 'Products'}
                            {activeTab === 'orders' && 'Orders'}
                            {activeTab === 'customers' && 'Customers'}
                            {activeTab === 'coupons' && 'Coupons'}
                        </h1>
                    </div>
                    <div className="admin-topbar-right">
                        <span className="admin-welcome">Welcome, {user.name}</span>
                    </div>
                </header>

                {/* Content Area */}
                <div className="admin-content">

                    {/* ===== DASHBOARD TAB ===== */}
                    {activeTab === 'dashboard' && (
                        <>
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

                            {/* Quick overview of recent orders */}
                            <div className="admin-card">
                                <div className="admin-card-header">
                                    <h2>Recent Orders</h2>
                                    <button className="btn btn-outline btn-sm" onClick={() => setActiveTab('orders')}>View All</button>
                                </div>
                                <div className="table-responsive">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Order ID</th>
                                                <th>Customer</th>
                                                <th>Date</th>
                                                <th>Total</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.length === 0 ? (
                                                <tr><td colSpan="5">No orders yet.</td></tr>
                                            ) : (
                                                orders.slice(0, 5).map(order => (
                                                    <tr key={order.id}>
                                                        <td>#{order.id}</td>
                                                        <td><strong>{order.user?.name}</strong></td>
                                                        <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                                        <td>{formatCurrency(order.total_amount)}</td>
                                                        <td>
                                                            <span className={`status-badge status-${order.status}`}>
                                                                {order.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* ===== ANALYTICS CHARTS ===== */}
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
                                
                                {/* Revenue Chart - Last 7 Days */}
                                <div className="admin-card">
                                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', color: 'var(--text)' }}>Revenue (Last 7 Days)</h3>
                                    {(() => {
                                        // Build last 7 days data
                                        const days = [];
                                        for (let i = 6; i >= 0; i--) {
                                            const d = new Date();
                                            d.setDate(d.getDate() - i);
                                            const dayStr = d.toISOString().split('T')[0];
                                            const dayLabel = d.toLocaleDateString('en-PH', { weekday: 'short' });
                                            const dayOrders = orders.filter(o => {
                                                const oDate = new Date(o.created_at).toISOString().split('T')[0];
                                                return oDate === dayStr;
                                            });
                                            const revenue = dayOrders.reduce((acc, o) => acc + (parseFloat(o.total_amount) || 0), 0);
                                            const count = dayOrders.length;
                                            days.push({ dayLabel, revenue, count, date: d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }) });
                                        }
                                        const maxRevenue = Math.max(...days.map(d => d.revenue), 1);

                                        return (
                                            <div>
                                                {/* Y-axis labels + bars */}
                                                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '200px', padding: '0 0.5rem' }}>
                                                    {days.map((day, idx) => (
                                                        <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                                                            {/* Revenue label on top */}
                                                            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>
                                                                {day.revenue > 0 ? `₱${day.revenue.toFixed(0)}` : ''}
                                                            </div>
                                                            {/* Bar */}
                                                            <div
                                                                style={{
                                                                    width: '100%',
                                                                    maxWidth: '40px',
                                                                    height: `${Math.max((day.revenue / maxRevenue) * 160, day.revenue > 0 ? 6 : 2)}px`,
                                                                    background: day.revenue > 0
                                                                        ? 'linear-gradient(to top, var(--primary), var(--primary-light))'
                                                                        : 'var(--border)',
                                                                    borderRadius: '4px 4px 0 0',
                                                                    transition: 'height 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
                                                                    position: 'relative',
                                                                }}
                                                                title={`${day.date}: ${formatCurrency(day.revenue)} (${day.count} orders)`}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                                {/* X-axis labels */}
                                                <div style={{ display: 'flex', gap: '6px', padding: '0.5rem 0.5rem 0', borderTop: '1px solid var(--border)' }}>
                                                    {days.map((day, idx) => (
                                                        <div key={idx} style={{ flex: 1, textAlign: 'center' }}>
                                                            <div style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text)' }}>{day.dayLabel}</div>
                                                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{day.date}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                                {/* Summary below */}
                                                <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                                                    <div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>7-day Total</div>
                                                        <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{formatCurrency(days.reduce((a, d) => a + d.revenue, 0))}</div>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Orders</div>
                                                        <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{days.reduce((a, d) => a + d.count, 0)}</div>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Daily Avg</div>
                                                        <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{formatCurrency(days.reduce((a, d) => a + d.revenue, 0) / 7)}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>

                                {/* Order Status Breakdown */}
                                <div className="admin-card">
                                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', color: 'var(--text)' }}>Order Status</h3>
                                    {(() => {
                                        const statusCounts = {
                                            pending: orders.filter(o => o.status === 'pending').length,
                                            processing: orders.filter(o => o.status === 'processing').length,
                                            shipped: orders.filter(o => o.status === 'shipped').length,
                                            completed: orders.filter(o => o.status === 'completed').length,
                                            cancelled: orders.filter(o => o.status === 'cancelled').length,
                                        };
                                        const total = orders.length || 1;
                                        const statusColors = {
                                            pending: '#d4af37',
                                            processing: '#007bff',
                                            shipped: '#17a2b8',
                                            completed: '#2a9d8f',
                                            cancelled: '#e63946',
                                        };

                                        return (
                                            <div>
                                                {/* Horizontal stacked bar */}
                                                <div style={{ height: '24px', borderRadius: '12px', overflow: 'hidden', display: 'flex', background: 'var(--border)', marginBottom: '1.5rem' }}>
                                                    {Object.entries(statusCounts).map(([status, count]) => (
                                                        count > 0 && (
                                                            <div
                                                                key={status}
                                                                style={{
                                                                    width: `${(count / total) * 100}%`,
                                                                    background: statusColors[status],
                                                                    transition: 'width 0.5s ease',
                                                                }}
                                                                title={`${status}: ${count}`}
                                                            />
                                                        )
                                                    ))}
                                                </div>
                                                {/* Legend list */}
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                    {Object.entries(statusCounts).map(([status, count]) => (
                                                        <div key={status} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: statusColors[status] }} />
                                                                <span style={{ fontSize: '0.875rem', textTransform: 'capitalize', color: 'var(--text)' }}>{status}</span>
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{count}</span>
                                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({((count / total) * 100).toFixed(0)}%)</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>

                            {/* Inventory summary */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
                                <div className="admin-card" style={{ borderLeft: '4px solid var(--accent)' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Inventory Value</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.25rem' }}>{formatCurrency(inventoryValue)}</div>
                                </div>
                                <div className="admin-card" style={{ borderLeft: '4px solid #ffc107' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Low Stock Items</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.25rem', color: lowStockCount > 0 ? '#ffc107' : '#28a745' }}>{lowStockCount}</div>
                                </div>
                                <div className="admin-card" style={{ borderLeft: '4px solid #dc3545' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Out of Stock</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.25rem', color: outOfStockCount > 0 ? '#dc3545' : '#28a745' }}>{outOfStockCount}</div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ===== ORDERS TAB ===== */}
                    {activeTab === 'orders' && (
                        <div className="admin-card">
                            <div className="admin-card-header">
                                <h2>Manage Orders</h2>
                            </div>
                            <div className="table-responsive">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Customer</th>
                                            <th>Items</th>
                                            <th>Date</th>
                                            <th>Total</th>
                                            <th>Payment</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.length === 0 ? (
                                            <tr><td colSpan="8">No orders yet.</td></tr>
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
                                                        {order.customer_note && (
                                                            <div className="text-sm" style={{ color: '#005CEE', fontSize: '0.75rem', marginTop: '0.5rem', background: '#f0f4f8', padding: '0.5rem', borderRadius: '4px', borderLeft: '3px solid #005CEE' }}>
                                                                <strong>Note:</strong> {order.customer_note}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {order.items && order.items.map((item, idx) => (
                                                            <div key={idx} style={{ fontSize: '0.85rem', marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '8px', maxWidth: '250px' }}>
                                                                <img src={item.variant?.image_url || (item.product?.images && item.product.images.length > 0 ? (item.product.images[0].startsWith('http') ? item.product.images[0] : (item.product.images[0].startsWith('/storage') ? `${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'}${item.product.images[0]}` : `${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'}/storage/${item.product.images[0]}`)) : item.product?.image_url)} alt="product" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', backgroundColor: '#eee', flexShrink: 0 }} />
                                                                <div>
                                                                    <strong style={{ display: 'block', lineHeight: 1.2 }}>{item.quantity}x {item.product?.name || 'Unknown Item'}</strong>
                                                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{(item.size || item.color) && `(${item.size ? item.size : ''}${item.size && item.color ? ', ' : ''}${item.color ? item.color : ''})`}</span>
                                                                </div>
                                                            </div>
                                                        ))}
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

                    {/* ===== PRODUCTS TAB ===== */}
                    {activeTab === 'products' && (
                        <>
                            {/* Inventory Stats */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div className="admin-card" style={{ borderLeft: '4px solid #007bff' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Products</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{products.length}</div>
                                </div>
                                <div className="admin-card" style={{ borderLeft: '4px solid #28a745' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Inventory Value</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatCurrency(inventoryValue)}</div>
                                </div>
                                <div className="admin-card" style={{ borderLeft: '4px solid #ffc107' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Low Stock</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: lowStockCount > 0 ? '#ffc107' : '#28a745' }}>{lowStockCount}</div>
                                </div>
                                <div className="admin-card" style={{ borderLeft: '4px solid #dc3545' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Out of Stock</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: outOfStockCount > 0 ? '#dc3545' : '#28a745' }}>{outOfStockCount}</div>
                                </div>
                            </div>

                            <div className="admin-card">
                                <div className="admin-card-header">
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
                                                <label className="form-label">Subcategory</label>
                                                <select className="form-control" value={productForm.subcategory} onChange={e => setProductForm({ ...productForm, subcategory: e.target.value })}>
                                                    <option value="">None</option>
                                                    <option value="Tops">Tops</option>
                                                    <option value="Bottoms">Bottoms</option>
                                                    <option value="Men's">Men's</option>
                                                    <option value="Women's">Women's</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Price (₱)</label>
                                                <input type="number" step="0.01" className="form-control" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} required />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Stock Quantity</label>
                                                <input type="number" className="form-control" value={productForm.stock_quantity} onChange={e => setProductForm({ ...productForm, stock_quantity: e.target.value })} required />
                                            </div>
                                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                                <label className="form-label">Images (Select multiple to upload)</label>
                                                <input type="file" multiple className="form-control" onChange={e => setProductForm({ ...productForm, images: e.target.files })} accept="image/*" />
                                                {productForm.existing_images && productForm.existing_images.length > 0 && (
                                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                                                        {productForm.existing_images.map((img, idx) => (
                                                            <div key={idx} style={{ position: 'relative', border: '1px solid var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                                                                <img src={(img.startsWith('http') ? img : (img.startsWith('/storage') ? `${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'}${img}` : `${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'}/storage/${img}`))} alt="" style={{ width: '60px', height: '60px', objectFit: 'cover' }} />
                                                                <button type="button" onClick={() => {
                                                                    const newExisting = [...productForm.existing_images];
                                                                    newExisting.splice(idx, 1);
                                                                    setProductForm({...productForm, existing_images: newExisting});
                                                                }} style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(255,0,0,0.8)', color: 'white', border: 'none', cursor: 'pointer', padding: '2px 5px', fontSize: '12px' }}>&times;</button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>You can also provide a single Image URL below.</div>
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
                                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', textTransform: 'none', fontWeight: '500' }}>
                                                    <input type="checkbox" checked={productForm.is_trending} onChange={e => setProductForm({ ...productForm, is_trending: e.target.checked })} style={{ width: '1.2rem', height: '1.2rem' }} />
                                                    Mark as Trending (Appears on Homepage banner)
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
                                <div className="admin-filters">
                                    <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                                        <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                                        <input
                                            type="text"
                                            placeholder="Search products..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="admin-search-input"
                                        />
                                    </div>
                                    <select
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                        className="admin-filter-select"
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    <select
                                        value={stockFilter}
                                        onChange={(e) => setStockFilter(e.target.value)}
                                        className="admin-filter-select"
                                    >
                                        <option value="">All Stock Levels</option>
                                        <option value="in_stock">In Stock (&gt;5)</option>
                                        <option value="low_stock">Low Stock (1-5)</option>
                                        <option value="out_of_stock">Out of Stock (0)</option>
                                    </select>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="admin-filter-select"
                                    >
                                        <option value="name">Sort by Name</option>
                                        <option value="price_low">Price: Low to High</option>
                                        <option value="price_high">Price: High to Low</option>
                                        <option value="stock_low">Stock: Low to High</option>
                                        <option value="stock_high">Stock: High to Low</option>
                                    </select>
                                </div>

                                {/* Results count */}
                                <div style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
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
                                                                <img src={(product.images && product.images.length > 0) ? (product.images[0].startsWith('http') ? product.images[0] : (product.images[0].startsWith('/storage') ? `${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'}${product.images[0]}` : `${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'}/storage/${product.images[0]}`)) : (product.image_url || 'https://via.placeholder.com/50')} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
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
                                                                {product.is_trending && (
                                                                    <span className="badge" style={{ fontSize: '0.65rem', backgroundColor: '#fb8500', color: 'white', marginLeft: '0.5rem', marginTop: '0.25rem', display: 'inline-block' }}>TRENDING</span>
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
                        </>
                    )}

                    {/* ===== CUSTOMERS TAB ===== */}
                    {activeTab === 'customers' && (
                        <div className="admin-card">
                            <div className="admin-card-header">
                                <h2>Customer CRM</h2>
                            </div>
                            <div className="table-responsive">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Joined Date</th>
                                            <th>Total Orders</th>
                                            <th>Lifetime Spend</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {customers.length === 0 ? (
                                            <tr><td colSpan="6">No customers found.</td></tr>
                                        ) : (
                                            customers.map(c => (
                                                <tr key={c.id}>
                                                    <td>#{c.id}</td>
                                                    <td><strong>{c.name}</strong></td>
                                                    <td>{c.email}</td>
                                                    <td>{new Date(c.created_at).toLocaleDateString()}</td>
                                                    <td>{c.orders_count}</td>
                                                    <td style={{ fontWeight: 'bold', color: 'var(--success)' }}>
                                                        {formatCurrency(c.orders_sum_total_amount || 0)}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ===== CATEGORIES TAB ===== */}
                    {activeTab === 'categories' && (
                        <>
                            {/* Category Stats */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div className="admin-card" style={{ borderLeft: '4px solid var(--accent)' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Categories</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.25rem' }}>{categories.length}</div>
                                </div>
                                <div className="admin-card" style={{ borderLeft: '4px solid #007bff' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Products</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.25rem' }}>{categories.reduce((acc, c) => acc + (c.products_count || 0), 0)}</div>
                                </div>
                                <div className="admin-card" style={{ borderLeft: '4px solid #28a745' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Active Categories</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.25rem' }}>{categories.filter(c => (c.products_count || 0) > 0).length}</div>
                                </div>
                                <div className="admin-card" style={{ borderLeft: '4px solid #ffc107' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Empty Categories</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.25rem', color: categories.filter(c => (c.products_count || 0) === 0).length > 0 ? '#ffc107' : '#28a745' }}>
                                        {categories.filter(c => (c.products_count || 0) === 0).length}
                                    </div>
                                </div>
                            </div>

                            <div className="admin-card">
                                <div className="admin-card-header">
                                    <h2>Manage Categories</h2>
                                    <button className="btn btn-primary" onClick={openAddCategoryForm} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Plus size={16} /> Add Category
                                    </button>
                                </div>

                                {/* Add/Edit Category Form */}
                                {showCategoryForm && (
                                    <div style={{
                                        backgroundColor: 'var(--bg-secondary)',
                                        padding: '1.5rem 2rem',
                                        borderRadius: '8px',
                                        marginBottom: '1.5rem',
                                        border: '1px solid var(--border)',
                                        animation: 'fadeIn 0.25s ease'
                                    }}>
                                        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
                                            {editingCategory ? `Edit "${editingCategory.name}"` : 'New Category'}
                                        </h3>
                                        <form onSubmit={handleAddEditCategory} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                                <label className="form-label">Category Name *</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="e.g. T-Shirts, Sneakers, Accessories"
                                                    value={categoryForm.name}
                                                    onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
                                                    required
                                                    autoFocus
                                                />
                                            </div>
                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                                <label className="form-label">Description</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Optional short description"
                                                    value={categoryForm.description}
                                                    onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })}
                                                />
                                            </div>
                                            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                                <button type="button" className="btn btn-outline" onClick={() => { setShowCategoryForm(false); setEditingCategory(null); }}>Cancel</button>
                                                <button type="submit" className="btn btn-primary">
                                                    {editingCategory ? 'Update Category' : 'Create Category'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {/* Search */}
                                <div className="admin-filters">
                                    <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                                        <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                                        <input
                                            type="text"
                                            placeholder="Search categories..."
                                            value={categorySearch}
                                            onChange={(e) => setCategorySearch(e.target.value)}
                                            className="admin-search-input"
                                        />
                                    </div>
                                </div>

                                {/* Results count */}
                                <div style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    Showing {getFilteredCategories().length} of {categories.length} categories
                                </div>

                                {/* Categories Grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                                    {getFilteredCategories().length === 0 ? (
                                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                                            <FolderOpen size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                                            <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>No categories found</p>
                                            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                                {categorySearch ? 'Try a different search term' : 'Create your first category to organize products'}
                                            </p>
                                        </div>
                                    ) : (
                                        getFilteredCategories().map(category => (
                                            <div key={category.id} style={{
                                                background: '#fff',
                                                border: '1px solid var(--border)',
                                                borderRadius: '8px',
                                                padding: '1.25rem',
                                                transition: 'all 0.2s ease',
                                                position: 'relative',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '0.75rem'
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
                                            >
                                                {/* Header */}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                            <div style={{
                                                                width: '36px', height: '36px', borderRadius: '8px',
                                                                background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                flexShrink: 0
                                                            }}>
                                                                <FolderOpen size={18} color="var(--accent)" />
                                                            </div>
                                                            <div>
                                                                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: 'var(--text)' }}>{category.name}</h4>
                                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: #{category.id}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span style={{
                                                        padding: '0.2rem 0.6rem',
                                                        borderRadius: '12px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        backgroundColor: (category.products_count || 0) > 0 ? '#e8f5e9' : '#fff3e0',
                                                        color: (category.products_count || 0) > 0 ? '#2e7d32' : '#e65100',
                                                        whiteSpace: 'nowrap'
                                                    }}>
                                                        {category.products_count || 0} product{(category.products_count || 0) !== 1 ? 's' : ''}
                                                    </span>
                                                </div>

                                                {/* Description */}
                                                {category.description && (
                                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                                                        {category.description}
                                                    </p>
                                                )}
                                                {!category.description && (
                                                    <p style={{ fontSize: '0.825rem', color: '#bbb', margin: 0, fontStyle: 'italic' }}>No description</p>
                                                )}

                                                {/* Actions */}
                                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                                                    <button
                                                        className="btn btn-outline text-sm"
                                                        onClick={() => openEditCategory(category)}
                                                        style={{ flex: 1, padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                                                    >
                                                        <Edit2 size={14} /> Edit
                                                    </button>
                                                    <button
                                                        className="btn btn-outline text-sm"
                                                        onClick={() => handleDeleteCategory(category.id)}
                                                        style={{
                                                            flex: 1, padding: '0.4rem 0.75rem',
                                                            color: (category.products_count || 0) > 0 ? '#aaa' : 'var(--danger)',
                                                            borderColor: (category.products_count || 0) > 0 ? '#ddd' : 'var(--danger)',
                                                            cursor: (category.products_count || 0) > 0 ? 'not-allowed' : 'pointer',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem'
                                                        }}
                                                        title={(category.products_count || 0) > 0 ? 'Cannot delete: has products assigned' : 'Delete category'}
                                                    >
                                                        <Trash2 size={14} /> Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/* ===== COUPONS TAB ===== */}
                    {activeTab === 'coupons' && (
                        <div className="admin-card">
                            <div className="admin-card-header">
                                <h2>Promo Codes & Discounts</h2>
                                <button className="btn btn-primary" onClick={() => setShowCouponForm(!showCouponForm)}>
                                    {showCouponForm ? 'Cancel' : 'Create Coupon'}
                                </button>
                            </div>

                            {showCouponForm && (
                                <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '2rem', borderRadius: 'var(--radius)', marginBottom: '2rem' }}>
                                    <h3>Create New Coupon</h3>
                                    <form onSubmit={handleAddCoupon} style={{ marginTop: '1rem', display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                                        <div className="form-group">
                                            <label className="form-label">Coupon Code *</label>
                                            <input type="text" className="form-control" style={{ textTransform: 'uppercase' }} placeholder="e.g. SUMMER20" value={couponForm.code} onChange={e => setCouponForm({ ...couponForm, code: e.target.value })} required />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Discount Type *</label>
                                            <select className="form-control" value={couponForm.type} onChange={e => setCouponForm({ ...couponForm, type: e.target.value })} required>
                                                <option value="percent">Percentage (%)</option>
                                                <option value="fixed">Fixed Amount (₱)</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Discount Value *</label>
                                            <input type="number" step="0.01" min="0" className="form-control" placeholder={couponForm.type === 'percent' ? "e.g. 20 (for 20%)" : "e.g. 15 (for ₱15)"} value={couponForm.value} onChange={e => setCouponForm({ ...couponForm, value: e.target.value })} required />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Usage Limit</label>
                                            <input type="number" min="1" className="form-control" placeholder="Leave empty for unlimited" value={couponForm.usage_limit} onChange={e => setCouponForm({ ...couponForm, usage_limit: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Expires At</label>
                                            <input type="date" className="form-control" value={couponForm.expires_at} onChange={e => setCouponForm({ ...couponForm, expires_at: e.target.value })} />
                                        </div>
                                        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                            <button type="submit" className="btn btn-primary">Save Coupon</button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            <div className="table-responsive">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Code</th>
                                            <th>Discount</th>
                                            <th>Usage</th>
                                            <th>Status</th>
                                            <th>Expires</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {coupons.length === 0 ? (
                                            <tr><td colSpan="6">No coupons created yet.</td></tr>
                                        ) : (
                                            coupons.map(c => {
                                                const isExpired = c.expires_at && new Date(c.expires_at) < new Date();
                                                const isUsedUp = c.usage_limit && c.used_count >= c.usage_limit;
                                                const isActive = c.is_active && !isExpired && !isUsedUp;
                                                
                                                return (
                                                    <tr key={c.id}>
                                                        <td><code style={{ fontSize: '1.1rem', background: '#f4f4f4', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>{c.code}</code></td>
                                                        <td style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
                                                            {c.type === 'percent' ? `${c.value}% OFF` : `₱${c.value} OFF`}
                                                        </td>
                                                        <td>{c.used_count} / {c.usage_limit ? c.usage_limit : '∞'}</td>
                                                        <td>
                                                            <span className="badge" style={{ backgroundColor: isActive ? 'var(--success)' : 'var(--danger)', color: 'white' }}>
                                                                {isActive ? 'Active' : (isExpired ? 'Expired' : 'Inactive/Used')}
                                                            </span>
                                                        </td>
                                                        <td>{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : 'Never'}</td>
                                                        <td>
                                                            <button className="btn btn-outline text-sm" onClick={() => handleDeleteCoupon(c.id)} style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                                                                <Trash2 size={16} /> Delete
                                                            </button>
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

                </div>
            </div>

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
                                            <input type="text" className="form-control" placeholder="e.g., TSHIRT001" value={bulkForm.base_sku} onChange={e => setBulkForm({ ...bulkForm, base_sku: e.target.value })} required />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Sizes (comma-separated)</label>
                                            <input type="text" className="form-control" placeholder="S, M, L, XL" value={bulkForm.sizes} onChange={e => setBulkForm({ ...bulkForm, sizes: e.target.value })} required />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Colors (comma-separated)</label>
                                            <input type="text" className="form-control" placeholder="Red, Blue, Black" value={bulkForm.colors} onChange={e => setBulkForm({ ...bulkForm, colors: e.target.value })} required />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Price (leave empty for parent price)</label>
                                            <input type="number" step="0.01" className="form-control" placeholder="Optional" value={bulkForm.price} onChange={e => setBulkForm({ ...bulkForm, price: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Initial Stock</label>
                                            <input type="number" className="form-control" value={bulkForm.stock_quantity} onChange={e => setBulkForm({ ...bulkForm, stock_quantity: e.target.value })} />
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
                                            <input type="text" className="form-control" value={variantForm.sku} onChange={e => setVariantForm({ ...variantForm, sku: e.target.value })} required />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Size</label>
                                            <input type="text" className="form-control" placeholder="e.g., M, L, XL" value={variantForm.size} onChange={e => setVariantForm({ ...variantForm, size: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Color</label>
                                            <input type="text" className="form-control" placeholder="e.g., Red, Blue" value={variantForm.color} onChange={e => setVariantForm({ ...variantForm, color: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Price Override</label>
                                            <input type="number" step="0.01" className="form-control" placeholder="Leave empty for parent price" value={variantForm.price} onChange={e => setVariantForm({ ...variantForm, price: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Stock Quantity *</label>
                                            <input type="number" className="form-control" value={variantForm.stock_quantity} onChange={e => setVariantForm({ ...variantForm, stock_quantity: e.target.value })} required />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Image URL</label>
                                            <input type="url" className="form-control" placeholder="Optional variant image" value={variantForm.image_url} onChange={e => setVariantForm({ ...variantForm, image_url: e.target.value })} />
                                        </div>
                                        <div className="form-group" style={{ display: 'flex', alignItems: 'center' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                                <input type="checkbox" checked={variantForm.is_active} onChange={e => setVariantForm({ ...variantForm, is_active: e.target.checked })} />
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
