import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MapPage from './pages/Map';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/AdminDashboard';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
};

const ColorfulCursor = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  useEffect(() => {
    const onMouseMove = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);
  return (
    <div className="custom-cursor" style={{ left: pos.x, top: pos.y }}>
      <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28" stroke="white" strokeWidth="1">
        <path d="M13.5 4.5A2.5 2.5 0 0 0 11 2v9.5L8 9a2 2 0 0 0-2.8.3L4 10.5l5.5 5.5A5.5 5.5 0 0 0 13.4 18h3.1a5.5 5.5 0 0 0 5.5-5.5v-3a2.5 2.5 0 0 0-5 0h-.5a2.5 2.5 0 0 0-5 0V4.5z"/>
      </svg>
    </div>
  );
};

function App() {
  return (
    <SocketProvider>
      <ColorfulCursor />
      <Router>
        <Navbar />
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
    </SocketProvider>
  );
}

export default App;
