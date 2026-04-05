import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
    const { user, loading, updateUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [photoFile, setPhotoFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (!user) return navigate('/login');
            setName(user.name || '');
            setEmail(user.email || '');
            setPhone(user.phone || '');
            setAddress(user.address || '');
            // attempt to use common avatar fields if present; if stored path, prefix storage URL
            const photoField = user.profile_photo || user.profile_photo_path || user.avatar_url || user.profile_photo_url || user.avatar || null;
            if (photoField) {
                // if already an absolute URL, use it; otherwise prefix backend storage URL
                if (photoField.startsWith('http')) {
                    setPreview(photoField);
                } else {
                    setPreview(`${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'}/storage/${photoField}`);
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
            await updateUser({ name, email, phone, address, photo: photoFile });
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
        <div className="container profile-container" style={{ maxWidth: '750px', padding: 'clamp(2rem, 5vw, 4rem) 1rem' }}>
            <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: '2rem', fontWeight: 800 }}>My Profile</h1>
            <form onSubmit={handleSave} className="card profile-card" style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
                <div className="profile-header" style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ width: 'clamp(100px, 15vw, 130px)', height: 'clamp(100px, 15vw, 130px)', borderRadius: '50%', overflow: 'hidden', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', flexShrink: 0 }}>
                        {preview ? (
                            <img src={preview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ fontSize: '2.5rem', color: '#999', fontWeight: 600 }}>{(user.name || '').charAt(0).toUpperCase()}</div>
                        )}
                    </div>
                    <div style={{ flex: 1 }}>
                        <label className="form-label" style={{ fontWeight: 700, marginBottom: '0.75rem', display: 'block' }}>Profile Photo</label>
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handlePhoto} 
                            style={{ 
                                fontSize: '0.9rem',
                                color: '#666',
                                width: '100%',
                                display: 'block'
                            }} 
                        />
                        <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: '#999' }}>JPG, PNG or GIF. Max size 2MB.</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 600 }}>Full Name</label>
                        <input className="form-control" value={name} onChange={e => setName(e.target.value)} required style={{ padding: '0.8rem', borderRadius: '8px' }} />
                    </div>

                    <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 600 }}>Email Address</label>
                        <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: '0.8rem', borderRadius: '8px' }} />
                    </div>

                    <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 600 }}>Phone Number</label>
                        <input type="tel" className="form-control" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Enter your phone number" style={{ padding: '0.8rem', borderRadius: '8px' }} />
                    </div>

                    <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 600 }}>Date Joined</label>
                        <input className="form-control" value={user.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : ''} readOnly disabled style={{ backgroundColor: '#f8f9fa', border: '1px solid #eee', color: '#777', padding: '0.8rem', borderRadius: '8px' }} />
                    </div>
                </div>

                <div className="form-group" style={{ marginTop: '1.5rem' }}>
                    <label className="form-label" style={{ fontWeight: 600 }}>Shipping Address</label>
                    <textarea className="form-control" value={address} onChange={e => setAddress(e.target.value)} rows="3" placeholder="Enter your delivery address" style={{ resize: 'vertical', padding: '0.8rem', borderRadius: '8px' }}></textarea>
                </div>

                <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    <button 
                        type="button" 
                        className="btn btn-outline" 
                        style={{ padding: '0.8rem 2rem', borderRadius: '8px', minWidth: '120px' }}
                        onClick={() => { 
                            setName(user.name || ''); 
                            setEmail(user.email || ''); 
                            setPhone(user.phone || ''); 
                            setAddress(user.address || ''); 
                            setPhotoFile(null); 
                            const photoField = user.profile_photo || user.profile_photo_path || user.avatar_url || user.profile_photo_url || user.avatar || null;
                            if (photoField) {
                                setPreview(photoField.startsWith('http') ? photoField : `${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'}/storage/${photoField}`);
                            } else {
                                setPreview(null);
                            }
                        }}
                    >
                        Reset
                    </button>
                    <button 
                        type="submit" 
                        className="btn btn-primary" 
                        disabled={saving}
                        style={{ padding: '0.8rem 2.5rem', borderRadius: '8px', minWidth: '160px', fontWeight: 700 }}
                    >
                        {saving ? 'Updating...' : 'Save Changes'}
                    </button>
                </div>
            </form>

            <style dangerouslySetInnerHTML={{__html: `
                @media (max-width: 600px) {
                    .profile-header {
                        flex-direction: column !important;
                        text-align: center !important;
                        gap: 1.5rem !important;
                    }
                    .profile-header > div:last-child {
                        width: 100% !important;
                    }
                    .profile-card {
                        border-radius: 0 !important;
                        margin: 0 -1rem !important;
                        border-left: none !important;
                        border-right: none !important;
                    }
                    .profile-container {
                        padding-left: 0 !important;
                        padding-right: 0 !important;
                    }
                    form button {
                        width: 100% !important;
                    }
                }
            `}} />
        </div>
    );
};

export default UserProfile;
