import React, { useContext, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
            <div style={{ marginTop: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Monthly Sales Trend (Last 12 Months)</h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '200px', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                    {monthlyData.map((data, idx) => (
                        <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                            <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '150px' }}>
                                <div
                                    style={{
                                        width: '12px',
                                        height: `${(data.revenue / maxRevenue) * 100}%`,
                                        background: 'linear-gradient(to top, #28a745, #34ce57)',
                                        borderRadius: '2px',
                                        minHeight: data.revenue > 0 ? '4px' : '0',
                                        position: 'relative'
                                    }}
                                    title={`Revenue: $${data.revenue.toFixed(2)}`}
                                />
                                <div
                                    style={{
                                        width: '12px',
                                        height: `${(data.orders / maxOrders) * 100}%`,
                                        background: 'linear-gradient(to top, #007bff, #4dabf7)',
                                        borderRadius: '2px',
                                        minHeight: data.orders > 0 ? '4px' : '0',
                                        position: 'relative'
                                    }}
                                    title={`Orders: ${data.orders}`}
                                />
                            </div>
                            <span style={{ fontSize: '0.7rem', color: '#666', transform: 'rotate(-45deg)', whiteSpace: 'nowrap' }}>
                                {data.month_name}
                            </span>
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '12px', height: '12px', background: '#28a745', borderRadius: '2px' }} />
                        <span>Revenue</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '12px', height: '12px', background: '#007bff', borderRadius: '2px' }} />
                        <span>Orders</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>Admin Reports & Analytics</h1>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={() => handleExport('orders')}
                        disabled={exportLoading}
                        style={{
                            padding: '0.5rem 1rem',
                            background: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: exportLoading ? 'not-allowed' : 'pointer',
                            fontSize: '0.9rem'
                        }}
                    >
                        {exportLoading ? 'Exporting...' : 'Export Orders CSV'}
                    </button>
                    <button
                        onClick={() => handleExport('products')}
                        disabled={exportLoading}
                        style={{
                            padding: '0.5rem 1rem',
                            background: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: exportLoading ? 'not-allowed' : 'pointer',
                            fontSize: '0.9rem'
                        }}
                    >
                        {exportLoading ? 'Exporting...' : 'Export Products CSV'}
                    </button>
                </div>
            </div>

            {error && <div className="card" style={{ padding: '0.75rem', background: '#fee', color: '#900', marginTop: '1rem' }}>{error}</div>}

            {/* Date Range Filter */}
            <div className="card" style={{ marginTop: '1rem', padding: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <label style={{ fontWeight: 500 }}>Date Range:</label>
                    <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                    <span>to</span>
                    <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                </div>
            </div>

            {/* This Month's Sales Highlight */}
            <div className="card" style={{ marginTop: '1rem', padding: '1.5rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', opacity: 0.9 }}>This Month's Performance</h2>
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    <div>
                        <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(thisMonthRevenue)}
                        </div>
                        <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Total Sales Revenue</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '2rem', fontWeight: 700 }}>{thisMonthOrderCount}</div>
                        <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Orders Completed</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                            {thisMonthOrderCount > 0 ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(thisMonthRevenue / thisMonthOrderCount) : '$0.00'}
                        </div>
                        <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Average Order Value</div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', borderBottom: '2px solid #eee' }}>
                {['overview', 'sales', 'products', 'notifications'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === tab ? '2px solid #007bff' : 'none',
                            color: activeTab === tab ? '#007bff' : '#666',
                            fontWeight: activeTab === tab ? 600 : 400,
                            cursor: 'pointer',
                            textTransform: 'capitalize'
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <section style={{ marginTop: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                        <div className="stat-card" style={{ padding: '1rem', minWidth: 160, flex: 1 }}>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Total Orders</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{totalOrders}</div>
                        </div>
                        <div className="stat-card" style={{ padding: '1rem', minWidth: 160, flex: 1 }}>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Pending Orders</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffc107' }}>{pendingOrders}</div>
                        </div>
                        <div className="stat-card" style={{ padding: '1rem', minWidth: 160, flex: 1 }}>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Completed Orders</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#28a745' }}>{completedOrders}</div>
                        </div>
                        <div className="stat-card" style={{ padding: '1rem', minWidth: 160, flex: 1 }}>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Total Revenue</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#007bff' }}>
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalRevenue)}
                            </div>
                        </div>
                        <div className="stat-card" style={{ padding: '1rem', minWidth: 160, flex: 1 }}>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Low Stock Products</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: lowStockCount > 0 ? '#dc3545' : '#28a745' }}>{lowStockCount}</div>
                        </div>
                    </div>

                    <MonthlyChart />
                </section>
            )}

            {/* Sales Tab */}
            {activeTab === 'sales' && salesReport && (
                <section style={{ marginTop: '1rem' }}>
                    <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Sales Summary ({salesReport.period.start} to {salesReport.period.end})</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                            <div style={{ textAlign: 'center', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#007bff' }}>{salesReport.summary.total_orders}</div>
                                <div style={{ fontSize: '0.85rem', color: '#666' }}>Total Orders</div>
                            </div>
                            <div style={{ textAlign: 'center', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#28a745' }}>{salesReport.summary.completed_orders}</div>
                                <div style={{ fontSize: '0.85rem', color: '#666' }}>Completed</div>
                            </div>
                            <div style={{ textAlign: 'center', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffc107' }}>{salesReport.summary.pending_orders}</div>
                                <div style={{ fontSize: '0.85rem', color: '#666' }}>Pending</div>
                            </div>
                            <div style={{ textAlign: 'center', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#dc3545' }}>{salesReport.summary.cancelled_orders}</div>
                                <div style={{ fontSize: '0.85rem', color: '#666' }}>Cancelled</div>
                            </div>
                            <div style={{ textAlign: 'center', padding: '1rem', background: '#e8f5e9', borderRadius: '8px' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#28a745' }}>
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(salesReport.summary.total_revenue)}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#666' }}>Total Revenue</div>
                            </div>
                            <div style={{ textAlign: 'center', padding: '1rem', background: '#e3f2fd', borderRadius: '8px' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#007bff' }}>
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(salesReport.summary.average_order_value)}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#666' }}>Avg Order Value</div>
                            </div>
                        </div>
                    </div>

                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Orders in Selected Period</h3>
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
                                        <td>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(o.total_amount || 0)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && productReport && (
                <section style={{ marginTop: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Top Selling Products</h3>
                    {productReport.top_products.length === 0 ? (
                        <div className="card" style={{ padding: '1rem' }}>No sales data for the selected period.</div>
                    ) : (
                        <div className="table-responsive">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Category</th>
                                        <th>Units Sold</th>
                                        <th>Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productReport.top_products.map((item, idx) => (
                                        <tr key={item.product_id}>
                                            <td style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                <span style={{
                                                    width: '24px',
                                                    height: '24px',
                                                    borderRadius: '50%',
                                                    background: idx < 3 ? '#ffd700' : '#e9ecef',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 700
                                                }}>{idx + 1}</span>
                                                <img 
                                                    src={item.product?.image_url || 'https://via.placeholder.com/40'} 
                                                    alt={item.product?.name} 
                                                    style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} 
                                                />
                                                <strong>{item.product?.name}</strong>
                                            </td>
                                            <td>{item.product?.category?.name || 'N/A'}</td>
                                            <td>{item.total_sold}</td>
                                            <td>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.total_revenue)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <h3 style={{ fontSize: '1.1rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>Low Stock Alert</h3>
                    {productReport.low_stock.length === 0 ? (
                        <div className="card" style={{ padding: '1rem', background: '#d4edda', color: '#155724' }}>All products are well stocked!</div>
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
                                            <td style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                <img 
                                                    src={p.image_url || 'https://via.placeholder.com/40'} 
                                                    alt={p.name} 
                                                    style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} 
                                                />
                                                <div>
                                                    <strong>{p.name}</strong>
                                                </div>
                                            </td>
                                            <td>{p.category?.name || 'N/A'}</td>
                                            <td>{p.stock_quantity}</td>
                                            <td>
                                                <span style={{
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    background: p.stock_quantity === 0 ? '#dc3545' : '#ffc107',
                                                    color: p.stock_quantity === 0 ? 'white' : '#000'
                                                }}>
                                                    {p.stock_quantity === 0 ? 'Out of Stock' : 'Low Stock'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
                <section style={{ marginTop: '1rem' }}>
                    <h2 style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>Recent Checkouts (Pending or Last Hour)</h2>
                    {recentOrders.length === 0 ? (
                        <div className="card" style={{ padding: '0.75rem' }}>No recent checkouts.</div>
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
                                            <td>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(o.total_amount || o.total || 0)}</td>
                                            <td><span className={`status-badge status-${o.status}`}>{o.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            )}

            <div style={{ marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <div>Last updated: {new Date(lastFetchedRef.current).toLocaleString()}</div>
                <div>Polling every {POLL_INTERVAL / 1000}s.</div>
            </div>
        </div>
    );
};

export default Reports;
