import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];

const SettingsNotifications = () => {
    const { user, loading, updateUser } = useContext(AuthContext);
    const [settings, setSettings] = useState({});
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (!loading && user) {
            const defaults = {
                pending: true,
                processing: true,
                shipped: true,
                completed: true,
                cancelled: true
            };
            setSettings({ ...defaults, ...(user.notification_settings || {}) });
        }
    }, [user, loading]);

    const toggle = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const save = async () => {
        setSaving(true);
        setMessage(null);
        try {
            await updateUser({ notification_settings: settings });
            setMessage('Notification settings saved.');
        } catch (err) {
            setMessage('Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (!user) return null;

    return (
        <div className="container" style={{ maxWidth: 700 }}>
            <h1>Notification Settings</h1>
            <div className="card" style={{ padding: '1rem' }}>
                <p>Select which order status updates you want to receive:</p>
                <div style={{ display: 'grid', gap: '0.5rem', maxWidth: 400 }}>
                    {STATUS_OPTIONS.map(s => (
                        <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <input type="checkbox" checked={!!settings[s]} onChange={() => toggle(s)} />
                            <span style={{ textTransform: 'capitalize' }}>{s}</span>
                        </label>
                    ))}
                </div>

                {message && <div style={{ marginTop: '0.75rem' }}>{message}</div>}

                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save Settings'}</button>
                </div>
            </div>
        </div>
    );
};

export default SettingsNotifications;
