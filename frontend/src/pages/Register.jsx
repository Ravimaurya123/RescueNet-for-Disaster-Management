import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios'; // Ensure path is correct to your axios.js
import { Shield, User, Mail, Phone, Lock, MapPin, CheckCircle } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    type: 'NGO',
    lat: 20.5937,
    lng: 78.9629,
    address: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Use the new unified atomic endpoint
      await api.post('/api/auth/register-agency', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        type: formData.type,
        location: {
          lat: parseFloat(formData.lat),
          lng: parseFloat(formData.lng),
          address: formData.address
        }
      });

      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      console.error('Registration Error:', err);
      const errorMsg = err.response?.data?.errors
        ? err.response.data.errors.map(e => e.msg).join(', ')
        : err.response?.data?.msg
        || 'Registration failed. Ensure the backend API is reachable.';

      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container fade-in">
        <div className="glass auth-card" style={{ textAlign: 'center', padding: '4rem' }}>
          <CheckCircle size={80} color="#10b981" style={{ margin: '0 auto 2rem' }} />
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '-1px' }}>Registration Complete</h2>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: 1.6 }}>
            Welcome to the rescue network. Your agency profile has been established. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container fade-in" style={{ height: 'auto', padding: '5rem 0' }}>
      <div className="glass auth-card" style={{ maxWidth: '800px', padding: '4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <Shield size={64} color="#ef4444" style={{ margin: '0 auto 1.5rem' }} />
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-2px', marginBottom: '0.5rem' }}>Join the Network</h2>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Coordinate rescue efforts with verified local units</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '1rem', borderRadius: '0.75rem', marginBottom: '2rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Official Agency Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input name="name" type="text" className="form-input" placeholder="e.g. Red Cross International" style={{ paddingLeft: '40px' }} value={formData.name} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input name="email" type="email" className="form-input" placeholder="hq@agency.com" style={{ paddingLeft: '40px' }} value={formData.email} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input name="password" type="password" className="form-input" placeholder="••••••••" style={{ paddingLeft: '40px' }} value={formData.password} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Contact Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input name="phone" type="tel" className="form-input" placeholder="+1 (555) 000-0000" style={{ paddingLeft: '40px' }} value={formData.phone} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Service Category</label>
              <select name="type" className="form-input" value={formData.type} onChange={handleChange}>
                <option value="Fire">Fire & Rescue Services</option>
                <option value="Medical">Medical / Emergency Healthcare</option>
                <option value="Police">National / Local Police Force</option>
                <option value="NDRF">Special Disaster Response Forces</option>
                <option value="NGO">International / Local NGO</option>
                <option value="Other">Specialized Support Unit</option>
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1', background: 'rgba(255, 255, 255, 0.03)', padding: 'clamp(1rem, 4vw, 2.5rem)', borderRadius: '1.25rem', border: '1px solid var(--glass-border)', marginTop: '1rem' }}>
              <h4 style={{ marginBottom: '1.5rem', fontSize: '1rem', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700 }}>
                <MapPin size={20} /> PRIMARY DEPLOYMENT BASE
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Station Latitude</label>
                  <input name="lat" type="number" step="any" className="form-input" value={formData.lat} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Station Longitude</label>
                  <input name="lng" type="number" step="any" className="form-input" value={formData.lng} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Headquarters Address</label>
                <input name="address" type="text" className="form-input" placeholder="e.g. 101 Command Center, Silicon Valley" value={formData.address} onChange={handleChange} required />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ gridColumn: '1 / -1', marginTop: '2rem', padding: '1.25rem', height: 'auto', minHeight: '64px' }}
              disabled={loading}
            >
              {loading ? 'Initializing Profile...' : 'Finalize Agency Registration'}
            </button>
          </div>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2.5rem', color: '#94a3b8', fontSize: '0.95rem' }}>
          Already part of the network? <Link to="/login" style={{ color: '#ef4444', textDecoration: 'none', fontWeight: 600 }}>Sign in here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
