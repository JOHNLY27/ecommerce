import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [error, setError] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await register(name, email, password, phone, address);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please check your details and try again.');
        }
    };

    return (
        <div className="auth-layout">
            <div className="auth-form-container">
                <div style={{ width: '100%', maxWidth: '500px' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: '700' }}>Create Account</h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Fill in the details below to complete your registration.</p>
                    
                    {error && <div style={{ color: 'var(--danger)', backgroundColor: 'rgba(220, 53, 69, 0.1)', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem', textAlign: 'center' }}>{error}</div>}
                    
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label" style={{ fontWeight: '600' }}>Full Name</label>
                            <input
                                type="text"
                                className="form-control"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="John Doe"
                                required
                            />
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label" style={{ fontWeight: '600' }}>Email Address</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="john@example.com"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label" style={{ fontWeight: '600' }}>Phone Number</label>
                                <input
                                    type="tel"
                                    className="form-control"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    placeholder="+1 (555) 000-0000"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label" style={{ fontWeight: '600' }}>Delivery Address</label>
                            <textarea
                                className="form-control"
                                value={address}
                                onChange={e => setAddress(e.target.value)}
                                placeholder="Enter your full street address, city, and zip code"
                                rows="2"
                                required
                                style={{ resize: 'vertical' }}
                            ></textarea>
                        </div>

                        <div className="form-group" style={{ marginBottom: '2rem' }}>
                            <label className="form-label" style={{ fontWeight: '600' }}>Password</label>
                            <input
                                type="password"
                                className="form-control"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Minimum 8 characters"
                                required
                                minLength="8"
                            />
                        </div>
                        
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', fontWeight: '600', borderRadius: '8px' }}>Create Account</button>
                    </form>
                    
                    <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Already have an account? <Link to="/login" style={{ fontWeight: '700', color: 'var(--text)' }}>Log In here</Link>
                    </div>
                </div>
            </div>
            
            <div className="auth-image-container" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80")' }}>
                <div className="auth-image-overlay"></div>
                <div className="auth-image-text">
                    <h2>Join the Club.</h2>
                    <p>Create an account to get faster checkout, track your orders, and receive exclusive offers straight to your inbox.</p>
                </div>
            </div>
        </div>
    );
};

export default Register;
