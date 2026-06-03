import { Navigate, Link } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { projectsAPI } from "@/lib/api";
import { LogOut, MapPin, Calendar, Edit2, Check, X, Trash2, Eye } from "lucide-react";

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
  const { user, isAuthenticated, logout, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editInterests, setEditInterests] = useState("");

  const [userProjects, setUserProjects] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    projectsAPI.list().then((all: any[]) => {
      setUserProjects(all.filter(p => p.authorId === user.id));
    }).catch(console.error);
  }, [user]);

  const totalReactions = userProjects.reduce((sum, p) =>
    sum + (p.reactions?.inspires || 0) + (p.reactions?.learned || 0) + (p.reactions?.professional || 0) + (p.reactions?.inProgress || 0), 0);
  const publishedCount = userProjects.filter(p => p.status === "Publicado").length;

  const stats = [
    { label: "Proyectos", value: userProjects.length.toString() },
    { label: "Publicados", value: publishedCount.toString() },
    { label: "Reacciones", value: totalReactions.toLocaleString() },
    { label: "Logros", value: MOCK_INSIGHTS.length.toString() },
    { label: "Calificación", value: "5.0" },
    { label: "Días activo", value: "45" },
  ];

  if (!isAuthenticated) return <Navigate to="/" replace />;

  const handleEdit = () => {
    setEditBio(user?.bio || "");
    setEditLocation(user?.location || "");
    setEditInterests(user?.interests?.join(", ") || "");
    setIsEditing(true);
  };

  const handleSave = () => {
    updateProfile({
      bio: editBio,
      location: editLocation,
      interests: editInterests.split(",").map(s => s.trim()).filter(Boolean),
    });
    setIsEditing(false);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!user) return;
    if (confirm("¿Seguro que quieres eliminar este proyecto?")) {
      await projectsAPI.delete(projectId).catch(console.error);
      setUserProjects(prev => prev.filter(p => p.id !== projectId));
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "info", label: "Información" },
    { key: "proyectos", label: "Proyectos" },
    { key: "calificaciones", label: "Calificaciones" },
    { key: "resenas", label: "Reseñas" },
    { key: "insights", label: "Logros" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header del perfil */}
      <div className="bg-white border-b border-blue-100">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar real de Google */}
            <div className="relative">
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden shadow-xl shadow-blue-500/20">
                <img 
                  src={user?.avatar || "/images/avatar_default.jpg"} 
                  alt={user?.name}
                  className="w-full h-full object-cover"
                />
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
              
              <div className="flex items-center justify-center md:justify-start gap-2 text-sm mb-4" style={{ fontFamily: "'Montserrat', sans-serif", color: "#999" }}>
                <MapPin size={14} />
                {isEditing ? (
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                ) : (
                  <span>{user?.location}</span>
                )}
              </div>

              {isEditing ? (
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full max-w-xl p-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-nexo-primary text-sm mb-4"
                  rows={3}
                />
              ) : (
                <p className="text-base max-w-xl leading-relaxed mb-4" style={{ fontFamily: "'Montserrat', sans-serif", color: "#666" }}>
                  {user?.bio}
                </p>
              )}

              <div className="flex items-center justify-center md:justify-start gap-4 text-xs uppercase tracking-wider" style={{ fontFamily: "'Montserrat', sans-serif", color: "#999" }}>
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  Miembro desde {new Date(user?.joinedAt || "").toLocaleDateString("es-CO", { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">
                  {user?.role === "creator" ? "Creador" : "Espectador"}
                </span>
              </div>

              {isEditing && (
                <div className="mt-3">
                  <label className="text-xs text-gray-500 block mb-1">Intereses (separados por coma)</label>
                  <input
                    type="text"
                    value={editInterests}
                    onChange={(e) => setEditInterests(e.target.value)}
                    className="w-full max-w-xl p-2 border border-gray-200 rounded-lg text-sm"
                    placeholder="Diseño Visual, Fotografía, Branding..."
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              {isEditing ? (
                <>
                  <button onClick={handleSave} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors text-sm font-medium">
                    <Check size={16} /> Guardar
                  </button>
                  <button onClick={() => setIsEditing(false)} className="flex items-center justify-center gap-2 px-6 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                    <X size={16} /> Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button onClick={handleEdit} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-nexo-primary text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium">
                    <Edit2 size={16} /> Editar Perfil
                  </button>
                  <button onClick={logout} className="flex items-center justify-center gap-2 px-6 py-2.5 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors text-sm">
                    <LogOut size={16} /> Cerrar Sesión
                  </button>
                </>
              )}
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
                  {user?.interests?.map((tag) => (
                    <span key={tag} className="nexo-tag">
                      {tag}
                    </span>
                  )) || ["Diseño Visual", "Fotografía", "Branding", "UI/UX"].map((tag) => (
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
                Mis Proyectos ({userProjects.length})
              </h3>
              <Link to="/upload" className="nexo-button-primary text-sm">
                + Nuevo Proyecto
              </Link>
            </div>
            
            {userProjects.length === 0 ? (
              <div className="nexo-card p-12 text-center">
                <p className="text-gray-400 font-montserrat mb-4">Aún no has subido proyectos.</p>
                <Link to="/upload" className="nexo-button-primary text-sm">
                  Subir mi primer proyecto
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userProjects.map((project) => (
                  <div key={project.id} className="nexo-card overflow-hidden group">
                    <div className="aspect-video overflow-hidden bg-gray-100 relative">
                      <img
                        src={project.thumbnail}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          to={`/project/${project.id}`}
                          className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors"
                          title="Ver proyecto"
                        >
                          <Eye size={14} />
                        </Link>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="p-2 bg-red-50/90 rounded-lg hover:bg-red-100 transition-colors text-red-500"
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs uppercase tracking-wider" style={{ fontFamily: "'Montserrat', sans-serif", color: "#004FCD" }}>
                          {project.area}
                        </span>
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                          project.status === "Publicado" 
                            ? "bg-green-100 text-green-700" 
                            : project.status === "En revisión"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {project.status === "Publicado" ? "Publicado" : project.status === "En revisión" ? "En revisión" : "Borrador"}
                        </span>
                      </div>
                      <h4 className="text-lg mb-2" style={{ fontFamily: "'Sono', sans-serif", fontWeight: 600 }}>
                        {project.title}
                      </h4>
                      <div className="flex items-center gap-4 text-xs" style={{ fontFamily: "'Montserrat', sans-serif", color: "#999" }}>
                        <span>{new Date().toLocaleDateString("es-CO")}</span>
                        <span className="flex items-center gap-1" title="Total reacciones">
                          <span>💡{project.reactions?.inspires || 0}</span>
                          <span>📚{project.reactions?.learned || 0}</span>
                          <span>⭐{project.reactions?.professional || 0}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                  Basado en {MOCK_REVIEWS.length} reseña{MOCK_REVIEWS.length !== 1 ? "s" : ""}
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
                      {new Date(review.date).toLocaleDateString("es-CO")}
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
                    {new Date(review.date).toLocaleDateString("es-CO")}
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
                    {new Date(insight.unlockedAt).toLocaleDateString("es-CO")}
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