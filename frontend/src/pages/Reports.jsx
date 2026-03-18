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
    const [error, setError] = useState(null);
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

    const recentOrders = orders
        .slice()
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .filter(o => o.status === 'pending' || (Date.now() - new Date(o.created_at)) < 1000 * 60 * 60); // pending or within 1h

    const lowStock = products.filter(p => (p.stock_quantity ?? 0) <= LOW_STOCK_THRESHOLD);

    // summary metrics
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    const totalRevenue = orders.reduce((acc, o) => acc + (parseFloat(o.total_amount || o.total || 0) || 0), 0);
    const lowStockCount = lowStock.length;

    return (
        <div className="container">
            <h1 style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>Admin Reports</h1>
            {error && <div className="card" style={{ padding: '0.75rem', background: '#fee', color: '#900' }}>{error}</div>}

            <section style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    <div className="stat-card" style={{ padding: '1rem', minWidth: 160 }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Total Orders</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{totalOrders}</div>
                    </div>
                    <div className="stat-card" style={{ padding: '1rem', minWidth: 160 }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Pending Orders</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{pendingOrders}</div>
                    </div>
                    <div className="stat-card" style={{ padding: '1rem', minWidth: 160 }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Completed Orders</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{completedOrders}</div>
                    </div>
                    <div className="stat-card" style={{ padding: '1rem', minWidth: 160 }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Total Revenue</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalRevenue)}</div>
                    </div>
                    <div className="stat-card" style={{ padding: '1rem', minWidth: 160 }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Low Stock Products</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{lowStockCount}</div>
                    </div>
                </div>
                <h2 style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>Checkout Notifications</h2>
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

            <section style={{ marginTop: '1.5rem' }}>
                <h2 style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>Low Stock Alert</h2>
                {lowStock.length === 0 ? (
                    <div className="card" style={{ padding: '0.75rem' }}>No low-stock products.</div>
                ) : (
                    <div className="table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>SKU / ID</th>
                                    <th>Stock</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lowStock.map(p => (
                                    <tr key={p.id}>
                                        <td style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <img src={p.image_url || 'https://via.placeholder.com/40'} alt={p.name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />
                                            <div>
                                                <strong>{p.name}</strong>
                                                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{p.category?.name}</div>
                                            </div>
                                        </td>
                                        <td>{p.sku || p.id}</td>
                                        <td>{p.stock_quantity ?? 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <div style={{ marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <div>Last updated: {new Date(lastFetchedRef.current).toLocaleString()}</div>
                <div>Polling every {POLL_INTERVAL / 1000}s.</div>
            </div>
        </div>
    );
};

export default Reports;
