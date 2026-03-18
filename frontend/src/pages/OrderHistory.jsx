import { useState, useEffect } from 'react';
import axios from 'axios';
import { Package } from 'lucide-react';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await axios.get('/orders');
            setOrders(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading Orders...</div>;

    return (
        <div className="container" style={{ padding: '4rem 0' }}>
            <h1 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Package /> Your Orders
            </h1>
            {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', background: '#f9f9f9', borderRadius: '10px' }}>
                    <p>No orders found.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {orders.map(order => (
                        <div key={order.id} style={{ border: '1px solid #eee', borderRadius: '10px', padding: '1.5rem', background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <h3 style={{ margin: 0 }}>Order #{order.id}</h3>
                                    <p style={{ color: '#666', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ 
                                        display: 'inline-block', 
                                        padding: '0.25rem 0.75rem', 
                                        borderRadius: '999px', 
                                        fontSize: '0.85rem',
                                        backgroundColor: order.status === 'delivered' ? '#d1fae5' : order.status === 'cancelled' ? '#fee2e2' : '#fef3c7',
                                        color: order.status === 'delivered' ? '#065f46' : order.status === 'cancelled' ? '#991b1b' : '#92400e',
                                        textTransform: 'capitalize',
                                        fontWeight: 'bold'
                                    }}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                            
                            <div style={{ marginBottom: '1rem' }}>
                                {order.items.map(item => (
                                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px dashed #eee' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <img src={item.product?.image_url} alt={item.product?.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px' }} />
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 'bold' }}>{item.product?.name || 'Unknown Product'}</p>
                                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>
                                                    Qty: {item.quantity} {item.size && `| Size: ${item.size}`} {item.color && `| Color: ${item.color}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ alignSelf: 'center', fontWeight: 'bold' }}>
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <p style={{ margin: '0 0 0.25rem', fontSize: '0.9rem', color: '#666' }}><strong>Payment:</strong> {order.payment_method}</p>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}><strong>Address:</strong> {order.address}, {order.city}</p>
                                </div>
                                <div>
                                    <h3 style={{ margin: 0 }}>Total: ${Number(order.total_amount).toFixed(2)}</h3>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderHistory;
