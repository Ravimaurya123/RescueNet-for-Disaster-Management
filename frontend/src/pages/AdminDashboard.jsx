import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Shield, Users, AlertTriangle, CheckCircle, Trash2, ExternalLink } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [agencies, setAgencies] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [stats, setStats] = useState({ totalAgencies: 0, activeIncidents: 0, criticalAlerts: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [agenciesRes, incidentsRes] = await Promise.all([
          axios.get('/api/agencies'),
          axios.get('/api/incidents')
        ]);
        
        setAgencies(agenciesRes.data);
        setIncidents(incidentsRes.data);
        
        setStats({
          totalAgencies: agenciesRes.data.length,
          activeIncidents: incidentsRes.data.filter(i => i.status !== 'Resolved').length,
          criticalAlerts: incidentsRes.data.filter(i => i.severity === 'Critical' && i.status !== 'Resolved').length
        });
      } catch (err) {
        console.error('Error fetching admin data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const handleDeleteAgency = async (id) => {
    if (!window.confirm('Delete this agency permanently? This will also remove associated users.')) return;
    try {
      await axios.delete(`/api/agencies/${id}`);
      setAgencies(agencies.filter(a => a._id !== id));
      setStats({...stats, totalAgencies: stats.totalAgencies - 1});
    } catch (err) {
      alert('Failed to delete agency');
    }
  };

  const handleDeleteIncident = async (id) => {
    if (!window.confirm('Remove this incident report?')) return;
    try {
      await axios.delete(`/api/incidents/${id}`);
      setIncidents(incidents.filter(i => i._id !== id));
    } catch (err) {
      alert('Failed to delete incident');
    }
  };

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Accessing Secure Admin Terminal...</div>;

  return (
    <div style={{ padding: '2rem 5%', maxWidth: '1600px', margin: '0 auto' }} className="fade-in">
      <header style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-2px' }}>
            Mission <span style={{ color: 'var(--primary)' }}>Control</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Global Oversight & Agency Verification System</p>
        </div>
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.75rem 1.5rem', borderRadius: '1rem', border: '1px solid #ef4444', fontWeight: 700, fontSize: '0.9rem' }}>
          ADMINISTRATOR ACCESS GRANTED
        </div>
      </header>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginBottom: '4rem' }}>
        <div className="glass" style={{ padding: '2rem', textAlign: 'center' }}>
          <Users size={32} color="#3b82f6" style={{ margin: '0 auto 1rem' }} />
          <h4 style={{ fontSize: '2.5rem', fontWeight: 800 }}>{stats.totalAgencies}</h4>
          <p style={{ color: '#94a3b8', fontWeight: 600 }}>REGISTERED AGENCIES</p>
        </div>
        <div className="glass" style={{ padding: '2rem', textAlign: 'center' }}>
          <AlertTriangle size={32} color="#f59e0b" style={{ margin: '0 auto 1rem' }} />
          <h4 style={{ fontSize: '2.5rem', fontWeight: 800 }}>{stats.activeIncidents}</h4>
          <p style={{ color: '#94a3b8', fontWeight: 600 }}>ACTIVE DISASTERS</p>
        </div>
        <div className="glass" style={{ padding: '2rem', textAlign: 'center' }}>
          <Shield size={32} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
          <h4 style={{ fontSize: '2.5rem', fontWeight: 800 }}>{stats.criticalAlerts}</h4>
          <p style={{ color: '#94a3b8', fontWeight: 600 }}>CRITICAL THREATS</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
        {/* Agencies Management */}
        <section>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Users size={28} color="#3b82f6" />
            Agency Management
          </h2>
          <div className="glass" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--glass-border)' }}>
                  <th style={{ padding: '1.25rem' }}>AGENCY NAME</th>
                  <th style={{ padding: '1.25rem' }}>STATUS</th>
                  <th style={{ padding: '1.25rem' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {agencies.map(agency => (
                  <tr key={agency._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '1.25rem' }}>
                      <p style={{ fontWeight: 600 }}>{agency.name}</p>
                      <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{agency.email}</p>
                    </td>
                    <td style={{ padding: '1.25rem' }}>
                      <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>{agency.status.toUpperCase()}</span>
                    </td>
                    <td style={{ padding: '1.25rem' }}>
                      <button onClick={() => handleDeleteAgency(agency._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Incidents Management */}
        <section>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={28} color="#ef4444" />
            Active Alerts
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {incidents.filter(i => i.status !== 'Resolved').map(incident => (
              <div key={incident._id} className="glass" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{incident.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    By: {incident.createdBy?.name || 'Unknown'} • {new Date(incident.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <span style={{ fontSize: '0.7rem', padding: '4px 8px', background: incident.severity === 'Critical' ? '#ef4444' : '#3b82f6', borderRadius: '4px' }}>
                    {incident.severity}
                  </span>
                  <button onClick={() => handleDeleteIncident(incident._id)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
