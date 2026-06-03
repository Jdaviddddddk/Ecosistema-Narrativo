import { useState } from 'react'
import { Routes, Route, useLocation } from 'react-router'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import Info from './pages/Info'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Profile from './pages/Profile'
import PublicProfile from './pages/PublicProfile'
import UploadFlowWrapper from "@/pages/upload/UploadFlow";
import NexoHeader from '@/components/NexoHeader'
import PortadaNomada from './components/PortadaNomada'

const GOOGLE_CLIENT_ID = "786954818285-utp39amnvl790u6rch5ut60gejfn8hc5.apps.googleusercontent.com";

// Envuelve el contenido para poder usar useLocation dentro del Router
function AppContent() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  // La portada solo se muestra si el usuario entra directamente al home
  const [portadaVisible, setPortadaVisible] = useState(() => isHome);

  const handleComenzar = () => setPortadaVisible(false);

  // Si no es home, nunca mostramos la portada
  const mostrarPortada = isHome && portadaVisible;

  return (
    <>
      {/* PORTADA NÓMADA — Solo en "/" */}
      {mostrarPortada && (
        <PortadaNomada onComenzar={handleComenzar} />
      )}

      {/* ECOSISTEMA */}
      <div
        style={{
          opacity: mostrarPortada ? 0 : 1,
          pointerEvents: mostrarPortada ? 'none' : 'auto',
          transition: 'opacity 0.8s ease',
        }}
      >
        <NexoHeader />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/info" element={<Info />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/upload" element={<UploadFlowWrapper />} />
          <Route path="/yo" element={<Profile />} />
          <Route path="/profile/:id" element={<PublicProfile />} />
        </Routes>
      </div>
    </>
  );
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
