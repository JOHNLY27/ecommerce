import { useState, useContext } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { KeyRound, ArrowLeft, CheckCircle, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        email: searchParams.get('email') || '',
        token: searchParams.get('token') || '',
        password: '',
        password_confirmation: '',
    });
    const [status, setStatus] = useState('idle'); // idle | loading | success | error
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleChange = (field) => (e) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        if (formData.password !== formData.password_confirmation) {
            setStatus('error');
            setMessage('Passwords do not match.');
            return;
        }

        if (formData.password.length < 8) {
            setStatus('error');
            setMessage('Password must be at least 8 characters.');
            return;
        }

        try {
            const res = await axios.post('/reset-password', formData);
            setStatus('success');
            setMessage(res.data.message);

            // Auto-login if token is returned
            if (res.data.access_token) {
                localStorage.setItem('token', res.data.access_token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.access_token}`;
                // Redirect after a short delay so the user sees the success message
                setTimeout(() => {
                    if (res.data.user?.is_admin) {
                        navigate('/admin');
                    } else {
                        navigate('/');
                    }
                    window.location.reload();
                }, 2000);
            }
        } catch (err) {
            setStatus('error');
            const errorData = err.response?.data;
            if (errorData?.errors) {
                const firstError = Object.values(errorData.errors)[0];
                setMessage(Array.isArray(firstError) ? firstError[0] : firstError);
            } else {
                setMessage(errorData?.message || 'Something went wrong. Please try again.');
            }
        }
    };

    return (
        <div className="auth-layout">
            <div className="auth-form-container">
                <div style={{ width: '100%', maxWidth: '440px' }}>

                    {status === 'success' ? (
                        /* ── Success State ── */
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '80px', height: '80px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 1.5rem'
                            }}>
                                <CheckCircle size={40} color="#22c55e" />
                            </div>
                            <h1 style={{ fontSize: '2rem', marginBottom: '0.75rem', fontWeight: '700' }}>Password Reset!</h1>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                                {message}
                            </p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                                Redirecting you automatically...
                            </p>
                            <div style={{
                                width: '40px', height: '40px', margin: '0 auto',
                                border: '3px solid rgba(0,0,0,0.1)', borderTopColor: 'var(--primary)',
                                borderRadius: '50%', animation: 'spin 1s linear infinite'
                            }} />
                        </div>
                    ) : (
                        /* ── Form State ── */
                        <>
                            <Link
                                to="/forgot-password"
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                                    color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'none',
                                    fontWeight: '500', marginBottom: '2rem', transition: 'color 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                            >
                                <ArrowLeft size={16} /> Back
                            </Link>

                            <div style={{
                                width: '64px', height: '64px', borderRadius: '16px',
                                background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: '1.5rem', boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                            }}>
                                <KeyRound size={28} color="white" />
                            </div>

                            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: '700' }}>Set New Password</h1>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.5' }}>
                                Enter the reset token from your email and choose a new password. Your password must be at least 8 characters long.
                            </p>

                            {status === 'error' && (
                                <div style={{
                                    color: 'var(--danger)', backgroundColor: 'rgba(220, 53, 69, 0.1)',
                                    padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem',
                                    display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem'
                                }}>
                                    <AlertCircle size={18} style={{ flexShrink: 0 }} />
                                    {message}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label className="form-label" style={{ fontWeight: '600' }}>Email Address</label>
                                    <input
                                        id="reset-email"
                                        type="email"
                                        className="form-control"
                                        value={formData.email}
                                        onChange={handleChange('email')}
                                        placeholder="Enter your registered email"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" style={{ fontWeight: '600' }}>Reset Token</label>
                                    <input
                                        id="reset-token"
                                        type="text"
                                        className="form-control"
                                        value={formData.token}
                                        onChange={handleChange('token')}
                                        placeholder="Paste the token from your email"
                                        required
                                        style={{ fontFamily: 'monospace', letterSpacing: '0.5px' }}
                                    />
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '6px' }}>
                                        Check your email for the reset link — the token is in the URL.
                                    </p>
                                </div>

                                <div className="form-group">
                                    <label className="form-label" style={{ fontWeight: '600' }}>New Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            id="reset-password"
                                            type={showPassword ? 'text' : 'password'}
                                            className="form-control"
                                            value={formData.password}
                                            onChange={handleChange('password')}
                                            placeholder="Minimum 8 characters"
                                            required
                                            minLength="8"
                                            style={{ paddingRight: '48px' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{
                                                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                                                background: 'none', border: 'none', cursor: 'pointer',
                                                color: 'var(--text-muted)', padding: '4px', display: 'flex'
                                            }}
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="form-group" style={{ marginBottom: '2rem' }}>
                                    <label className="form-label" style={{ fontWeight: '600' }}>Confirm New Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            id="reset-password-confirm"
                                            type={showConfirm ? 'text' : 'password'}
                                            className="form-control"
                                            value={formData.password_confirmation}
                                            onChange={handleChange('password_confirmation')}
                                            placeholder="Re-enter your new password"
                                            required
                                            minLength="8"
                                            style={{ paddingRight: '48px' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            style={{
                                                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                                                background: 'none', border: 'none', cursor: 'pointer',
                                                color: 'var(--text-muted)', padding: '4px', display: 'flex'
                                            }}
                                        >
                                            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {formData.password && formData.password_confirmation && formData.password !== formData.password_confirmation && (
                                        <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '6px' }}>
                                            Passwords do not match.
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={status === 'loading'}
                                    style={{
                                        width: '100%', padding: '0.85rem', fontSize: '1rem',
                                        fontWeight: '600', borderRadius: '8px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        opacity: status === 'loading' ? 0.7 : 1,
                                        cursor: status === 'loading' ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {status === 'loading' ? (
                                        <>
                                            <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                                            Resetting Password...
                                        </>
                                    ) : (
                                        'Reset Password'
                                    )}
                                </button>
                            </form>

                            <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                Remember your password? <Link to="/login" style={{ fontWeight: '700', color: 'var(--text)' }}>Sign In</Link>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="auth-image-container" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80")' }}>
                <div className="auth-image-overlay"></div>
                <div className="auth-image-text">
                    <h2>Almost There.</h2>
                    <p>Choose a strong password to keep your Primewear account secure. You'll be back to shopping in seconds.</p>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
