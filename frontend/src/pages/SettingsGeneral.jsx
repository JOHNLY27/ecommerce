import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SettingsGeneral = () => {
    const { user, loading, updateUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (!user) return navigate('/login');
            setName(user.name || '');
            setEmail(user.email || '');
            setPhone(user.phone || user.contact || '');
            setAddress(user.address || '');
        }
    }, [user, loading, navigate]);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateUser({ name, email, phone, address });
            alert('Settings saved.');
        } catch (err) {
            alert('Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (!user) return null;

    return (
        <div className="container" style={{ maxWidth: '700px' }}>
            <h1>General Setting</h1>
            <form onSubmit={handleSave} className="card" style={{ padding: '1rem' }}>
                <div className="form-group">
                    <label className="form-label">Customer Name</label>
                    <input className="form-control" value={name} onChange={e => setName(e.target.value)} required />
                </div>

                <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>

                <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input className="form-control" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>

                <div className="form-group">
                    <label className="form-label">Address</label>
                    <input className="form-control" value={address} onChange={e => setAddress(e.target.value)} />
                </div>

                <div className="form-group">
                    <label className="form-label">Date Registered</label>
                    <input className="form-control" value={user.created_at ? new Date(user.created_at).toLocaleString() : ''} readOnly />
                </div>

                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Settings'}</button>
                </div>
            </form>
        </div>
    );
};

export default SettingsGeneral;
