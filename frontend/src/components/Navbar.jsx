import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Map as MapIcon, LogIn, LayoutDashboard, LogOut, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar fade-in">
      <Link to="/" className="nav-logo">
        <Shield size={32} />
        RESCUEHUB
      </Link>
      
      <div className="nav-links">
        <Link to="/map" className={`nav-link ${isActive('/map') ? 'active' : ''}`}>
          <MapIcon size={18} />
          Live Map
        </Link>

        {!user ? (
          <>
            <Link to="/login" className={`nav-link ${isActive('/login') ? 'active' : ''}`}>Login</Link>
            <Link to="/register" className="btn-primary">
              <Shield size={18} />
              Register Agency
            </Link>
          </>
        ) : (
          <>
            <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
              <LayoutDashboard size={18} />
              Dashboard
            </Link>
            
            {user.role === 'admin' && (
              <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>
                <Shield size={18} />
                Admin
              </Link>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem', paddingLeft: '1rem', borderLeft: '1px solid var(--glass-border)' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'white' }}>{user.name}</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role}</p>
              </div>
              <button 
                onClick={handleLogout} 
                className="btn-secondary" 
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
