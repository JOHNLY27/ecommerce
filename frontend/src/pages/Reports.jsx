import React, { useContext, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const POLL_INTERVAL = 10000; // 10s
const LOW_STOCK_THRESHOLD = 5;

const Reports = () => {
    const { user, loading } = useContext(AuthContext);
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [salesReport, setSalesReport] = useState(null);
    const [monthlyData, setMonthlyData] = useState([]);
    const [productReport, setProductReport] = useState(null);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });
    const [exportLoading, setExportLoading] = useState(false);
    const lastFetchedRef = useRef(Date.now());

    useEffect(() => {
        if (!loading) {
            if (!user) return navigate('/login');
            if (!user.is_admin) return navigate('/');
            fetchAll();
            const id = setInterval(fetchAll, POLL_INTERVAL);
            return () => clearInterval(id);
        }
    }, [user, loading, navigate]);

    useEffect(() => {
        if (user?.is_admin) {
            fetchSalesReport();
            fetchMonthlyReport();
            fetchProductReport();
        }
    }, [dateRange, user]);

    const fetchAll = async () => {
        try {
            const [ordersRes, productsRes] = await Promise.all([
                axios.get('/admin/orders'),
                axios.get('/admin/products')
            ]);
            setOrders(ordersRes.data || []);
            setProducts(productsRes.data || []);
            lastFetchedRef.current = Date.now();
            setError(null);
        } catch (err) {
            console.error('Error fetching reports data', err);
            setError('Failed to load reports (check API endpoints).');
        }
    };

    const fetchSalesReport = async () => {
        try {
            const res = await axios.get('/admin/reports/sales', {
                params: { start_date: dateRange.start, end_date: dateRange.end }
            });
            setSalesReport(res.data);
        } catch (err) {
            console.error('Error fetching sales report', err);
        }
    };

    const fetchMonthlyReport = async () => {
        try {
            const res = await axios.get('/admin/reports/monthly', {
                params: { months: 12 }
            });
            setMonthlyData(res.data.data || []);
        } catch (err) {
            console.error('Error fetching monthly report', err);
        }
    };

    const fetchProductReport = async () => {
        try {
            const res = await axios.get('/admin/reports/products', {
                params: { start_date: dateRange.start, end_date: dateRange.end, limit: 10 }
            });
            setProductReport(res.data);
        } catch (err) {
            console.error('Error fetching product report', err);
        }
    };

    const handleExport = async (type) => {
        setExportLoading(true);
        try {
            const response = await axios.get('/admin/reports/export', {
                params: { type, start_date: dateRange.start, end_date: dateRange.end },
                responseType: 'blob'
            });
            
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${type}_report_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Export error:', err);
            alert('Failed to export report. Please try again.');
        } finally {
            setExportLoading(false);
        }
    };

    const recentOrders = orders
        .slice()
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .filter(o => o.status === 'pending' || (Date.now() - new Date(o.created_at)) < 1000 * 60 * 60);

    const lowStock = products.filter(p => (p.stock_quantity ?? 0) <= LOW_STOCK_THRESHOLD);

    // Calculate metrics
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    const totalRevenue = orders.reduce((acc, o) => acc + (parseFloat(o.total_amount || o.total || 0) || 0), 0);
    const lowStockCount = lowStock.length;

    // Calculate this month's sales
    const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const thisMonthOrders = orders.filter(o => new Date(o.created_at) >= thisMonthStart && o.status === 'completed');
    const thisMonthRevenue = thisMonthOrders.reduce((acc, o) => acc + (parseFloat(o.total_amount || o.total || 0) || 0), 0);
    const thisMonthOrderCount = thisMonthOrders.length;

    // Chart component for monthly sales
    const MonthlyChart = () => {
        const maxRevenue = Math.max(...monthlyData.map(d => d.revenue), 1);
        const maxOrders = Math.max(...monthlyData.map(d => d.orders), 1);

        return (
            <div className="admin-card" style={{ marginTop: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', color: 'var(--text)' }}>Monthly Sales Trend (Last 12 Months)</h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '220px', padding: '0 0.5rem' }}>
                    {monthlyData.map((data, idx) => (
                        <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
                            <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '170px' }}>
                                <div
                                    style={{
                                        width: '12px',
                                        height: `${(data.revenue / maxRevenue) * 100}%`,
                                        background: 'linear-gradient(to top, var(--primary), #333)',
                                        borderRadius: '2px 2px 0 0',
                                        minHeight: data.revenue > 0 ? '4px' : '0',
                                        transition: 'height 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
                                    }}
                                    title={`Revenue: ₱${data.revenue.toFixed(2)}`}
                                />
                                <div
                                    style={{
                                        width: '12px',
                                        height: `${(data.orders / maxOrders) * 100}%`,
                                        background: 'linear-gradient(to top, var(--accent), #e8c868)',
                                        borderRadius: '2px 2px 0 0',
                                        minHeight: data.orders > 0 ? '4px' : '0',
                                        transition: 'height 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
                                    }}
                                    title={`Orders: ${data.orders}`}
                                />
                            </div>
                        </div>
                    ))}
                </div>
                {/* X-axis labels */}
                <div style={{ display: 'flex', gap: '6px', padding: '0.5rem 0.5rem 0', borderTop: '1px solid var(--border)' }}>
                    {monthlyData.map((data, idx) => (
                        <div key={idx} style={{ flex: 1, textAlign: 'center' }}>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                {data.month_name}
                            </span>
                        </div>
                    ))}
                </div>
                {/* Legend */}
                <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '12px', height: '12px', background: 'var(--primary)', borderRadius: '2px' }} />
                        <span style={{ fontSize: '0.85rem', color: 'var(--text)' }}>Revenue</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '12px', height: '12px', background: 'var(--accent)', borderRadius: '2px' }} />
                        <span style={{ fontSize: '0.85rem', color: 'var(--text)' }}>Orders</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '2rem' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Link to="/admin" className="admin-back-link">Back</Link>
                        <span style={{ color: 'var(--border)' }}>|</span>
                        <h1 style={{ fontWeight: 700, fontSize: '1.5rem', color: 'var(--text)', margin: 0 }}>Reports & Analytics</h1>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => handleExport('orders')}
                            disabled={exportLoading}
                            className="btn btn-outline btn-sm"
                            style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
                        >
                            {exportLoading ? 'Exporting...' : 'Export Orders'}
                        </button>
                        <button
                            onClick={() => handleExport('products')}
                            disabled={exportLoading}
                            className="btn btn-primary btn-sm"
                        >
                            {exportLoading ? 'Exporting...' : 'Export Products'}
                        </button>
                    </div>
                </div>

                {error && <div className="admin-card" style={{ padding: '0.75rem', background: '#fee', color: '#900', marginBottom: '1rem', borderLeft: '4px solid #dc3545' }}>{error}</div>}

                {/* Date Range Filter */}
                <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <label style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date Range</label>
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            style={{ padding: '0.5rem 0.75rem', border: '1px solid var(--border)', borderRadius: '6px', fontFamily: 'inherit', fontSize: '0.9rem' }}
                        />
                        <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>to</span>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            style={{ padding: '0.5rem 0.75rem', border: '1px solid var(--border)', borderRadius: '6px', fontFamily: 'inherit', fontSize: '0.9rem' }}
                        />
                    </div>
                </div>

                {/* This Month's Sales Highlight */}
                <div className="admin-card" style={{ padding: '2rem', background: 'linear-gradient(135deg, var(--primary) 0%, #2a2a2a 60%, var(--accent) 100%)', color: 'white', border: 'none', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '0.85rem', marginBottom: '1.25rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>This Month's Performance</h2>
                    <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
                        <div>
                            <div style={{ fontSize: '2.25rem', fontWeight: 700, lineHeight: 1.2 }}>
                                {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(thisMonthRevenue)}
                            </div>
                            <div style={{ fontSize: '0.85rem', opacity: 0.6, marginTop: '0.25rem' }}>Total Sales Revenue</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '2.25rem', fontWeight: 700, lineHeight: 1.2 }}>{thisMonthOrderCount}</div>
                            <div style={{ fontSize: '0.85rem', opacity: 0.6, marginTop: '0.25rem' }}>Orders Completed</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '2.25rem', fontWeight: 700, lineHeight: 1.2, color: 'var(--accent)' }}>
                                {thisMonthOrderCount > 0 ? new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(thisMonthRevenue / thisMonthOrderCount) : '₱0.00'}
                            </div>
                            <div style={{ fontSize: '0.85rem', opacity: 0.6, marginTop: '0.25rem' }}>Average Order Value</div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '0', marginBottom: '1.5rem', background: '#fff', borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                    {['overview', 'sales', 'products', 'notifications'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                flex: 1,
                                padding: '0.85rem 1.5rem',
                                background: activeTab === tab ? 'var(--primary)' : 'transparent',
                                border: 'none',
                                color: activeTab === tab ? '#fff' : 'var(--text-muted)',
                                fontWeight: activeTab === tab ? 600 : 400,
                                cursor: 'pointer',
                                textTransform: 'capitalize',
                                fontSize: '0.9rem',
                                fontFamily: 'inherit',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <section>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div className="admin-card" style={{ borderLeft: '4px solid var(--primary)' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Orders</div>
                                <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem' }}>{totalOrders}</div>
                            </div>
                            <div className="admin-card" style={{ borderLeft: '4px solid var(--accent)' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending</div>
                                <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--accent)' }}>{pendingOrders}</div>
                            </div>
                            <div className="admin-card" style={{ borderLeft: '4px solid #2a9d8f' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Completed</div>
                                <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem', color: '#2a9d8f' }}>{completedOrders}</div>
                            </div>
                            <div className="admin-card" style={{ borderLeft: '4px solid var(--primary)' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Revenue</div>
                                <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem' }}>
                                    {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(totalRevenue)}
                                </div>
                            </div>
                            <div className="admin-card" style={{ borderLeft: `4px solid ${lowStockCount > 0 ? '#e63946' : '#2a9d8f'}` }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Low Stock</div>
                                <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem', color: lowStockCount > 0 ? '#e63946' : '#2a9d8f' }}>{lowStockCount}</div>
                            </div>
                        </div>

                        <MonthlyChart />
                    </section>
                )}

                {/* Sales Tab */}
                {activeTab === 'sales' && salesReport && (
                    <section>
                        <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem' }}>Sales Summary ({salesReport.period.start} → {salesReport.period.end})</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                                <div style={{ textAlign: 'center', padding: '1.25rem', background: 'var(--bg-secondary)', borderRadius: '8px', borderTop: '3px solid var(--primary)' }}>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text)' }}>{salesReport.summary.total_orders}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Total Orders</div>
                                </div>
                                <div style={{ textAlign: 'center', padding: '1.25rem', background: 'var(--bg-secondary)', borderRadius: '8px', borderTop: '3px solid #2a9d8f' }}>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#2a9d8f' }}>{salesReport.summary.completed_orders}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Completed</div>
                                </div>
                                <div style={{ textAlign: 'center', padding: '1.25rem', background: 'var(--bg-secondary)', borderRadius: '8px', borderTop: '3px solid var(--accent)' }}>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent)' }}>{salesReport.summary.pending_orders}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Pending</div>
                                </div>
                                <div style={{ textAlign: 'center', padding: '1.25rem', background: 'var(--bg-secondary)', borderRadius: '8px', borderTop: '3px solid #e63946' }}>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#e63946' }}>{salesReport.summary.cancelled_orders}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Cancelled</div>
                                </div>
                                <div style={{ textAlign: 'center', padding: '1.25rem', background: 'var(--bg-secondary)', borderRadius: '8px', borderTop: '3px solid var(--primary)' }}>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>
                                        {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(salesReport.summary.total_revenue)}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Total Revenue</div>
                                </div>
                                <div style={{ textAlign: 'center', padding: '1.25rem', background: 'var(--bg-secondary)', borderRadius: '8px', borderTop: '3px solid var(--accent)' }}>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent)' }}>
                                        {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(salesReport.summary.average_order_value)}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Avg Order Value</div>
                                </div>
                            </div>
                        </div>

                        <div className="admin-card">
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Orders in Selected Period</h3>
                            <div className="table-responsive">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Order #</th>
                                            <th>Customer</th>
                                            <th>Date</th>
                                            <th>Status</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {salesReport.orders.map(o => (
                                            <tr key={o.id}>
                                                <td>#{o.id}</td>
                                                <td>{o.user?.name || o.contact || 'Guest'}</td>
                                                <td>{new Date(o.created_at).toLocaleDateString()}</td>
                                                <td><span className={`status-badge status-${o.status}`}>{o.status}</span></td>
                                                <td style={{ fontWeight: 600 }}>{new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(o.total_amount || 0)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                )}

                {/* Products Tab */}
                {activeTab === 'products' && productReport && (
                    <section>
                        <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Top Selling Products</h3>
                            {productReport.top_products.length === 0 ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No sales data for the selected period.</div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Rank</th>
                                                <th>Product</th>
                                                <th>Category</th>
                                                <th>Units Sold</th>
                                                <th>Revenue</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {productReport.top_products.map((item, idx) => (
                                                <tr key={item.product_id}>
                                                    <td>
                                                        <span style={{
                                                            width: '28px',
                                                            height: '28px',
                                                            borderRadius: '50%',
                                                            background: idx < 3 ? 'var(--accent)' : 'var(--bg-secondary)',
                                                            color: idx < 3 ? 'var(--primary)' : 'var(--text-muted)',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 700
                                                        }}>{idx + 1}</span>
                                                    </td>
                                                    <td style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                        <img 
                                                            src={item.product?.images && item.product.images.length > 0 ? (item.product.images[0].startsWith('http') ? item.product.images[0] : (item.product.images[0].startsWith('/storage') ? `${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'}${item.product.images[0]}` : `${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'}/storage/${item.product.images[0]}`)) : 'https://via.placeholder.com/40'} 
                                                            alt={item.product?.name} 
                                                            style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} 
                                                        />
                                                        <strong>{item.product?.name}</strong>
                                                    </td>
                                                    <td>{item.product?.category?.name || 'N/A'}</td>
                                                    <td style={{ fontWeight: 600 }}>{item.total_sold}</td>
                                                    <td style={{ fontWeight: 600 }}>{new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(item.total_revenue)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="admin-card">
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Low Stock Alert</h3>
                            {productReport.low_stock.length === 0 ? (
                                <div style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '8px', color: '#2a9d8f', fontWeight: 500, textAlign: 'center' }}>
                                    All products are well stocked!
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Product</th>
                                                <th>Category</th>
                                                <th>Current Stock</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {productReport.low_stock.map(p => (
                                                <tr key={p.id}>
                                                    <td style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                        <img 
                                                            src={p.images && p.images.length > 0 ? (p.images[0].startsWith('http') ? p.images[0] : (p.images[0].startsWith('/storage') ? `${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'}${p.images[0]}` : `${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'}/storage/${p.images[0]}`)) : 'https://via.placeholder.com/40'} 
                                                            alt={p.name} 
                                                            style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} 
                                                        />
                                                        <strong>{p.name}</strong>
                                                    </td>
                                                    <td>{p.category?.name || 'N/A'}</td>
                                                    <td style={{ fontWeight: 600 }}>{p.stock_quantity}</td>
                                                    <td>
                                                        <span className={p.stock_quantity === 0 ? 'status-badge status-cancelled' : 'status-badge status-pending'}>
                                                            {p.stock_quantity === 0 ? 'Out of Stock' : 'Low Stock'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                    <section>
                        <div className="admin-card">
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Recent Checkouts (Pending or Last Hour)</h3>
                            {recentOrders.length === 0 ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No recent checkouts.</div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Order</th>
                                                <th>Customer</th>
                                                <th>Date</th>
                                                <th>Total</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentOrders.map(o => (
                                                <tr key={o.id}>
                                                    <td>#{o.id}</td>
                                                    <td>{o.user?.name || o.contact || 'Guest'}</td>
                                                    <td>{new Date(o.created_at).toLocaleString()}</td>
                                                    <td style={{ fontWeight: 600 }}>{new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(o.total_amount || o.total || 0)}</td>
                                                    <td><span className={`status-badge status-${o.status}`}>{o.status}</span></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Footer */}
                <div style={{ marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', gap: '1rem' }}>
                    <span>Last updated: {new Date(lastFetchedRef.current).toLocaleString()}</span>
                    <span>&middot;</span>
                    <span>Auto-refresh every {POLL_INTERVAL / 1000}s</span>
                </div>
            </div>
        </div>
    );
};

export default Reports;
