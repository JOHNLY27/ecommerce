import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminPaymentMethod = () => {
    const { user, loading } = useContext(AuthContext);
    const navigate = useNavigate();

    const [cod, setCod] = useState(false);
    const [gcash, setGcash] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
            return;
        }
        if (!loading && user && !user.is_admin) {
            navigate('/');
            return;
        }
    }, [user, loading, navigate]);

    useEffect(() => {
        try {
            const stored = JSON.parse(localStorage.getItem('paymentMethods') || '{}');
            setCod(!!stored.cod);
            setGcash(!!stored.gcash);
        } catch (e) {
            // ignore
        }
    }, []);

    const handleSave = (e) => {
        e.preventDefault();
        const payload = { cod, gcash };
        localStorage.setItem('paymentMethods', JSON.stringify(payload));
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <h1>Payment Methods</h1>
            <p>Toggle available payment options for your store. Options are saved locally for now.</p>

            <form onSubmit={handleSave} style={{ maxWidth: 720, marginTop: 20 }}>
                <div className="form-group">
                    <label className="form-label">Cash on Delivery</label>
                    <div>
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                            <input type="checkbox" checked={cod} onChange={(e) => setCod(e.target.checked)} />
                            <span>Enable Cash on Delivery</span>
                        </label>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">GCash</label>
                    <div>
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                            <input type="checkbox" checked={gcash} onChange={(e) => setGcash(e.target.checked)} />
                            <span>Enable GCash</span>
                        </label>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <button className="btn btn-primary" type="submit">Save</button>
                    {saved && <span style={{ color: 'var(--success)' }}>Saved</span>}
                </div>
            </form>
        </div>
    );
};

export default AdminPaymentMethod;
