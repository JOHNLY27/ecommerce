import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
    const { user, loading, updateUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [photoFile, setPhotoFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (!user) return navigate('/login');
            setName(user.name || '');
            setEmail(user.email || '');
            setPhone(user.phone || user.contact || '');
            // attempt to use common avatar fields if present; if stored path, prefix storage URL
            const photoField = user.profile_photo || user.profile_photo_path || user.avatar_url || user.profile_photo_url || user.avatar || null;
            if (photoField) {
                // if already an absolute URL, use it; otherwise prefix backend storage URL
                if (photoField.startsWith('http')) {
                    setPreview(photoField);
                } else {
                    setPreview(`http://127.0.0.1:8000/storage/${photoField}`);
                }
            } else {
                setPreview(null);
            }
        }
    }, [user, loading, navigate]);

    const handlePhoto = (e) => {
        const f = e.target.files[0];
        if (f) {
            setPhotoFile(f);
            const url = URL.createObjectURL(f);
            setPreview(url);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateUser({ name, email, phone, photo: photoFile });
            alert('Profile updated.');
        } catch (err) {
            alert('Failed to save profile.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (!user) return null;

    return (
        <div className="container" style={{ maxWidth: '700px' }}>
            <h1>User Profile</h1>
            <form onSubmit={handleSave} className="card" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ width: '96px', height: '96px', borderRadius: '50%', overflow: 'hidden', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {preview ? (
                            <img src={preview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ color: '#666' }}>{(user.name || '').charAt(0).toUpperCase()}</div>
                        )}
                    </div>
                    <div style={{ flex: 1 }}>
                        <label className="form-label">Change Profile Photo</label>
                        <input type="file" accept="image/*" onChange={handlePhoto} />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Name</label>
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
                    <label className="form-label">Date Registered</label>
                    <input className="form-control" value={user.created_at ? new Date(user.created_at).toLocaleString() : ''} readOnly />
                </div>

                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button type="button" className="btn btn-outline" onClick={() => { setName(user.name || ''); setEmail(user.email || ''); setPhotoFile(null); setPreview(user.profile_photo ? `http://127.0.0.1:8000/storage/${user.profile_photo}` : (user.avatar_url || user.avatar || null)); }}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</button>
                </div>
            </form>
        </div>
    );
};

export default UserProfile;
