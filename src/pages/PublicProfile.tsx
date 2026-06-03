import { useParams, Link } from "react-router";
import { useState, useEffect } from "react";
import { usersAPI, projectsAPI } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ShareButton from "@/components/ShareButton";
import NomadaLoader from "@/components/NomadaLoader";

export default function PublicProfile() {
  const { id } = useParams<{ id: string }>();
  const { isCommunityMember } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    projectsAPI.list()
      .then(async (allProjects: any[]) => {
        // Filtrar proyectos visibles de este usuario
        const userProjects = allProjects.filter((p: any) => {
          if (p.authorId !== id) return false;
          if (p.visibility === "Privado") return false;
          if (p.visibility === "Solo comunidad" && !isCommunityMember) return false;
          return true;
        });
        setProjects(userProjects);

        // Intentar obtener perfil del backend
        try {
          const userData = await usersAPI.get(id);
          setProfile(userData);
        } catch {
          // Fallback: construir perfil desde datos de los proyectos del usuario
          // Buscar en TODOS los proyectos (aunque no sean visibles) para obtener el nombre
          const anyProject = allProjects.find((p: any) => p.authorId === id);
          if (anyProject) {
            setProfile({
              id,
              name: anyProject.author,
              email: anyProject.authorEmail || "",
              avatar: "",
              bio: "",
              location: "",
              interests: [],
              isCommunityMember: anyProject.authorEmail?.endsWith("@universidadmayor.edu.co") ?? false,
              contact: {},
              joinedAt: anyProject.createdAt,
            });
          } else {
            setProfile(null);
          }
        }
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [id, isCommunityMember]);

  if (loading) return <NomadaLoader mensaje="Cargando perfil..." />;

  if (!profile) return (
    <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
      <p style={{ fontFamily: "'Sono', sans-serif", fontSize: "28px", color: "#1a1a1a" }}>Perfil no encontrado</p>
      <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "13px", color: "#aaa", maxWidth: "340px", textAlign: "center" }}>
        Este usuario aún no ha publicado proyectos o su perfil no está disponible.
      </p>
      <Link to="/projects" style={{ color: "#004FCD", fontFamily: "'Montserrat', sans-serif", fontSize: "14px" }}>← Volver a proyectos</Link>
    </div>
  );

  const profileUrl = `${window.location.origin}/profile/${id}`;
  const totalReactions = projects.reduce((s, p) =>
    s + (p.reactions?.inspires || 0) + (p.reactions?.learned || 0) +
    (p.reactions?.professional || 0) + (p.reactions?.inProgress || 0), 0);

  const initials = profile.name?.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase() || "?";

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa" }}>

      {/* Barra superior */}
      <div style={{ background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.07)", padding: "16px 32px" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link to="/projects" style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.5)", textDecoration: "none" }}>
            ← Proyectos
          </Link>
          <ShareButton url={profileUrl} label={`Perfil de ${profile.name} en NEXO`} />
        </div>
      </div>

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "40px 32px 80px" }}>

        {/* Tarjeta de perfil */}
        <div style={{
          background: "#fff", borderRadius: "20px",
          border: "1px solid rgba(0,0,0,0.07)", padding: "36px",
          marginBottom: "36px", display: "flex", gap: "28px",
          alignItems: "flex-start", flexWrap: "wrap",
        }}>
          {/* Avatar */}
          {profile.avatar ? (
            <img src={profile.avatar} alt={profile.name} style={{ width: "88px", height: "88px", borderRadius: "16px", objectFit: "cover", flexShrink: 0, border: "2px solid rgba(0,79,205,0.1)" }} />
          ) : (
            <div style={{
              width: "88px", height: "88px", borderRadius: "16px", flexShrink: 0,
              background: "linear-gradient(135deg, #004FCD, #3b7de8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Sono', sans-serif", fontSize: "28px", fontWeight: 700, color: "#fff",
            }}>
              {initials}
            </div>
          )}

          {/* Info */}
          <div style={{ flex: 1, minWidth: "200px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "4px" }}>
              <h1 style={{ fontFamily: "'Sono', sans-serif", fontSize: "26px", fontWeight: 700, color: "#0a0a0a", margin: 0 }}>
                {profile.name}
              </h1>
              {profile.isCommunityMember && (
                <span style={{ padding: "3px 10px", borderRadius: "100px", background: "rgba(0,79,205,0.08)", color: "#004FCD", fontFamily: "'Montserrat', sans-serif", fontSize: "11px", fontWeight: 600 }}>
                  🏫 DDM
                </span>
              )}
            </div>

            {profile.location && (
              <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "12px", color: "#aaa", marginBottom: "10px" }}>
                📍 {profile.location}
              </p>
            )}

            {profile.bio && (
              <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "14px", color: "#555", lineHeight: 1.7, maxWidth: "520px", marginBottom: "14px" }}>
                {profile.bio}
              </p>
            )}

            {/* Intereses */}
            {profile.interests?.length > 0 && (
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "14px" }}>
                {profile.interests.map((t: string) => (
                  <span key={t} style={{ padding: "3px 10px", borderRadius: "100px", background: "rgba(0,79,205,0.06)", color: "#004FCD", fontFamily: "'Montserrat', sans-serif", fontSize: "11px" }}>
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* Contacto */}
            {profile.contact && Object.values(profile.contact).some(Boolean) && (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {profile.contact.instagram && (
                  <a href={`https://instagram.com/${profile.contact.instagram.replace("@","")}`} target="_blank" rel="noopener noreferrer" style={linkChipStyle}>
                    📸 {profile.contact.instagram}
                  </a>
                )}
                {profile.contact.behance && (
                  <a href={`https://behance.net/${profile.contact.behance}`} target="_blank" rel="noopener noreferrer" style={linkChipStyle}>
                    🎨 Behance
                  </a>
                )}
                {profile.contact.linkedin && (
                  <a href={`https://linkedin.com/in/${profile.contact.linkedin}`} target="_blank" rel="noopener noreferrer" style={linkChipStyle}>
                    💼 LinkedIn
                  </a>
                )}
                {profile.contact.portfolio && (
                  <a href={profile.contact.portfolio.startsWith("http") ? profile.contact.portfolio : `https://${profile.contact.portfolio}`} target="_blank" rel="noopener noreferrer" style={linkChipStyle}>
                    🌐 Portfolio
                  </a>
                )}
                {profile.contact.email && (
                  <a href={`mailto:${profile.contact.email}`} style={linkChipStyle}>
                    ✉️ {profile.contact.email}
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Stats */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignSelf: "flex-start" }}>
            {[
              { label: "Proyectos", value: projects.length },
              { label: "Reacciones", value: totalReactions },
            ].map(s => (
              <div key={s.label} style={{ textAlign: "center", minWidth: "70px" }}>
                <div style={{ fontFamily: "'Sono', sans-serif", fontSize: "30px", fontWeight: 700, color: "#004FCD", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "4px" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Proyectos */}
        <h2 style={{ fontFamily: "'Sono', sans-serif", fontSize: "20px", fontWeight: 700, color: "#0a0a0a", marginBottom: "20px" }}>
          Proyectos {projects.length > 0 && `(${projects.length})`}
        </h2>

        {projects.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", background: "#fff", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.07)" }}>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "14px", color: "rgba(0,0,0,0.35)" }}>
              Este creador no tiene proyectos públicos aún.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: "16px" }}>
            {projects.map(p => (
              <Link key={p.id} to={`/projects/${p.id}`} style={{ textDecoration: "none" }}>
                <div
                  style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(0,0,0,0.07)", background: "#fff", transition: "transform 0.2s, box-shadow 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
                >
                  <div style={{ aspectRatio: "4/3", overflow: "hidden", background: "#f3f4f6" }}>
                    {p.thumbnail
                      ? <img src={p.thumbnail} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                      : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", color: "rgba(0,0,0,0.15)" }}>🖼</div>
                    }
                  </div>
                  <div style={{ padding: "14px" }}>
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", color: "#004FCD", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{p.area}</span>
                    <h3 style={{ fontFamily: "'Sono', sans-serif", fontSize: "16px", color: "#0a0a0a", margin: "4px 0 8px", lineHeight: 1.25 }}>{p.title}</h3>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", color: "rgba(0,0,0,0.4)" }}>💡 {p.reactions?.inspires || 0}</span>
                      <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", color: "rgba(0,0,0,0.4)" }}>⭐ {p.reactions?.professional || 0}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const linkChipStyle: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: "4px",
  padding: "5px 12px", borderRadius: "100px",
  border: "1px solid rgba(0,0,0,0.1)", textDecoration: "none",
  fontFamily: "'Montserrat', sans-serif", fontSize: "12px", color: "#555",
  transition: "border-color 0.2s",
};
