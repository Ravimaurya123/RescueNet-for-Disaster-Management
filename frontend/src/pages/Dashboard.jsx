import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { MapPin, AlertTriangle, List, CheckCircle, Navigation, Save } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [agency, setAgency] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Update Agency State
  const [location, setLocation] = useState({ lat: '', lng: '', status: '' });

  // New Incident State
  const [newIncident, setNewIncident] = useState({
    title: '', type: 'Other', severity: 'Medium', address: '', description: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.agencyId) {
          const res = await api.get(`/api/agencies`);
          const myAgency = res.data.find(a => a._id === user.agencyId);
          setAgency(myAgency);
          setLocation({
            lat: myAgency.location.lat,
            lng: myAgency.location.lng,
            status: myAgency.status
          });
        }
        const incidentsRes = await api.get('/api/incidents');
        setIncidents(incidentsRes.data.filter(i => i.createdBy?._id === user?.id));
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleUpdateAgency = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/agencies/${user.agencyId}`, {
        location: { lat: parseFloat(location.lat), lng: parseFloat(location.lng), address: agency.location.address },
        status: location.status
      });
      alert('Agency location updated successfully!');
    } catch (err) {
      alert('Failed to update agency location');
    }
  };

  const handleReportIncident = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/incidents', {
        ...newIncident,
        location: { lat: parseFloat(location.lat), lng: parseFloat(location.lng) }
      });
      alert('Incident reported successfully!');
      setNewIncident({ title: '', type: 'Other', severity: 'Medium', address: '', description: '' });
      // Refresh incidents
      const res = await api.get('/api/incidents');
      setIncidents(res.data.filter(i => i.createdBy?._id === user?.id));
    } catch (err) {
      alert('Failed to report incident');
    }
  };

  const handleResolveIncident = async (id) => {
    if (!window.confirm('Are you sure the incident is resolved?')) return;
    try {
      await api.put(`/api/incidents/${id}`, { status: 'Resolved' });
      // Refresh incidents
      const res = await api.get('/api/incidents');
      setIncidents(res.data.filter(i => i.createdBy?._id === user?.id));
      alert('Incident marked as resolved.');
    } catch (err) {
      alert('Failed to update incident status');
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading dashboard...</div>;

  return (
    <div style={{ padding: '2rem clamp(1rem, 5vw, 4rem)', maxWidth: '1400px', margin: '0 auto' }}>
      <header className="fade-in" style={{ marginBottom: 'clamp(1.5rem, 5vw, 3rem)' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 8vw, 3.5rem)', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-2px' }}>Agency <span style={{ color: 'var(--primary)' }}>Dashboard</span></h1>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Welcome back, <span style={{ color: 'white', fontWeight: 600 }}>{user?.name}</span>. Manage your deployments and alerts.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap: 'clamp(1.25rem, 4vw, 2.5rem)' }}>

        {/* Left Column: Update Status & Location */}
        <section className="glass fade-in" style={{ padding: 'clamp(1.25rem, 4vw, 2.5rem)' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700 }}>
            <Navigation size={24} color="#3b82f6" />
            Live Deployment Status
          </h2>

          <form onSubmit={handleUpdateAgency}>
            <div className="form-group">
              <label className="form-label">Deployment Status</label>
              <select
                className="form-input"
                value={location.status}
                onChange={(e) => setLocation({ ...location, status: e.target.value })}
              >
                <option value="active">🟢 Available / Active</option>
                <option value="deployed">🟡 On Field / Deployed</option>
                <option value="inactive">🔴 Inactive / Standby</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Base Latitude</label>
                <input
                  type="number" step="any" className="form-input"
                  value={location.lat}
                  onChange={(e) => setLocation({ ...location, lat: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Base Longitude</label>
                <input
                  type="number" step="any" className="form-input"
                  value={location.lng}
                  onChange={(e) => setLocation({ ...location, lng: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '1.5rem', width: '100%' }}>
              <Save size={20} />
              Update Agency Profile
            </button>
          </form>

          <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '1rem', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
            <p style={{ fontSize: '0.9rem', color: '#3b82f6', lineHeight: 1.6, display: 'flex', gap: '0.75rem' }}>
              <MapPin size={24} />
              <span>Updating your location helps the command center coordinate and dispatch resources to disaster spots more efficiently.</span>
            </p>
          </div>
        </section>

        {/* Right Column: Report Incident */}
        <section className="glass fade-in" style={{ padding: 'clamp(1.25rem, 4vw, 2.5rem)' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700 }}>
            <AlertTriangle size={24} color="#ef4444" />
            Broadcast Alert
          </h2>

          <form onSubmit={handleReportIncident}>
            <div className="form-group">
              <label className="form-label">Incident Title</label>
              <input
                type="text" className="form-input" placeholder="e.g. Flash Flood in Sector 5"
                value={newIncident.title}
                onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-input" value={newIncident.type} onChange={(e) => setNewIncident({ ...newIncident, type: e.target.value })}>
                  <option value="Flood">Flood</option>
                  <option value="Earthquake">Earthquake</option>
                  <option value="Fire">Fire</option>
                  <option value="Cyclone">Cyclone</option>
                  <option value="ManMade">Man-Made</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Severity</label>
                <select className="form-input" value={newIncident.severity} onChange={(e) => setNewIncident({ ...newIncident, severity: e.target.value })}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Details</label>
              <textarea
                className="form-input" rows="4" placeholder="Brief about the situation and immediate needs..."
                value={newIncident.description}
                onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                required
              ></textarea>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', background: 'linear-gradient(135deg, #ef4444, #991b1b)' }}>
              Broadcast Alert
            </button>
          </form>
        </section>

        {/* Full Width bottom: My Alerts */}
        <section className="glass fade-in" style={{ gridColumn: '1 / -1', padding: 'clamp(1.25rem, 4vw, 2.5rem)', marginBottom: 'clamp(2rem, 8vw, 4rem)' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 800 }}>
            <List size={28} color="#10b981" />
            Your Reported Alerts
          </h2>

          {incidents.length === 0 ? (
            <div style={{ padding: '4rem 0', textAlign: 'center', opacity: 0.5 }}>
              <CheckCircle size={48} style={{ margin: '0 auto 1rem' }} />
              <p>You haven't reported any incidents yet. All systems clear.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: 'clamp(1rem, 3vw, 2rem)' }}>
              {incidents.map(incident => (
                <div key={incident._id} className="glass" style={{ padding: 'clamp(1.25rem, 4vw, 2rem)', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '6px 12px',
                      borderRadius: '2rem',
                      background: incident.severity === 'Critical' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                      color: incident.severity === 'Critical' ? '#ef4444' : '#3b82f6',
                      border: `1px solid ${incident.severity === 'Critical' ? '#ef4444' : '#3b82f6'}`
                    }}>
                      {incident.severity}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: incident.status === 'Resolved' ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
                      {incident.status === 'Resolved' ? '✓ Resolved' : '⚠ Active'}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', fontWeight: 700 }}>{incident.title}</h4>
                  <p style={{ fontSize: '0.95rem', color: '#94a3b8', height: '60px', overflow: 'hidden', lineHeight: 1.5, marginBottom: '1.5rem' }}>{incident.description}</p>

                  {incident.status !== 'Resolved' && (
                    <button
                      onClick={() => handleResolveIncident(incident._id)}
                      className="btn-secondary"
                      style={{ width: '100%', justifyContent: 'center', borderColor: '#10b981', color: '#10b981' }}
                    >
                      Mark as Resolved
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
