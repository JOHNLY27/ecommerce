import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await login(email, password);
            if (data.user && data.user.is_admin) {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="auth-layout">
            <div className="auth-image-container" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80")' }}>
                <div className="auth-image-overlay"></div>
                <div className="auth-image-text">
                    <h2>Primewear.</h2>
                    <p>Unlock the world of premium fashion. Sign in to continue exploring our exclusive collections.</p>
                </div>
            </div>
            <div className="auth-form-container">
                <div style={{ width: '100%', maxWidth: '400px' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: '700' }}>Welcome Back</h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Please enter your details to sign in.</p>
                    
                    {error && <div style={{ color: 'var(--danger)', backgroundColor: 'rgba(220, 53, 69, 0.1)', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem', textAlign: 'center' }}>{error}</div>}
                    
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label" style={{ fontWeight: '600' }}>Email Address</label>
                            <input
                                type="email"
                                className="form-control"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: '2rem' }}>
                            <label className="form-label" style={{ fontWeight: '600' }}>Password</label>
                            <input
                                type="password"
                                className="form-control"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', fontWeight: '600', borderRadius: '8px' }}>Sign In</button>
                    </form>
                    
                    <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Don't have an account? <Link to="/register" style={{ fontWeight: '700', color: 'var(--text)' }}>Create account</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
