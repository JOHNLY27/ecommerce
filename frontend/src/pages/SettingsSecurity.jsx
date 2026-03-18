import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const SettingsSecurity = () => {
    const { user, loading } = useContext(AuthContext);
    const [currentPassword, setCurrentPassword] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [errors, setErrors] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        setErrors(null);
        try {
            const res = await axios.post('/me/password', {
                current_password: currentPassword,
                password: password,
                password_confirmation: passwordConfirm
            });
            setMessage(res.data.message || 'Password updated.');
            setCurrentPassword('');
            setPassword('');
            setPasswordConfirm('');
        } catch (err) {
            if (err.response && err.response.data) {
                setErrors(err.response.data.errors || { general: err.response.data.message });
            } else {
                setErrors({ general: 'Failed to update password.' });
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="container" style={{ maxWidth: 600 }}>
            <h1>Security Settings</h1>
            <div className="card" style={{ padding: '1rem' }}>
                <form onSubmit={handleSubmit}>
                    {message && <div className="alert alert-success">{message}</div>}
                    {errors && errors.general && <div className="alert alert-danger">{errors.general}</div>}

                    <div className="form-group">
                        <label className="form-label">Current Password</label>
                        <input type="password" className="form-control" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
                        {errors && errors.current_password && <div className="text-danger">{errors.current_password}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">New Password</label>
                        <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required />
                        {errors && errors.password && <div className="text-danger">{errors.password}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Confirm New Password</label>
                        <input type="password" className="form-control" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} required />
                    </div>

                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Change Password'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SettingsSecurity;
