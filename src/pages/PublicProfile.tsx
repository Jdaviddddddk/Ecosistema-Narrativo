import { useParams, Link } from "react-router";
import { useState, useEffect } from "react";
import { usersAPI, projectsAPI } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

function ShareButton({ url, label }: { url: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: label, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  return (
    <button
      onClick={handleShare}
      style={{
        display: "flex", alignItems: "center", gap: "6px",
        padding: "8px 16px", borderRadius: "100px",
        border: "1px solid rgba(0,0,0,0.12)",
        background: copied ? "rgba(34,197,94,0.07)" : "white",
        borderColor: copied ? "rgba(34,197,94,0.3)" : "rgba(0,0,0,0.12)",
        fontFamily: "'Montserrat', sans-serif", fontSize: "12px",
        color: copied ? "#166534" : "#555",
        cursor: "pointer", transition: "all 0.2s",
      }}
    >
      {copied ? "✓ Copiado" : "🔗 Compartir perfil"}
    </button>
  );
}

export default function PublicProfile() {
  const { id } = useParams<{ id: string }>();
  const { isCommunityMember } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      usersAPI.get(id),
      projectsAPI.list(),
    ]).then(([userData, allProjects]) => {
      setProfile(userData);
      const userProjects = allProjects.filter((p: any) => {
        if (p.authorId !== id) return false;
        if (p.visibility === "Privado") return false;
        if (p.visibility === "Solo comunidad" && !isCommunityMember) return false;
        return true;
      });
      setProjects(userProjects);
    }).catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [id, isCommunityMember]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <div style={{ width: "36px", height: "36px", border: "3px solid #004FCD", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
        <p style={{ fontFamily: "'Sono', sans-serif", fontSize: "28px", color: "#1a1a1a" }}>Perfil no encontrado</p>
        <Link to="/projects" style={{ color: "#004FCD", fontFamily: "'Montserrat', sans-serif", fontSize: "14px" }}>← Volver a proyectos</Link>
      </div>
    );
  }

  const profileUrl = `${window.location.origin}/profile/${id}`;
  const totalReactions = projects.reduce((s, p) =>
    s + (p.reactions?.inspires || 0) + (p.reactions?.learned || 0) + (p.reactions?.professional || 0) + (p.reactions?.inProgress || 0), 0);

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa" }}>

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.07)", padding: "20px 32px" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link to="/projects" style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.5)", textDecoration: "none" }}>← Proyectos</Link>
          <ShareButton url={profileUrl} label={`Perfil de ${profile.name} en NEXO`} />
        </div>
      </div>

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "48px 32px" }}>

        {/* Hero del perfil */}
        <div style={{
          background: "#fff",
          borderRadius: "20px",
          border: "1px solid rgba(0,0,0,0.07)",
          padding: "40px",
          marginBottom: "32px",
          display: "flex", gap: "32px", alignItems: "flex-start",
          flexWrap: "wrap",
        }}>
          <img
            src={profile.avatar || "/images/avatar_default.jpg"}
            alt={profile.name}
            style={{ width: "96px", height: "96px", borderRadius: "16px", objectFit: "cover", flexShrink: 0, border: "3px solid rgba(0,79,205,0.1)" }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px", flexWrap: "wrap" }}>
              <h1 style={{ fontFamily: "'Sono', sans-serif", fontSize: "28px", fontWeight: 700, color: "#0a0a0a", margin: 0 }}>{profile.name}</h1>
              {profile.isCommunityMember && (
                <span style={{ padding: "3px 10px", borderRadius: "100px", background: "rgba(0,79,205,0.08)", color: "#004FCD", fontFamily: "'Montserrat', sans-serif", fontSize: "11px", fontWeight: 600 }}>
                  🏫 Comunidad DDM
                </span>
              )}
            </div>
            {profile.location && (
              <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "13px", color: "#aaa", marginBottom: "12px" }}>📍 {profile.location}</p>
            )}
            {profile.bio && (
              <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "14px", color: "#555", lineHeight: 1.7, maxWidth: "560px", marginBottom: "16px" }}>{profile.bio}</p>
            )}
            {/* Intereses */}
            {profile.interests?.length > 0 && (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
                {profile.interests.map((t: string) => (
                  <span key={t} style={{ padding: "4px 12px", borderRadius: "100px", background: "rgba(0,79,205,0.06)", color: "#004FCD", fontFamily: "'Montserrat', sans-serif", fontSize: "11px", fontWeight: 500 }}>{t}</span>
                ))}
              </div>
            )}
            {/* Contacto */}
            {profile.contact && Object.values(profile.contact).some(Boolean) && (
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {profile.contact.instagram && (
                  <a href={`https://instagram.com/${profile.contact.instagram.replace("@","")}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "5px", padding: "6px 12px", borderRadius: "100px", border: "1px solid rgba(0,0,0,0.1)", textDecoration: "none", fontFamily: "'Montserrat', sans-serif", fontSize: "12px", color: "#555" }}>
                    📸 {profile.contact.instagram}
                  </a>
                )}
                {profile.contact.behance && (
                  <a href={`https://behance.net/${profile.contact.behance}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "5px", padding: "6px 12px", borderRadius: "100px", border: "1px solid rgba(0,0,0,0.1)", textDecoration: "none", fontFamily: "'Montserrat', sans-serif", fontSize: "12px", color: "#555" }}>
                    🎨 Behance
                  </a>
                )}
                {profile.contact.linkedin && (
                  <a href={`https://linkedin.com/in/${profile.contact.linkedin}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "5px", padding: "6px 12px", borderRadius: "100px", border: "1px solid rgba(0,0,0,0.1)", textDecoration: "none", fontFamily: "'Montserrat', sans-serif", fontSize: "12px", color: "#555" }}>
                    💼 LinkedIn
                  </a>
                )}
                {profile.contact.portfolio && (
                  <a href={profile.contact.portfolio} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "5px", padding: "6px 12px", borderRadius: "100px", border: "1px solid rgba(0,0,0,0.1)", textDecoration: "none", fontFamily: "'Montserrat', sans-serif", fontSize: "12px", color: "#555" }}>
                    🌐 Portfolio
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: "24px", alignSelf: "flex-start" }}>
            {[
              { label: "Proyectos", value: projects.length },
              { label: "Reacciones", value: totalReactions },
            ].map(s => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Sono', sans-serif", fontSize: "28px", fontWeight: 700, color: "#004FCD" }}>{s.value}</div>
                <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Proyectos */}
        <h2 style={{ fontFamily: "'Sono', sans-serif", fontSize: "22px", fontWeight: 700, color: "#0a0a0a", marginBottom: "20px" }}>
          Proyectos ({projects.length})
        </h2>

        {projects.length === 0 ? (
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "14px", color: "rgba(0,0,0,0.35)", textAlign: "center", padding: "40px 0" }}>
            Este creador no tiene proyectos públicos aún.
          </p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
            {projects.map(p => (
              <Link key={p.id} to={`/projects/${p.id}`} style={{ textDecoration: "none" }}>
                <div style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(0,0,0,0.07)", background: "#fff", transition: "transform 0.2s, box-shadow 0.2s" }}
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
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", color: "#004FCD", fontWeight: 600, textTransform: "uppercase" }}>{p.area}</span>
                    <h3 style={{ fontFamily: "'Sono', sans-serif", fontSize: "16px", color: "#0a0a0a", margin: "4px 0", lineHeight: 1.25 }}>{p.title}</h3>
                    <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                      <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", color: "rgba(0,0,0,0.4)" }}>💡{p.reactions?.inspires || 0}</span>
                      <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", color: "rgba(0,0,0,0.4)" }}>⭐{p.reactions?.professional || 0}</span>
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
