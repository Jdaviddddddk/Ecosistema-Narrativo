import { Routes, Route } from 'react-router'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import Info from './pages/Info'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Profile from './pages/Profile'
import UploadFlow from "@/pages/upload/UploadFlow";
import NexoHeader from '@/components/NexoHeader'

export default function App() {
  return (
    <AuthProvider>
      <NexoHeader />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/info" element={<Info />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/project/:id" element={<ProjectDetail />} />
        <Route path="/upload" element={<UploadFlow />} />
        <Route path="/yo" element={<Profile />} />
      </Routes>
    </AuthProvider>
  )
}