import { Link } from 'react-router-dom';
import { Shield, Map as MapIcon, Users, AlertTriangle, ArrowRight, Zap } from 'lucide-react';
import IncidentFeed from '../components/IncidentFeed';

const Home = () => {
  return (
    <div className="home-container fade-in" style={{ padding: '4rem 5%', maxWidth: '1600px', margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 0.5fr)', gap: '4rem', alignItems: 'start' }}>
        
        {/* Left Side: Hero content */}
        <div>
          <section className="hero" style={{ textAlign: 'left', marginBottom: '6rem', paddingTop: '2rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.5rem 1rem', borderRadius: '2rem', fontSize: '0.8rem', fontWeight: 800, marginBottom: '2rem' }}>
              <Zap size={14} fill="#ef4444" />
              LIVE COORDINATION SYSTEM
            </div>
            <h1 style={{ fontSize: '5rem', fontWeight: 900, marginBottom: '1.5rem', lineHeight: 1, letterSpacing: '-3px' }}>
              Crisis Management <br />
              <span className="text-gradient">
                Done Right.
              </span>
            </h1>
            <p style={{ fontSize: '1.25rem', color: '#94a3b8', maxWidth: '750px', marginBottom: '3rem', lineHeight: 1.6 }}>
              The unified digital nerve-center for disaster response. Register your agency to collaborate with national and local teams in real-time during critical emergencies.
            </p>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <Link to="/map" className="btn-primary" style={{ padding: '1.125rem 2.5rem', fontSize: '1.1rem' }}>
                <MapIcon size={20} />
                Live Map
                <ArrowRight size={18} />
              </Link>
              <Link to="/register" className="btn-secondary" style={{ padding: '1.125rem 2.5rem', fontSize: '1.1rem' }}>
                Join Rescue Network
              </Link>
            </div>
          </section>

          <section className="features" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            <div className="glass" style={{ padding: '2rem' }}>
              <Shield size={40} color="#ef4444" style={{ marginBottom: '1.5rem' }} />
              <h3 style={{ marginBottom: '1rem', fontSize: '1.35rem', fontWeight: 700 }}>Verified Units</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Secure registration for authorized relief organizations ensuring coordination integrity.
              </p>
            </div>
            <div className="glass" style={{ padding: '2rem' }}>
              <MapIcon size={40} color="#3b82f6" style={{ marginBottom: '1.5rem' }} />
              <h3 style={{ marginBottom: '1rem', fontSize: '1.35rem', fontWeight: 700 }}>Live Tracking</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Track deployments to eliminate redundancies and optimize coverage during disasters.
              </p>
            </div>
            <div className="glass" style={{ padding: '2rem' }}>
              <AlertTriangle size={40} color="#f59e0b" style={{ marginBottom: '1.5rem' }} />
              <h3 style={{ marginBottom: '1rem', fontSize: '1.35rem', fontWeight: 700 }}>Instant Comms</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Rapid incident reporting with high-priority broadcasts to all regional response teams.
              </p>
            </div>
          </section>
        </div>

        {/* Right Side: Incident Feed */}
        <aside style={{ height: 'fit-content', sticky: 'top', top: '100px' }}>
          <IncidentFeed />
        </aside>
      </div>

      <section className="stats glass" style={{ marginTop: '8rem', padding: '4rem 2rem', display: 'flex', justifyContent: 'space-around', textAlign: 'center', background: 'rgba(255, 255, 255, 0.02)' }}>
        <div>
          <h4 style={{ fontSize: '3.5rem', fontWeight: 900, color: '#ef4444', letterSpacing: '-2px' }}>1.2k</h4>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase' }}>Active Agencies</p>
        </div>
        <div style={{ padding: '0 2rem', borderLeft: '1px solid var(--glass-border)', borderRight: '1px solid var(--glass-border)' }}>
          <h4 style={{ fontSize: '3.5rem', fontWeight: 900, color: '#3b82f6', letterSpacing: '-2px' }}>&lt;5m</h4>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase' }}>Response Time</p>
        </div>
        <div>
          <h4 style={{ fontSize: '3.5rem', fontWeight: 900, color: '#10b981', letterSpacing: '-2px' }}>24/7</h4>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase' }}>On-Duty Ops</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
