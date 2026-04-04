import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, ArrowRight, Shield, CheckCircle } from 'lucide-react';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    setLoading(true);

    try {
      await axios.put(`/api/auth/reset-password/${token}`, { password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Invalid or expired token. Please request another link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container fade-in">
      <div className="glass auth-card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Shield size={48} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.875rem', fontWeight: 700 }}>New Password</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Set a secure new password for your account</p>
        </div>

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', color: '#10b981', padding: '1.5rem', borderRadius: '1rem', marginBottom: '1.5rem' }}>
              <CheckCircle size={32} style={{ marginBottom: '0.5rem' }} />
              <p>Password updated successfully!</p>
              <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Redirecting to login...</p>
            </div>
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
                <label className="form-label">New Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input 
                    type="password" 
                    className="form-input" 
                    placeholder="Enter new password"
                    style={{ paddingLeft: '40px' }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input 
                    type="password" 
                    className="form-input" 
                    placeholder="Confirm password"
                    style={{ paddingLeft: '40px' }}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                {loading ? 'Restoring Access...' : (
                  <>
                    <CheckCircle size={20} />
                    Update Password
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
