import { Navigate, Link } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useMemo } from "react";
import { projectsAPI, commentsAPI } from "@/lib/api";
import { LogOut, MapPin, Calendar, Edit2, Check, X, Trash2, Eye } from "lucide-react";
import NomadaGuia from "@/components/NomadaGuia";
import ShareButton from "@/components/ShareButton";
import { calculateAchievements, RARITY_COLORS, CATEGORY_LABELS, type Achievement } from "@/lib/achievements";

interface ReviewComment {
  id: string;
  projectId: string;
  projectTitle: string;
  projectThumbnail: string;
  reactions: { inspires: number; learned: number; professional: number; inProgress: number };
  authorId: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
}



type Tab = "info" | "proyectos" | "calificaciones" | "resenas" | "insights";

export default function Profile() {
  const { user, isAuthenticated, logout, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editInterests, setEditInterests] = useState("");
  const [editContact, setEditContact] = useState({ instagram: "", behance: "", linkedin: "", portfolio: "", email: "" });

  const [userProjects, setUserProjects] = useState<any[]>([]);
  const [reviewComments, setReviewComments] = useState<ReviewComment[]>([]);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    if (!user) return;
    projectsAPI.list().then(async (all: any[]) => {
      const mine = all.filter(p => p.authorId === user.id);
      setUserProjects(mine);
      // Cargar comentarios de todos los proyectos del usuario en paralelo
      const commentsByProject = await Promise.all(
        mine.map(p =>
          commentsAPI.list(p.id)
            .then((cs: any[]) => cs.map(c => ({
              ...c,
              projectId: p.id,
              projectTitle: p.title,
              projectThumbnail: p.thumbnail,
              reactions: p.reactions || { inspires: 0, learned: 0, professional: 0, inProgress: 0 },
            })))
            .catch(() => [])
        )
      );
      setReviewComments(commentsByProject.flat().sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    }).catch(console.error);

    // Sincronizar perfil con backend (por si nunca se guardó)
    import("@/lib/api").then(({ usersAPI }) => {
      usersAPI.save({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        interests: user.interests,
        isCommunityMember: user.isCommunityMember,
        joinedAt: user.joinedAt,
        contact: user.contact || {},
      }).catch(() => {});
    });
  }, [user]);

  const totalReactions = userProjects.reduce((sum, p) =>
    sum + (p.reactions?.inspires || 0) + (p.reactions?.learned || 0) + (p.reactions?.professional || 0) + (p.reactions?.inProgress || 0), 0);

  // Logros calculados en tiempo real
  const achievements = useMemo(() => {
    if (!user || userProjects.length === 0 && !user.bio) return [];
    const prevUnlocked = new Set(
      Object.keys(localStorage).filter(k => k.startsWith("achievement_unlock_")).map(k => k.replace("achievement_unlock_",""))
    );
    const result = calculateAchievements({ user, projects: userProjects, totalReactionsGiven: 0, totalComments: 0 });
    // Detectar nuevos desbloqueos
    const newlyUnlocked = result.find(a => a.unlocked && !prevUnlocked.has(a.id));
    if (newlyUnlocked) {
      setNewAchievement(newlyUnlocked);
      setTimeout(() => setNewAchievement(null), 5000);
    }
    return result;
  }, [user, userProjects]);
  const publishedCount = userProjects.filter(p => p.status === "Publicado").length;

  const stats = [
    { label: "Proyectos", value: userProjects.length.toString() },
    { label: "Publicados", value: publishedCount.toString() },
    { label: "Reacciones", value: totalReactions.toLocaleString() },
    { label: "Logros", value: achievements.filter(a => a.unlocked).length.toString() },
    { label: "Calificación", value: "5.0" },
    { label: "Días activo", value: "45" },
  ];

  if (!isAuthenticated) return <Navigate to="/" replace />;

  const handleEdit = () => {
    setEditBio(user?.bio || "");
    setEditLocation(user?.location || "");
    setEditInterests(user?.interests?.join(", ") || "");
    setEditContact({
      instagram: user?.contact?.instagram || "",
      behance: user?.contact?.behance || "",
      linkedin: user?.contact?.linkedin || "",
      portfolio: user?.contact?.portfolio || "",
      email: user?.contact?.email || "",
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    updateProfile({
      bio: editBio,
      location: editLocation,
      interests: editInterests.split(",").map(s => s.trim()).filter(Boolean),
      contact: {
        instagram: editContact.instagram || undefined,
        behance: editContact.behance || undefined,
        linkedin: editContact.linkedin || undefined,
        portfolio: editContact.portfolio || undefined,
        email: editContact.email || undefined,
      },
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
      {/* Toast de logro desbloqueado */}
      {newAchievement && (
        <div
          style={{
            position: "fixed",
            bottom: "32px",
            right: "32px",
            zIndex: 9999,
            background: "#fff",
            border: `2px solid ${RARITY_COLORS[newAchievement.rarity].border}`,
            borderRadius: "16px",
            padding: "20px 24px",
            boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
            maxWidth: "320px",
            animation: "slideUp 0.4s ease",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <span style={{ fontSize: "32px" }}>{newAchievement.icon}</span>
            <div>
              <p style={{ fontFamily: "'Montserrat',sans-serif", fontSize: "10px", fontWeight: 700, color: RARITY_COLORS[newAchievement.rarity].color, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "2px" }}>
                ¡Logro desbloqueado!
              </p>
              <p style={{ fontFamily: "'Sono',sans-serif", fontWeight: 700, fontSize: "15px", color: "#0a0a0a" }}>
                {newAchievement.title}
              </p>
            </div>
          </div>
          <p style={{ fontFamily: "'Montserrat',sans-serif", fontSize: "12px", color: "#555", lineHeight: 1.5, fontStyle: "italic" }}>
            "{newAchievement.lore}"
          </p>
        </div>
      )}

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
                <div className="mt-3 space-y-3 max-w-xl">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Intereses (separados por coma)</label>
                    <input type="text" value={editInterests} onChange={(e) => setEditInterests(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg text-sm" placeholder="Diseño Visual, Fotografía, Branding..." />
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Información de contacto</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { key: "instagram", placeholder: "Instagram (@usuario)" },
                        { key: "behance", placeholder: "Behance (usuario)" },
                        { key: "linkedin", placeholder: "LinkedIn (usuario)" },
                        { key: "portfolio", placeholder: "Portfolio (URL)" },
                        { key: "email", placeholder: "Email de contacto" },
                      ].map(({ key, placeholder }) => (
                        <input
                          key={key}
                          type="text"
                          value={(editContact as any)[key]}
                          onChange={(e) => setEditContact(prev => ({ ...prev, [key]: e.target.value }))}
                          placeholder={placeholder}
                          className="p-2 border border-gray-200 rounded-lg text-sm"
                        />
                      ))}
                    </div>
                  </div>
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
                  <ShareButton
                    url={`${window.location.origin}/profile/${user?.id}`}
                    label={`Perfil de ${user?.name} en NEXO`}
                  />
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
              <div>
                <div className="flex gap-4 text-2xl mb-1">
                  <span title="Inspira">💡 {userProjects.reduce((s, p) => s + (p.reactions?.inspires || 0), 0)}</span>
                  <span title="Aprendí algo">📚 {userProjects.reduce((s, p) => s + (p.reactions?.learned || 0), 0)}</span>
                  <span title="Nivel profesional">⭐ {userProjects.reduce((s, p) => s + (p.reactions?.professional || 0), 0)}</span>
                  <span title="En progreso">🔧 {userProjects.reduce((s, p) => s + (p.reactions?.inProgress || 0), 0)}</span>
                </div>
                <p className="text-sm mt-2" style={{ fontFamily: "'Montserrat', sans-serif", color: "#999" }}>
                  {reviewComments.length} comentario{reviewComments.length !== 1 ? "s" : ""} en {userProjects.length} proyecto{userProjects.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {reviewComments.length === 0 ? (
                <p className="text-center text-gray-400 font-montserrat py-8">Aún no hay comentarios en tus proyectos.</p>
              ) : reviewComments.map((c) => (
                <div key={c.id} className="nexo-card p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <img src={c.projectThumbnail} alt={c.projectTitle} className="w-8 h-8 rounded-lg object-cover" />
                      <h4 className="font-semibold text-sm" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                        {c.projectTitle}
                      </h4>
                    </div>
                    <span className="text-xs" style={{ fontFamily: "'Montserrat', sans-serif", color: "#999" }}>
                      {new Date(c.createdAt).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <div className="flex gap-3 text-sm mb-3">
                    <span title="Inspira">💡 {c.reactions.inspires}</span>
                    <span title="Aprendí algo">📚 {c.reactions.learned}</span>
                    <span title="Nivel profesional">⭐ {c.reactions.professional}</span>
                    <span title="En progreso">🔧 {c.reactions.inProgress}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <img src={c.authorAvatar || "/images/avatar_default.jpg"} alt={c.authorName} className="w-6 h-6 rounded-full object-cover" />
                    <span className="text-xs font-semibold" style={{ fontFamily: "'Montserrat', sans-serif", color: "#555" }}>{c.authorName}</span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ fontFamily: "'Montserrat', sans-serif", color: "#666" }}>
                    "{c.text}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "resenas" && (
          <div className="max-w-2xl space-y-4">
            {reviewComments.length === 0 ? (
              <div className="nexo-card p-12 text-center">
                <p className="text-gray-400 font-montserrat">Aún no hay comentarios en tus proyectos.</p>
              </div>
            ) : reviewComments.map((c) => (
              <div key={c.id} className="nexo-card p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <img src={c.projectThumbnail} alt={c.projectTitle} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-sm" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                        {c.projectTitle}
                      </h4>
                      <div className="flex gap-3 text-xs mt-1" style={{ color: "#888" }}>
                        <span title="Inspira">💡 {c.reactions.inspires}</span>
                        <span title="Aprendí algo">📚 {c.reactions.learned}</span>
                        <span title="Nivel profesional">⭐ {c.reactions.professional}</span>
                        <span title="En progreso">🔧 {c.reactions.inProgress}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs flex-shrink-0 ml-4" style={{ fontFamily: "'Montserrat', sans-serif", color: "#999" }}>
                    {new Date(c.createdAt).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <img src={c.authorAvatar || "/images/avatar_default.jpg"} alt={c.authorName} className="w-6 h-6 rounded-full object-cover" />
                  <span className="text-xs font-semibold" style={{ fontFamily: "'Montserrat', sans-serif", color: "#555" }}>{c.authorName}</span>
                </div>
                <p className="text-sm leading-relaxed" style={{ fontFamily: "'Montserrat', sans-serif", color: "#666" }}>
                  "{c.text}"
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "insights" && (
          <div>
            <div className="flex items-center gap-4 mb-8">
              <div>
                <h3 className="text-2xl" style={{ fontFamily: "'Sono', sans-serif", fontWeight: 700 }}>Logros</h3>
                <p className="text-sm mt-1" style={{ fontFamily: "'Montserrat', sans-serif", color: "#999" }}>
                  {achievements.filter(a => a.unlocked).length} de {achievements.length} desbloqueados
                </p>
              </div>
              <div className="ml-auto flex gap-3">
                {(["fragmento","rastro","memoria","legado"] as const).map(r => (
                  <span key={r} style={{ padding:"3px 10px", borderRadius:"100px", fontFamily:"'Montserrat',sans-serif", fontSize:"11px", fontWeight:600, background: RARITY_COLORS[r].bg, color: RARITY_COLORS[r].color, border:`1px solid ${RARITY_COLORS[r].border}` }}>{r}</span>
                ))}
              </div>
            </div>

            {/* Por categoría */}
            {(["creacion","conexion","comunidad","memoria","maestria"] as const).map(cat => {
              const catAchievements = achievements.filter(a => a.category === cat);
              if (catAchievements.length === 0) return null;
              return (
                <div key={cat} className="mb-8">
                  <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"11px", fontWeight:700, color:"#aaa", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"12px" }}>
                    {CATEGORY_LABELS[cat]}
                  </p>
                  <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {catAchievements.map(a => {
                      const rc = RARITY_COLORS[a.rarity];
                      return (
                        <div
                          key={a.id}
                          className="nexo-card p-5 relative overflow-hidden"
                          style={{
                            opacity: a.unlocked ? 1 : 0.45,
                            border: a.unlocked ? `1.5px solid ${rc.border}` : "1px solid rgba(0,0,0,0.07)",
                            background: a.unlocked ? rc.bg : "rgba(0,0,0,0.02)",
                            filter: a.unlocked ? "none" : "grayscale(1)",
                            transition: "all 0.3s",
                          }}
                        >
                          {/* Rarity badge */}
                          <span style={{ position:"absolute", top:"10px", right:"10px", padding:"2px 7px", borderRadius:"100px", fontFamily:"'Montserrat',sans-serif", fontSize:"9px", fontWeight:700, color: rc.color, background: rc.bg, border:`1px solid ${rc.border}`, textTransform:"uppercase", letterSpacing:"0.06em" }}>
                            {a.rarity}
                          </span>

                          <div style={{ fontSize:"32px", marginBottom:"10px" }}>{a.icon}</div>

                          <h4 style={{ fontFamily:"'Sono',sans-serif", fontSize:"15px", fontWeight:700, color: a.unlocked ? "#0a0a0a" : "#aaa", marginBottom:"4px" }}>
                            {a.title}
                          </h4>
                          <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"11px", color: a.unlocked ? "#555" : "#bbb", marginBottom:"8px", lineHeight:1.5 }}>
                            {a.description}
                          </p>

                          {/* Barra de progreso */}
                          {!a.unlocked && a.progress && (
                            <div style={{ marginBottom:"8px" }}>
                              <div style={{ height:"3px", borderRadius:"2px", background:"rgba(0,0,0,0.08)", overflow:"hidden" }}>
                                <div style={{ height:"100%", borderRadius:"2px", background:"linear-gradient(90deg,#004FCD,#3b7de8)", width:`${(a.progress.current/a.progress.total)*100}%`, transition:"width 0.5s" }} />
                              </div>
                              <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"10px", color:"#bbb", marginTop:"3px" }}>
                                {a.progress.current} / {a.progress.total}
                              </p>
                            </div>
                          )}

                          {/* Lore de Nómada */}
                          {a.unlocked && (
                            <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"11px", color: rc.color, fontStyle:"italic", lineHeight:1.5, borderTop:`1px solid ${rc.border}`, paddingTop:"8px", marginTop:"4px" }}>
                              "{a.lore}"
                            </p>
                          )}

                          {a.unlocked && a.unlockedAt && (
                            <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"10px", color:"#aaa", marginTop:"6px" }}>
                              {new Date(a.unlockedAt).toLocaleDateString("es-CO")}
                            </p>
                          )}

                          {!a.unlocked && (
                            <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"10px", color:"#ccc", marginTop:"4px" }}>🔒 Bloqueado</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <NomadaGuia escena="perfil" onAccion={() => window.location.href = '/upload'} />
    </div>
  );
}