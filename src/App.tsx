import { useState } from 'react'
import { Routes, Route } from 'react-router'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import Info from './pages/Info'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Profile from './pages/Profile'
import UploadFlowWrapper from "@/pages/upload/UploadFlow";
import NexoHeader from '@/components/NexoHeader'
import PortadaNomada from './components/PortadaNomada'

const GOOGLE_CLIENT_ID = "786954818285-utp39amnvl790u6rch5ut60gejfn8hc5.apps.googleusercontent.com"; // ← REEMPLAZA CON TU CLIENT ID

export default function App() {
  const [portadaVisible, setPortadaVisible] = useState(true)

  const handleComenzar = () => {
    setPortadaVisible(false)
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        {/* PORTADA NÓMADA — Solo al inicio */}
        {portadaVisible && (
          <PortadaNomada onComenzar={handleComenzar} />
        )}

        {/* ECOSISTEMA — Oculto mientras la portada está activa */}
        <div 
          className={`
            transition-opacity duration-1000
            ${portadaVisible ? 'opacity-0 pointer-events-none' : 'opacity-100'}
          `}
        >
          <NexoHeader />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/info" element={<Info />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/upload" element={<UploadFlowWrapper />} />
            <Route path="/yo" element={<Profile />} />
          </Routes>
        </div>
      </AuthProvider>
    </GoogleOAuthProvider>
  )
}