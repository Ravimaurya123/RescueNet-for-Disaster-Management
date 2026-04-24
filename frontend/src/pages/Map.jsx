import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import api from '../api/axios';
import axios from 'axios';
import L from 'leaflet';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { Shield, AlertTriangle, Navigation, MapPin, Crosshair } from 'lucide-react';

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
  const { socket } = useSocket();
  const { user } = useAuth();
  const [agencies, setAgencies] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: 'All', showAgencies: true, showIncidents: true });
  const [userLocation, setUserLocation] = useState(null);
  const [showUserLocation, setShowUserLocation] = useState(true);
  const mapRef = useRef();

  // Route Guide State
  const [routeData, setRouteData] = useState(null);
  const [mapStyle, setMapStyle] = useState('satellite');
  const [isRouting, setIsRouting] = useState(false);

  // Calculate fastest path using public OSRM API
  const calculateRoute = async (targetLocation) => {
    if (!userLocation) return alert("Your live location is not active yet.");
    setIsRouting(true);
    try {
      const start = `${userLocation.lng},${userLocation.lat}`;
      const end = `${targetLocation.lng},${targetLocation.lat}`;
      const res = await axios.get(`https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson`);
      
      if (res.data && res.data.routes && res.data.routes.length > 0) {
        const route = res.data.routes[0];
        const path = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
        setRouteData({
          path,
          distance: (route.distance / 1000).toFixed(1),
          duration: Math.ceil(route.duration / 60)
        });
      }
    } catch (err) {
      console.error("Failed to calculate route:", err);
      alert("Route calculation failed.");
    } finally {
      setIsRouting(false);
    }
  };

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

  // Get user's live location seamlessly via watchPosition
  useEffect(() => {
    let watchId;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });

          // Broadcast location to all clients if user is an agency
          if (socket && user && user.agencyId) {
            socket.emit('updateAgencyLocation', {
              agencyId: user.agencyId,
              lat,
              lng
            });
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0 // "abhi jha pe hai" - continuous updates
        }
      );
    }
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [socket, user]);

  // Real-time Event Listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('agencyLocationUpdated', (data) => {
      setAgencies(prev => prev.map(agency => 
        agency._id === data.agencyId ? { ...agency, location: { lat: data.lat, lng: data.lng, address: agency.location?.address } } : agency
      ));
    });

    socket.on('newIncident', (incident) => {
      setIncidents(prev => [incident, ...prev]);
    });

    socket.on('incidentUpdated', (updatedIncident) => {
      setIncidents(prev => prev.map(inc => inc._id === updatedIncident._id ? updatedIncident : inc));
    });

    socket.on('incidentDeleted', (deletedId) => {
      setIncidents(prev => prev.filter(inc => inc._id !== deletedId));
    });

    return () => {
      socket.off('agencyLocationUpdated');
      socket.off('newIncident');
      socket.off('incidentUpdated');
      socket.off('incidentDeleted');
    };
  }, [socket]);

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

  // Center map on user location
  const centerOnUserLocation = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.setView([userLocation.lat, userLocation.lng], 15);
    }
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
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', cursor: 'pointer', color: 'white' }}>
              <input type="checkbox" checked={showUserLocation} onChange={() => setShowUserLocation(!showUserLocation)} />
              Show My Location
            </label>
          </div>
          
          <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
            <button 
              onClick={() => setMapStyle(mapStyle === 'dark' ? 'satellite' : 'dark')}
              style={{ width: '100%', padding: '0.6rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center', transition: 'all 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            >
              🌍 Switch to {mapStyle === 'dark' ? 'Satellite View' : 'Dark Map'}
            </button>
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
          <button
            onClick={centerOnUserLocation}
            disabled={!userLocation}
            style={{
              marginTop: '0.5rem',
              padding: '0.5rem 1rem',
              background: userLocation ? 'var(--primary)' : '#64748b',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: userLocation ? 'pointer' : 'not-allowed',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Crosshair size={16} />
            Center on Me
          </button>
        </div>
      </div>

      <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }} zoomControl={false} ref={mapRef}>
        {/* Base Map Layer */}
        <TileLayer
          key={mapStyle} // Forces re-render of TileLayer when source changes
          attribution={mapStyle === 'dark' ? '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>' : '&copy; <a href="https://www.esri.com/">Esri</a>'}
          url={mapStyle === 'dark' ? 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png' : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'}
        />
        
        {/* Maps Label Overlay for Satellite View */}
        {mapStyle === 'satellite' && (
           <TileLayer
             url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
           />
        )}

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
                <div style={{ marginTop: '0.75rem' }}>
                  <button 
                    className="btn-primary" 
                    style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem' }} 
                    onClick={() => calculateRoute(incident.location)}
                    disabled={!userLocation || isRouting}
                  >
                    🗺️ {isRouting ? 'Calculating...' : 'Guide Me (ETA)'}
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {showUserLocation && userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={L.divIcon({
              className: 'custom-user-location-icon',
              html: `<div style="background-color: #10b981; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px rgba(16,185,129,0.6); position: relative;"><div style="position: absolute; top: -8px; left: -8px; width: 36px; height: 36px; border: 2px solid #10b981; border-radius: 50%; animation: pulse 2s infinite;"></div></div>`,
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            })}
          >
            <Popup className="custom-popup">
              <div style={{ minWidth: '180px', padding: '5px' }}>
                <h3 style={{ color: 'white', fontWeight: 800, marginBottom: '0.5rem' }}>
                  Your Location
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                  Live GPS coordinates
                </p>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>
                  Lat: {userLocation.lat.toFixed(6)}<br />
                  Lng: {userLocation.lng.toFixed(6)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route Polyline overlay for "Guide Me" */}
        {routeData && routeData.path && (
          <Polyline positions={routeData.path} pathOptions={{ color: '#00eeff', weight: 6, opacity: 0.9, dashArray: '10, 10', lineCap: 'round' }} />
        )}
      </MapContainer>

      {/* Floating Route Info Overlay */}
      {routeData && (
        <div className="glass fade-in" style={{
          position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 1000, padding: '1rem 2rem', display: 'flex', gap: '2rem', alignItems: 'center',
          boxShadow: '0 0 30px rgba(0, 238, 255, 0.2)', border: '1px solid rgba(0, 238, 255, 0.4)'
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', letterSpacing: '2px', fontWeight: 'bold' }}>REACHING IN</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#39ff14', textShadow: '0 0 10px rgba(57,255,20,0.5)' }}>{routeData.duration} min</div>
          </div>
          <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.2)' }}></div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', letterSpacing: '2px', fontWeight: 'bold' }}>DISTANCE</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 600, color: 'white' }}>{routeData.distance} km</div>
          </div>
          <button 
            onClick={() => setRouteData(null)}
            style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', marginLeft: '1rem', fontWeight: 'bold', transition: 'all 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.background = '#ef4444'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
          >
            Clear Route
          </button>
        </div>
      )}
    </div>
  );
};

export default MapPage;
