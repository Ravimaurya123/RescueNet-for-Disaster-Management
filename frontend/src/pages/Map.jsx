import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import api from '../api/axios';
import L from 'leaflet';
import { Shield, AlertTriangle, Navigation, MapPin } from 'lucide-react';

// Fix for default marker icons in Leaflet with React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapPage = () => {
  const [agencies, setAgencies] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: 'All', showAgencies: true, showIncidents: true });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [agenciesRes, incidentsRes] = await Promise.all([
          api.get('/api/agencies'),
          api.get('/api/incidents')
        ]);
        setAgencies(agenciesRes.data);
        setIncidents(incidentsRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Custom marker for agencies
  const getAgencyIcon = (status) => {
    let color = '#3b82f6'; // active
    if (status === 'deployed') color = '#f59e0b';
    if (status === 'inactive') color = '#64748b';

    return L.divIcon({
      className: 'custom-agency-icon',
      html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3)"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };

  const filteredAgencies = agencies.filter(a => filter.showAgencies && (filter.type === 'All' || a.type === filter.type));
  const filteredIncidents = incidents.filter(i => filter.showIncidents && (filter.type === 'All' || i.type === filter.type) && i.status !== 'Resolved');

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Initializing Map Operations...</div>;

  return (
    <div className="map-page-container fade-in">
      {/* Controls Overlay */}
      <div style={{ position: 'absolute', top: '10px', left: '10px', right: '10px', zIndex: 1000, display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '10px', pointerEvents: 'none' }}>
        <div className="glass" style={{ padding: '1rem', width: '100%', maxWidth: '280px', pointerEvents: 'auto' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', fontWeight: 700 }}>
            <Navigation size={22} color="var(--primary)" />
            Live Monitor
          </h3>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Filter by Type</label>
            <select className="form-input" value={filter.type} onChange={(e) => setFilter({ ...filter, type: e.target.value })}>
              <option value="All">All Types</option>
              <option value="Flood">Flood</option>
              <option value="Fire">Fire</option>
              <option value="Medical">Medical</option>
              <option value="Earthquake">Earthquake</option>
              <option value="Cyclone">Cyclone</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', cursor: 'pointer', color: 'white' }}>
              <input type="checkbox" checked={filter.showAgencies} onChange={() => setFilter({ ...filter, showAgencies: !filter.showAgencies })} />
              Show Rescue Agencies
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', cursor: 'pointer', color: 'white' }}>
              <input type="checkbox" checked={filter.showIncidents} onChange={() => setFilter({ ...filter, showIncidents: !filter.showIncidents })} />
              Show Active Alerts
            </label>
          </div>
        </div>

        <div className="glass" style={{ padding: '1rem', width: '100%', maxWidth: '280px', display: 'flex', flexDirection: 'column', gap: '0.75rem', pointerEvents: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#3b82f6', border: '2px solid white' }}></div>
            Available Agency
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#f59e0b', border: '2px solid white' }}></div>
            Deployed Agency
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#ef4444', border: '2px solid white' }}></div>
            Active Incident
          </div>
        </div>
      </div>

      <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }} zoomControl={false}>
        <TileLayer
          attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
        />

        {filteredAgencies.map((agency) => (
          <Marker
            key={agency._id}
            position={[agency.location.lat, agency.location.lng]}
            icon={getAgencyIcon(agency.status)}
          >
            <Popup className="custom-popup">
              <div style={{ minWidth: '220px', padding: '5px' }}>
                <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem', marginBottom: '0.75rem', color: 'white', fontWeight: 800 }}>
                  {agency.name}
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '0.5rem' }}><strong>Type:</strong> {agency.type}</p>
                <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '0.5rem' }}><strong>Status:</strong>
                  <span style={{ color: agency.status === 'active' ? '#10b981' : '#f59e0b', marginLeft: '5px', fontWeight: 600 }}>
                    {agency.status.toUpperCase()}
                  </span>
                </p>
                <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '1rem' }}><strong>Contact:</strong> {agency.phone}</p>
                <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>RESOURCES</p>
                  <p style={{ fontSize: '0.85rem', color: 'white' }}>{agency.resources?.join(', ') || 'General Rescue'}</p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {filteredIncidents.map((incident) => (
          <Marker
            key={incident._id}
            position={[incident.location.lat, incident.location.lng]}
            icon={L.divIcon({
              className: 'custom-incident-icon',
              html: `<div style="background-color: #ef4444; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px rgba(239,68,68,0.5); display: flex; align-items: center; justify-content: center;"><div style="width: 8px; height: 8px; background: white; border-radius: 50%; animation: pulse 1.5s infinite"></div></div>`,
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            })}
          >
            <Popup className="custom-popup">
              <div style={{ minWidth: '220px', padding: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '3px 8px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', borderRadius: '4px', border: '1px solid #ef4444' }}>
                    {incident.severity.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ACTIVE ALERT</span>
                </div>
                <h3 style={{ fontSize: '1.25rem', color: 'white', fontWeight: 800, marginBottom: '0.5rem' }}>
                  {incident.title}
                </h3>
                <p style={{ fontSize: '0.95rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1rem' }}>
                  {incident.description}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem' }}>
                  <MapPin size={16} />
                  <span>Reported Location</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapPage;
