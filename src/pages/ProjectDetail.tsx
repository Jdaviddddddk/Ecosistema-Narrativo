import { useParams, Link } from "react-router";
import { useState, useEffect, useCallback } from "react";
import { projectsAPI } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import NomadaGuia from "@/components/NomadaGuia";
import ComentariosSeccion from "@/components/ComentariosSeccion";
import ShareButton from "@/components/ShareButton";
import NomadaLoader from "@/components/NomadaLoader";

type ReactionType = "inspires" | "learned" | "professional" | "inProgress";

function getUserReactions(projectId: string): Set<ReactionType> {
  try {
    const raw = localStorage.getItem(`reactions_${projectId}`);
    return new Set((raw ? JSON.parse(raw) : []) as ReactionType[]);
  } catch { return new Set(); }
}

function saveUserReactions(projectId: string, reactions: Set<ReactionType>) {
  localStorage.setItem(`reactions_${projectId}`, JSON.stringify([...reactions]));
}


export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { isCommunityMember } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userReactions, setUserReactions] = useState<Set<ReactionType>>(new Set());
  const [reactingTo, setReactingTo] = useState<ReactionType | null>(null);

  useEffect(() => {
    if (!id) return;
    projectsAPI.get(id)
      .then(p => { setProject(p); setUserReactions(getUserReactions(id)); })
      .catch(() => setProject(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleReact = useCallback(async (type: ReactionType) => {
    if (!id || !project || reactingTo) return;
    setReactingTo(type);
    try {
      const alreadyReacted = userReactions.has(type);
      await projectsAPI.react(id, type);
      const newReactions = new Set(userReactions);
      if (alreadyReacted) newReactions.delete(type); else newReactions.add(type);
      setUserReactions(newReactions);
      saveUserReactions(id, newReactions);
      setProject((prev: any) => ({
        ...prev,
        reactions: { ...prev.reactions, [type]: (prev.reactions?.[type] || 0) + (alreadyReacted ? -1 : 1) },
      }));
    } catch { /* silencioso */ }
    finally { setReactingTo(null); }
  }, [id, project, userReactions, reactingTo]);

  if (loading) return <NomadaLoader mensaje="Cargando proyecto..." />;

  if (!project) return (
    <div style={{ padding: "80px 32px", textAlign: "center" }}>
      <h1 style={{ fontFamily: "'Sono', sans-serif", fontSize: "32px", marginBottom: "16px" }}>Proyecto no encontrado</h1>
      <Link to="/projects" style={{ color: "#004FCD", fontFamily: "'Montserrat', sans-serif" }}>← Volver a la galería</Link>
    </div>
  );

  // Gate de comunidad
  if (project.visibility === "Solo comunidad" && !isCommunityMember) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fafafa" }}>
        <div style={{ maxWidth: "480px", textAlign: "center", padding: "48px 32px", background: "#fff", borderRadius: "20px", border: "1px solid rgba(0,0,0,0.08)" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔒</div>
          <h2 style={{ fontFamily: "'Sono', sans-serif", fontSize: "24px", color: "#0a0a0a", marginBottom: "12px" }}>Contenido exclusivo</h2>
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "14px", color: "#777", lineHeight: 1.7, marginBottom: "24px" }}>
            Este proyecto solo puede ser visto por miembros de la comunidad universitaria con correo <strong>@universidadmayor.edu.co</strong>.
          </p>
          <Link to="/projects" style={{ display: "inline-block", padding: "12px 28px", background: "#004FCD", color: "white", borderRadius: "100px", textDecoration: "none", fontFamily: "'Montserrat', sans-serif", fontSize: "13px", fontWeight: 600 }}>
            ← Ver proyectos públicos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff" }}>
      {/* Barra superior */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px 32px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link to="/projects" style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.5)", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
          <img src="/images/icons/icon-volver.png" alt="volver" style={{ width: "16px", height: "16px", imageRendering: "pixelated", opacity: 0.5 }} />
          Volver a proyectos
        </Link>
        <ShareButton url={window.location.href} label={project.title} />
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 32px 80px" }}>

        {/* HEADER */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", marginBottom: "64px", alignItems: "start" }}>
          {/* Thumbnail */}
          <div style={{ borderRadius: "12px", overflow: "hidden", background: "#f3f4f6" }}>
            {project.thumbnail
              ? <img src={project.thumbnail} alt={project.title} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover" }} />
              : <div style={{ width: "100%", aspectRatio: "4/3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "64px" }}>🖼</div>
            }
          </div>

          {/* Meta */}
          <div>
            {/* Tags */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
              {[project.area, project.semester && `${project.semester} sem.`].map(tag => tag && (
                <span key={tag} style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", padding: "6px 14px", borderRadius: "100px", background: "rgba(0,0,0,0.05)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {tag}
                </span>
              ))}
              {project.productionStatus && (
                <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", padding: "6px 14px", borderRadius: "100px", background: "#eff6ff", color: "#1d4ed8", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 500 }}>
                  {project.productionStatus}
                </span>
              )}
              <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", padding: "6px 14px", borderRadius: "100px", background: project.status === "Publicado" ? "#dcfce7" : project.status === "En revisión" ? "#fef3c7" : "#f3f4f6", color: project.status === "Publicado" ? "#166534" : project.status === "En revisión" ? "#92400e" : "#374151", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 500 }}>
                {project.status}
              </span>
            </div>

            <h1 style={{ fontFamily: "'Sono', sans-serif", fontSize: "clamp(28px, 4vw, 48px)", color: "#000", marginBottom: "16px", lineHeight: 1.1 }}>
              {project.title}
            </h1>

            {/* Autor — con link al perfil */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "32px" }}>
              <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "15px", color: "rgba(0,0,0,0.6)" }}>
                por{" "}
                {project.authorId ? (
                  <Link to={`/profile/${project.authorId}`} style={{ color: "#004FCD", fontWeight: 700, textDecoration: "none" }}>
                    {project.author}
                  </Link>
                ) : (
                  <strong style={{ color: "#000" }}>{project.author}</strong>
                )}
                {project.subject && ` · ${project.subject}`}
              </p>
            </div>

            {/* Reactions + Share */}
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "24px", alignItems: "center" }}>
              {([
                { type: "inspires" as ReactionType, icon: "/images/icons/icon-inspira.png", label: "Me inspira" },
                { type: "learned" as ReactionType, icon: "/images/icons/icon-aprendi.png", label: "Aprendí" },
                { type: "professional" as ReactionType, icon: "/images/icons/icon-profesional.png", label: "Profesional" },
                { type: "inProgress" as ReactionType, icon: "/images/icons/icon-proceso.png", label: "En proceso" },
              ]).map(r => {
                const reacted = userReactions.has(r.type);
                return (
                  <button
                    key={r.type}
                    onClick={() => handleReact(r.type)}
                    disabled={reactingTo !== null}
                    title={reacted ? `Quitar: ${r.label}` : r.label}
                    style={{
                      display: "flex", alignItems: "center", gap: "6px",
                      padding: "8px 16px", borderRadius: "100px",
                      border: reacted ? "1.5px solid #004FCD" : "1px solid rgba(0,0,0,0.1)",
                      background: reacted ? "rgba(0,79,205,0.07)" : "transparent",
                      cursor: reactingTo ? "wait" : "pointer",
                      fontFamily: "'Montserrat', sans-serif", fontSize: "14px",
                      transition: "all 0.15s",
                    }}
                  >
                    <img src={r.icon} alt={r.label} style={{ width: "20px", height: "20px", imageRendering: "pixelated" }} />
                    <span style={{ fontWeight: reacted ? 700 : 500, color: reacted ? "#004FCD" : "inherit" }}>
                      {project.reactions?.[r.type] || 0}
                    </span>
                  </button>
                );
              })}
              {/* Separador + compartir */}
              <div style={{ width: "1px", height: "32px", background: "rgba(0,0,0,0.1)", margin: "0 4px" }} />
              <ShareButton url={window.location.href} label={project.title} style={{ fontSize: "13px", padding: "8px 18px" }} />
            </div>
          </div>
        </div>

        {/* HISTORIA DE ORIGEN */}
        {project.originStory && (
          <div style={{ padding: "40px", background: "rgba(0,0,0,0.02)", borderRadius: "12px", marginBottom: "48px" }}>
            <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(0,0,0,0.5)", marginBottom: "16px" }}>Historia de origen</h2>
            <p style={{ fontFamily: "system-ui, sans-serif", fontSize: "18px", lineHeight: 1.7, color: "#000", fontStyle: "italic" }}>"{project.originStory}"</p>
          </div>
        )}

        {/* GALERÍA + PROCESO */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "48px", marginBottom: "48px" }}>
          {project.images?.length > 0 && (
            <div>
              <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(0,0,0,0.5)", marginBottom: "24px" }}>Galería</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {project.images.map((img: string, i: number) => (
                  <div key={i} style={{ borderRadius: "8px", overflow: "hidden", aspectRatio: i === 0 ? "16/10" : "4/3", gridColumn: i === 0 ? "1 / -1" : "auto" }}>
                    <img src={img} alt={`${project.title} ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {project.process?.length > 0 && (
            <div>
              <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(0,0,0,0.5)", marginBottom: "24px" }}>Proceso creativo</h2>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {project.process.map((step: string, i: number) => (
                  <div key={i} style={{ display: "flex", gap: "16px", padding: "20px 0", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#000", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui", fontSize: "13px", fontWeight: 600, flexShrink: 0 }}>{i + 1}</div>
                    <p style={{ fontFamily: "system-ui", fontSize: "15px", color: "#000", lineHeight: 1.5, paddingTop: "4px" }}>{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* METADATA */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px", marginBottom: "48px" }}>
          {project.tools?.length > 0 && (
            <div style={{ padding: "32px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.08)" }}>
              <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(0,0,0,0.5)", marginBottom: "12px" }}>Herramientas</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {project.tools.map((tool: string) => (
                  <span key={tool} style={{ fontFamily: "system-ui", fontSize: "13px", padding: "6px 12px", borderRadius: "6px", background: "rgba(0,0,0,0.05)" }}>{tool}</span>
                ))}
              </div>
            </div>
          )}
          {project.subject && (
            <div style={{ padding: "32px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.08)" }}>
              <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(0,0,0,0.5)", marginBottom: "12px" }}>Materia</h3>
              <p style={{ fontFamily: "system-ui", fontSize: "15px", color: "#000" }}>{project.subject}</p>
            </div>
          )}
          {project.format && (
            <div style={{ padding: "32px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.08)" }}>
              <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(0,0,0,0.5)", marginBottom: "12px" }}>Formato</h3>
              <p style={{ fontFamily: "system-ui", fontSize: "15px", color: "#000" }}>{project.format}</p>
            </div>
          )}
        </div>

        {/* APRENDIZAJES */}
        {project.learnings && (
          <div style={{ padding: "40px", background: "rgba(0,0,0,0.02)", borderRadius: "12px", marginBottom: "48px" }}>
            <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(0,0,0,0.5)", marginBottom: "16px" }}>Aprendizajes clave</h2>
            <p style={{ fontFamily: "system-ui", fontSize: "18px", lineHeight: 1.7, color: "#000" }}>"{project.learnings}"</p>
          </div>
        )}

        {/* LINKS */}
        {(project.fullLink || project.prototypeLink) && (
          <div style={{ display: "flex", gap: "16px", marginBottom: "48px", flexWrap: "wrap" }}>
            {project.prototypeLink && (
              <a href={project.prototypeLink.startsWith('http') ? project.prototypeLink : `https://${project.prototypeLink}`} target="_blank" rel="noopener noreferrer"
                style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "14px", padding: "14px 28px", borderRadius: "100px", background: "#000", color: "#fff", textDecoration: "none" }}>
                Ver prototipo / previsualización →
              </a>
            )}
            {project.fullLink && (
              <a href={project.fullLink.startsWith('http') ? project.fullLink : `https://${project.fullLink}`} target="_blank" rel="noopener noreferrer"
                style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "14px", padding: "14px 28px", borderRadius: "100px", border: "1px solid rgba(0,0,0,0.2)", color: "#000", textDecoration: "none" }}>
                Enlace adicional ↗
              </a>
            )}
          </div>
        )}

        {/* PDF */}
        {project.pdfFile && (
          <div style={{ marginBottom: "48px" }}>
            <a href={`${project.pdfFile.startsWith('/') ? '' : ''}${project.pdfFile}`} target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 20px", borderRadius: "12px", border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.04)", textDecoration: "none", fontFamily: "'Montserrat', sans-serif", fontSize: "13px", color: "#dc2626" }}>
              📄 Descargar documento PDF
            </a>
          </div>
        )}

        {/* COLECCIONES */}
        {project.collections?.length > 0 && (
          <div style={{ marginBottom: "48px" }}>
            <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(0,0,0,0.5)", marginBottom: "16px" }}>Colecciones</h2>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {project.collections.map((c: string) => (
                <span key={c} style={{ fontFamily: "system-ui", fontSize: "13px", padding: "10px 20px", borderRadius: "100px", border: "1px solid rgba(0,0,0,0.15)" }}>{c}</span>
              ))}
            </div>
          </div>
        )}

        {/* COMENTARIOS */}
        <ComentariosSeccion projectId={id!} />

      </div>

      <NomadaGuia escena="interaccion" />
    </div>
  );
}
