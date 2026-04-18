import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle | loading | success | error
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');
        try {
            const res = await axios.post('/forgot-password', { email });
            setStatus('success');
            setMessage(res.data.message);
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'Something went wrong. Please try again.');
        }
    };

    return (
        <div className="auth-layout">
            <div className="auth-image-container" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1558618666-fcd25c85f82e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80")' }}>
                <div className="auth-image-overlay"></div>
                <div className="auth-image-text">
                    <h2>Primewear.</h2>
                    <p>Don't worry — it happens to the best of us. We'll help you get back into your account in no time.</p>
                </div>
            </div>
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
                            <h1 style={{ fontSize: '2rem', marginBottom: '0.75rem', fontWeight: '700' }}>Check Your Email</h1>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                                {message}
                            </p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem', lineHeight: '1.6' }}>
                                Didn't receive the email? Check your spam folder, or
                                <button
                                    onClick={() => { setStatus('idle'); setMessage(''); }}
                                    style={{
                                        background: 'none', border: 'none', color: 'var(--text)',
                                        fontWeight: '700', cursor: 'pointer', textDecoration: 'underline',
                                        padding: '0', marginLeft: '4px', fontSize: '0.85rem'
                                    }}
                                >
                                    try again
                                </button>
                            </p>
                            <Link
                                to="/reset-password"
                                className="btn btn-primary"
                                style={{
                                    width: '100%', padding: '0.85rem', fontSize: '1rem',
                                    fontWeight: '600', borderRadius: '8px', display: 'block',
                                    textDecoration: 'none', textAlign: 'center', marginBottom: '1rem'
                                }}
                            >
                                I Have My Reset Token
                            </Link>
                            <Link
                                to="/login"
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                                    color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'none',
                                    fontWeight: '500', transition: 'color 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                            >
                                <ArrowLeft size={16} /> Back to Login
                            </Link>
                        </div>
                    ) : (
                        /* ── Form State ── */
                        <>
                            <Link
                                to="/login"
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                                    color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'none',
                                    fontWeight: '500', marginBottom: '2rem', transition: 'color 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                            >
                                <ArrowLeft size={16} /> Back to Login
                            </Link>

                            <div style={{
                                width: '64px', height: '64px', borderRadius: '16px',
                                background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: '1.5rem', boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                            }}>
                                <Mail size={28} color="white" />
                            </div>

                            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: '700' }}>Forgot Password?</h1>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.5' }}>
                                No worries! Enter the email address associated with your account and we'll send you a link to reset your password.
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
                                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                    <label className="form-label" style={{ fontWeight: '600' }}>Email Address</label>
                                    <input
                                        id="forgot-email"
                                        type="email"
                                        className="form-control"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="Enter your registered email"
                                        required
                                        autoFocus
                                    />
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
                                            Sending Reset Link...
                                        </>
                                    ) : (
                                        'Send Reset Link'
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
        </div>
    );
};

export default ForgotPassword;
