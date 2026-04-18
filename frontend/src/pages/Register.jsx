import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [phone, setPhone] = useState('');
    const [country] = useState('Philippines'); // Fixed to Philippines
    const [province, setProvince] = useState('');
    const [city, setCity] = useState('');
    const [barangay, setBarangay] = useState('');
    const [street, setStreet] = useState('');
    const [error, setError] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (!province || !city || !barangay) {
            setError('Please enter a Province, City, and Barangay.');
            return;
        }

        const fullAddress = `${street}, ${barangay}, ${city}, ${province}, ${country}`;
        
        try {
            await register(name, email, password, phone, fullAddress);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please check your details and try again.');
        }
    };

    return (
        <div className="auth-layout">
            <div className="auth-form-container" style={{ padding: '2rem 1rem' }}>
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
                                <label className="form-label" style={{ fontWeight: '600' }}>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input type={showPassword ? "text" : "password"} className="form-control" value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimum 8 chars" required minLength="8" style={{ paddingRight: '2.5rem' }} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label" style={{ fontWeight: '600' }}>Confirm Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input type={showConfirmPassword ? "text" : "password"} className="form-control" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm password" required minLength="8" style={{ paddingRight: '2.5rem' }} />
                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
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
                                    placeholder="0917 123 4567"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Delivery Address</h3>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1rem' }}>
                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Country</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={country}
                                        disabled
                                        style={{ backgroundColor: 'var(--bg-secondary)', cursor: 'not-allowed' }}
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Province / Region</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={province}
                                        onChange={e => setProvince(e.target.value)}
                                        placeholder="e.g. Agusan del Norte"
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1rem' }}>
                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                    <label className="form-label" style={{ fontSize: '0.85rem' }}>City / Municipality</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={city}
                                        onChange={e => setCity(e.target.value)}
                                        placeholder="e.g. Butuan City"
                                        required
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Barangay</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={barangay}
                                        onChange={e => setBarangay(e.target.value)}
                                        placeholder="e.g. Buhangin"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label" style={{ fontSize: '0.85rem' }}>Street Name, Building, House No., or Purok</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={street}
                                    onChange={e => setStreet(e.target.value)}
                                    placeholder="e.g. Purok 4"
                                    required
                                />
                            </div>
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
