import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(name, email, password);
            navigate('/');
        } catch (err) {
            setError('Registration failed. Please check your details.');
        }
    };

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <div style={{ width: '100%', maxWidth: '400px', backgroundColor: 'var(--bg)', padding: '3rem', border: '1px solid var(--border)' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>Create Account</h1>
                {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Name</label>
                        <input
                            type="text"
                            className="form-control"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            minLength="8"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Register</button>
                </form>
                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem' }}>
                    Already have an account? <Link to="/login" style={{ fontWeight: '600', color: 'var(--primary)' }}>Log In</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
