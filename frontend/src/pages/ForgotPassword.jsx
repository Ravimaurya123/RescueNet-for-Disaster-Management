import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, ArrowLeft, Shield, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState(''); // For demo simulation

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/forgot-password', { email });
      setMessage(res.data.msg);
      if (res.data.resetToken) {
        setResetToken(res.data.resetToken);
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container fade-in">
      <div className="glass auth-card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Shield size={48} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Reset Password</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Enter your email to receive a recovery link</p>
        </div>

        {message ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', color: '#10b981', padding: '1.5rem', borderRadius: '1rem', marginBottom: '1.5rem' }}>
              <CheckCircle size={32} style={{ marginBottom: '0.5rem' }} />
              <p>{message}</p>
            </div>
            
            {resetToken && (
                <div className="glass" style={{ padding: '1rem', marginBottom: '1.5rem', textAlign: 'left' }}>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Demo Mode: Click below to reset</p>
                    <Link to={`/reset-password/${resetToken}`} style={{ color: '#3b82f6', fontWeight: 600, textDecoration: 'none' }}>
                        → Reset My Password Now
                    </Link>
                </div>
            )}

            <Link to="/login" className="nav-link" style={{ justifyContent: 'center' }}>
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input 
                    type="email" 
                    className="form-input" 
                    placeholder="your-email@example.com"
                    style={{ paddingLeft: '40px' }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                style={{ width: '100%', justifyContent: 'center' }}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Send Recovery Link'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <Link to="/login" className="nav-link" style={{ justifyContent: 'center' }}>
                <ArrowLeft size={16} /> Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
