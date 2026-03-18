import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminGeneralSettings = () => {
    const { user, loading } = useContext(AuthContext);
    const navigate = useNavigate();

    const [form, setForm] = useState({
        store_name: 'PrimeWear',
        store_email: 'lydthreads@gmail.com',
        phone: '09949479270',
        address: 'Butuan City, Philippines',
        currency: 'PHP',
        shipping_fee: '100'
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (!user) return navigate('/login');
            if (!user.is_admin) return navigate('/');
            fetchSettings();
        }
    }, [user, loading, navigate]);

    const fetchSettings = async () => {
        try {
            const res = await axios.get('/admin/settings');
            if (res.data) setForm(prev => ({ ...prev, ...res.data }));
        } catch (err) {
            // no-op: keep defaults if endpoint missing
            console.warn('Could not load admin settings, using defaults');
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await axios.post('/admin/settings', form);
            alert('Settings saved.');
        } catch (err) {
            console.error(err);
            alert('Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '700px' }}>
            <h1>General Settings</h1>
            <form onSubmit={handleSave} className="card" style={{ padding: '1rem' }}>
                <div className="form-group">
                    <label className="form-label">Store Name</label>
                    <input className="form-control" value={form.store_name} onChange={e => setForm({ ...form, store_name: e.target.value })} />
                </div>

                <div className="form-group">
                    <label className="form-label">Store Email</label>
                    <input className="form-control" value={form.store_email} onChange={e => setForm({ ...form, store_email: e.target.value })} />
                </div>

                <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>

                <div className="form-group">
                    <label className="form-label">Address</label>
                    <input className="form-control" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                        <label className="form-label">Currency</label>
                        <input className="form-control" value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Shipping Fee</label>
                        <input type="number" className="form-control" value={form.shipping_fee} onChange={e => setForm({ ...form, shipping_fee: e.target.value })} />
                    </div>
                </div>

                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Settings'}</button>
                </div>
            </form>
        </div>
    );
};

export default AdminGeneralSettings;
