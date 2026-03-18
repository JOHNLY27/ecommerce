import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { Bell } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const NotificationsDropdown = () => {
    const { user, loading } = useContext(AuthContext);
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loadingNotifs, setLoadingNotifs] = useState(false);
    const ref = useRef();
    const navigate = useNavigate();

    useEffect(() => {
        const onDoc = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('click', onDoc);
        return () => document.removeEventListener('click', onDoc);
    }, []);

    useEffect(() => {
        // optional polling when user is logged in
        let id;
        if (user) {
            fetchNotifications();
            id = setInterval(fetchNotifications, 15000);
        }
        return () => clearInterval(id);
    }, [user]);

    const fetchNotifications = async () => {
        if (!user) return;
        setLoadingNotifs(true);
        try {
            const res = await axios.get('/notifications');
            setNotifications(res.data || []);
        } catch (err) {
            console.error('Failed to load notifications', err);
        } finally {
            setLoadingNotifs(false);
        }
    };

    const unreadCount = notifications.filter(n => !n.read_at).length;

    const markAsRead = async (id) => {
        try {
            await axios.post(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
        } catch (err) {
            console.error('Failed to mark notification read', err);
        }
    };

    const handleClickNotif = (notif) => {
        // mark read and navigate to order details if provided
        markAsRead(notif.id);
        const orderId = notif.data?.order_id || (notif.data && JSON.parse(notif.data).order_id);
        if (orderId) navigate(`/orders/${orderId}`);
    };

    if (loading) return null;

    return (
        <div ref={ref} style={{ display: 'inline-block', position: 'relative', marginRight: '0.5rem' }}>
            <button className="btn-icon" onClick={() => { setOpen(v => !v); if (!open) fetchNotifications(); }} title="Notifications" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="cart-count" style={{ position: 'absolute', top: -6, right: -6 }}>{unreadCount}</span>
                )}
            </button>

            {open && (
                <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', background: 'white', border: '1px solid #ddd', borderRadius: 6, boxShadow: '0 6px 18px rgba(0,0,0,0.06)', minWidth: 320, zIndex: 40 }}>
                    <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong>Notifications</strong>
                        <button className="btn btn-link" onClick={fetchNotifications} style={{ fontSize: '0.85rem' }}>Refresh</button>
                    </div>
                    <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                        {loadingNotifs ? (
                            <div style={{ padding: '0.75rem' }}>Loading...</div>
                        ) : notifications.length === 0 ? (
                            <div style={{ padding: '0.75rem' }}>No notifications.</div>
                        ) : (
                            notifications.map(n => {
                                const data = n.data && typeof n.data === 'string' ? JSON.parse(n.data) : n.data || {};
                                return (
                                    <div key={n.id} style={{ padding: '0.75rem', borderBottom: '1px solid #f3f3f3', background: n.read_at ? 'white' : '#f7fbff', cursor: 'pointer' }} onClick={() => handleClickNotif({ ...n, data })}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '0.95rem' }}>{data.message || data.message || 'Order update'}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#666' }}>{new Date(n.created_at).toLocaleString()}</div>
                                            </div>
                                            {!n.read_at && (
                                                <button className="btn btn-link" onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}>Mark read</button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationsDropdown;
