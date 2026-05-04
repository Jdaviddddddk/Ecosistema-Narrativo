import { Navigate, Link } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

interface Project {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  status: "published" | "draft" | "archived";
  createdAt: string;
  views: number;
}

interface Review {
  id: string;
  projectTitle: string;
  rating: number;
  comment: string;
  date: string;
}

interface Insight {
  id: string;
  type: "milestone" | "badge" | "streak";
  title: string;
  description: string;
  unlockedAt: string;
  icon: string;
}

const MOCK_PROJECTS: Project[] = [
  {
    id: "proj_1",
    title: "Ecosistema Lumínico",
    category: "Fotografía",
    thumbnail: "/images/portrait_01.jpg",
    status: "published",
    createdAt: "2025-01-20",
    views: 1240,
  },
  {
    id: "proj_2",
    title: "Vórtice Interior",
    category: "Instalación",
    thumbnail: "/images/portrait_02.jpg",
    status: "draft",
    createdAt: "2025-03-10",
    views: 0,
  },
];

const MOCK_REVIEWS: Review[] = [
  {
    id: "rev_1",
    projectTitle: "Ecosistema Lumínico",
    rating: 5,
    comment: "Una narrativa visual impresionante. La composición transmite movimiento y quietud simultáneamente.",
    date: "2025-02-15",
  },
];

const MOCK_INSIGHTS: Insight[] = [
  { id: "ins_1", type: "milestone", title: "Primer Proyecto", description: "Publicaste tu primera obra en NEXO", unlockedAt: "2025-01-20", icon: "🎯" },
  { id: "ins_2", type: "badge", title: "Creador Visual", description: "Superaste las 1,000 vistas en tus proyectos", unlockedAt: "2025-02-01", icon: "👁" },
  { id: "ins_3", type: "streak", title: "Constancia", description: "30 días consecutivos de actividad", unlockedAt: "2025-04-01", icon: "🔥" },
];

type Tab = "info" | "proyectos" | "calificaciones" | "resenas" | "insights";

export default function Profile() {
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("info");

  if (!isAuthenticated) return <Navigate to="/" replace />;

  const tabs: { key: Tab; label: string }[] = [
    { key: "info", label: "Información" },
    { key: "proyectos", label: "Proyectos" },
    { key: "calificaciones", label: "Calificaciones" },
    { key: "resenas", label: "Reseñas" },
    { key: "insights", label: "Logros" },
  ];

  const stats = [
    { label: "Proyectos", value: "2" },
    { label: "Vistas", value: "1,240" },
    { label: "Reseñas", value: "1" },
    { label: "Logros", value: "3" },
    { label: "Calificación", value: "5.0" },
    { label: "Días activo", value: "45" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header del perfil */}
      <div className="bg-white border-b border-blue-100">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden shadow-xl shadow-blue-500/20 bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
  <img src="/images/logo-nexo.png" alt="NEXO" className="w-16 h-16 object-contain opacity-90" />
</div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl mb-2" style={{ fontFamily: "'Sono', sans-serif", fontWeight: 700, color: "#1a1a1a" }}>
                {user?.name}
              </h1>
              <p className="text-sm mb-1" style={{ fontFamily: "'Montserrat', sans-serif", color: "#004FCD" }}>
                {user?.email}
              </p>
              <p className="text-sm mb-4" style={{ fontFamily: "'Montserrat', sans-serif", color: "#999" }}>
                {user?.location}
              </p>
              <p className="text-base max-w-xl leading-relaxed mb-4" style={{ fontFamily: "'Montserrat', sans-serif", color: "#666" }}>
                {user?.bio}
              </p>
              <div className="flex items-center justify-center md:justify-start gap-4 text-xs uppercase tracking-wider" style={{ fontFamily: "'Montserrat', sans-serif", color: "#999" }}>
                <span>Miembro desde {new Date(user?.joinedAt || "").toLocaleDateString("es-MX")}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">
                  {user?.role === "creator" ? "Creador" : "Espectador"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button className="nexo-button-primary text-sm">
                Editar Perfil
              </button>
              <button 
                onClick={logout}
                className="nexo-button-outline text-sm"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-blue-600" style={{ fontFamily: "'Sono', sans-serif" }}>
                  {stat.value}
                </div>
                <div className="text-xs uppercase tracking-wider mt-1" style={{ fontFamily: "'Montserrat', sans-serif", color: "#999" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="px-6 py-4 text-sm font-medium transition-all relative whitespace-nowrap"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  color: activeTab === tab.key ? "#004FCD" : "#999",
                  fontWeight: activeTab === tab.key ? 600 : 400,
                }}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-nexo rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        {activeTab === "info" && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="nexo-card p-8">
              <h3 className="text-xl mb-6" style={{ fontFamily: "'Sono', sans-serif", fontWeight: 700 }}>
                Datos Personales
              </h3>
              <dl className="space-y-5">
                {[
                  { label: "Nombre completo", value: user?.name },
                  { label: "Correo electrónico", value: user?.email },
                  { label: "Ubicación", value: user?.location },
                  { label: "Rol", value: user?.role === "creator" ? "Creador" : "Espectador" },
                ].map((item) => (
                  <div key={item.label}>
                    <dt className="text-xs uppercase tracking-wider mb-1" style={{ fontFamily: "'Montserrat', sans-serif", color: "#999" }}>
                      {item.label}
                    </dt>
                    <dd className="text-base" style={{ fontFamily: "'Montserrat', sans-serif", color: "#1a1a1a" }}>
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="nexo-card p-8">
              <h3 className="text-xl mb-6" style={{ fontFamily: "'Sono', sans-serif", fontWeight: 700 }}>
                Sobre Mí
              </h3>
              <p className="leading-relaxed" style={{ fontFamily: "'Montserrat', sans-serif", color: "#666" }}>
                {user?.bio}
              </p>
              
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h4 className="text-sm font-semibold mb-3" style={{ fontFamily: "'Montserrat', sans-serif", color: "#1a1a1a" }}>
                  Áreas de interés
                </h4>
                <div className="flex flex-wrap gap-2">
                  {["Diseño Visual", "Fotografía", "Branding", "UI/UX"].map((tag) => (
                    <span key={tag} className="nexo-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "proyectos" && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl" style={{ fontFamily: "'Sono', sans-serif", fontWeight: 700 }}>
                Mis Proyectos
              </h3>
              <Link to="/upload" className="nexo-button-primary text-sm">
                + Nuevo Proyecto
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MOCK_PROJECTS.map((project) => (
                <div key={project.id} className="nexo-card overflow-hidden group">
                  <div className="aspect-video overflow-hidden bg-gray-100">
                    <img
                      src={project.thumbnail}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs uppercase tracking-wider" style={{ fontFamily: "'Montserrat', sans-serif", color: "#004FCD" }}>
                        {project.category}
                      </span>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                        project.status === "published" 
                          ? "bg-green-100 text-green-700" 
                          : project.status === "draft"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {project.status === "published" ? "Publicado" : project.status === "draft" ? "Borrador" : "Archivado"}
                      </span>
                    </div>
                    <h4 className="text-lg mb-2" style={{ fontFamily: "'Sono', sans-serif", fontWeight: 600 }}>
                      {project.title}
                    </h4>
                    <div className="flex items-center gap-4 text-xs" style={{ fontFamily: "'Montserrat', sans-serif", color: "#999" }}>
                      <span>{new Date(project.createdAt).toLocaleDateString("es-MX")}</span>
                      {project.views > 0 && (
                        <span className="flex items-center gap-1">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          {project.views.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "calificaciones" && (
          <div className="max-w-2xl">
            <div className="nexo-card p-8 mb-8 flex items-center gap-6">
              <div className="text-6xl font-bold text-blue-600" style={{ fontFamily: "'Sono', sans-serif" }}>
                5.0
              </div>
              <div>
                <div className="flex text-2xl text-yellow-400 mb-1">★★★★★</div>
                <p className="text-sm" style={{ fontFamily: "'Montserrat', sans-serif", color: "#999" }}>
                  Basado en 1 reseña
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {MOCK_REVIEWS.map((review) => (
                <div key={review.id} className="nexo-card p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                      {review.projectTitle}
                    </h4>
                    <span className="text-xs" style={{ fontFamily: "'Montserrat', sans-serif", color: "#999" }}>
                      {new Date(review.date).toLocaleDateString("es-MX")}
                    </span>
                  </div>
                  <div className="flex text-yellow-400 mb-3">★★★★★</div>
                  <p className="text-sm leading-relaxed" style={{ fontFamily: "'Montserrat', sans-serif", color: "#666" }}>
                    "{review.comment}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "resenas" && (
          <div className="max-w-2xl space-y-4">
            {MOCK_REVIEWS.map((review) => (
              <div key={review.id} className="nexo-card p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold mb-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                      {review.projectTitle}
                    </h4>
                    <div className="flex text-yellow-400">★★★★★</div>
                  </div>
                  <span className="text-xs" style={{ fontFamily: "'Montserrat', sans-serif", color: "#999" }}>
                    {new Date(review.date).toLocaleDateString("es-MX")}
                  </span>
                </div>
                <p className="text-sm leading-relaxed mt-3" style={{ fontFamily: "'Montserrat', sans-serif", color: "#666" }}>
                  "{review.comment}"
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "insights" && (
          <div>
            <h3 className="text-2xl mb-8" style={{ fontFamily: "'Sono', sans-serif", fontWeight: 700 }}>
              Logros Desbloqueados
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {MOCK_INSIGHTS.map((insight) => (
                <div key={insight.id} className="nexo-card p-8 text-center group hover:border-blue-200">
                  <div className="text-5xl mb-4 transform transition-transform group-hover:scale-110">
                    {insight.icon}
                  </div>
                  <h4 className="text-lg mb-2" style={{ fontFamily: "'Sono', sans-serif", fontWeight: 600 }}>
                    {insight.title}
                  </h4>
                  <p className="text-sm mb-4" style={{ fontFamily: "'Montserrat', sans-serif", color: "#999" }}>
                    {insight.description}
                  </p>
                  <span className="text-xs uppercase tracking-wider" style={{ fontFamily: "'Montserrat', sans-serif", color: "#004FCD" }}>
                    {new Date(insight.unlockedAt).toLocaleDateString("es-MX")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}