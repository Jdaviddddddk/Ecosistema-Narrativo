import { useState } from 'react'
import { Routes, Route } from 'react-router'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import Info from './pages/Info'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Profile from './pages/Profile'
import UploadFlow from "@/pages/upload/UploadFlow";
import NexoHeader from '@/components/NexoHeader'
import PortadaNomada from './components/PortadaNomada'

export default function App() {
  const [portadaVisible, setPortadaVisible] = useState(true)

  const handleComenzar = () => {
    setPortadaVisible(false)
  }

  return (
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
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/upload" element={<UploadFlow />} />
          <Route path="/yo" element={<Profile />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}