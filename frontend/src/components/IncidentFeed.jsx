import { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, Clock, MapPin, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const IncidentFeed = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const res = await axios.get('/api/incidents');
        // Sort by newest first and limit to 5
        const sorted = res.data
          .filter(i => i.status !== 'Resolved')
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        setIncidents(sorted);
      } catch (err) {
        console.error('Error fetching incident feed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchIncidents();
  }, []);

  if (loading) return <div style={{ color: '#94a3b8', padding: '1rem' }}>Updating live feed...</div>;

  return (
    <div className="glass fade-in" style={{ padding: '1.5rem', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={20} color="#ef4444" />
          Live Alerts
        </h3>
        <Link to="/map" style={{ fontSize: '0.8rem', color: '#3b82f6', textDecoration: 'none', fontWeight: 600 }}>
          View All Map
        </Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {incidents.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>No active disasters reported. All quiet.</p>
        ) : (
          incidents.map((incident) => (
            <div key={incident._id} style={{ 
              padding: '1rem', 
              background: 'rgba(255, 255, 255, 0.03)', 
              borderRadius: '0.75rem', 
              border: '1px solid rgba(255, 255, 255, 0.05)',
              transition: 'transform 0.2s',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateX(5px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateX(0)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ 
                  fontSize: '0.65rem', 
                  fontWeight: 800, 
                  padding: '2px 6px', 
                  borderRadius: '4px', 
                  background: incident.severity === 'Critical' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                  color: incident.severity === 'Critical' ? '#ef4444' : '#3b82f6'
                }}>
                  {incident.severity.toUpperCase()}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} />
                  {new Date(incident.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.25rem', color: 'white' }}>{incident.title}</h4>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={12} />
                {incident.location.address || 'Location Reported'}
              </p>
            </div>
          ))
        )}
      </div>

      <Link 
        to="/register" 
        className="btn-primary" 
        style={{ width: '100%', marginTop: '1.5rem', fontSize: '0.85rem', padding: '0.75rem' }}
      >
        Reporting an Emergency?
        <ChevronRight size={16} />
      </Link>
    </div>
  );
};

export default IncidentFeed;
