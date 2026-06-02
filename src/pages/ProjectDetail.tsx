import { useParams, Link } from "react-router";
import { useState, useEffect } from "react";
import { projectsAPI } from "@/lib/api";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    projectsAPI.get(id)
      .then(setProject)
      .catch(() => setProject(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <div style={{ width: "40px", height: "40px", border: "3px solid #004FCD", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ padding: "80px 32px", textAlign: "center" }}>
        <h1 style={{ fontFamily: "'Sono', sans-serif", fontSize: "32px", marginBottom: "16px" }}>
          Proyecto no encontrado
        </h1>
        <Link to="/projects" style={{ color: "#004FCD", textDecoration: "underline", fontFamily: "'Montserrat', sans-serif" }}>
          Volver a la galería
        </Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff" }}>
      {/* Back link */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px 32px 0" }}>
        <Link to="/projects" style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.5)", textDecoration: "none" }}>
          ← Volver a proyectos
        </Link>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 32px 80px" }}>

        {/* HEADER */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", marginBottom: "64px", alignItems: "start" }}>
          {/* Thumbnail */}
          <div style={{ borderRadius: "8px", overflow: "hidden", background: "#f3f4f6" }}>
            {project.thumbnail ? (
              <img src={project.thumbnail} alt={project.title} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover" }} />
            ) : (
              <div style={{ width: "100%", aspectRatio: "4/3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "64px" }}>🖼</div>
            )}
          </div>

          {/* Meta */}
          <div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
              {[project.area, `${project.semester} sem.`].map(tag => tag && (
                <span key={tag} style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", padding: "6px 14px", borderRadius: "100px", background: "rgba(0,0,0,0.05)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {tag}
                </span>
              ))}
              <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", padding: "6px 14px", borderRadius: "100px", background: project.status === "Publicado" ? "#dcfce7" : project.status === "En revisión" ? "#fef3c7" : "#f3f4f6", color: project.status === "Publicado" ? "#166534" : project.status === "En revisión" ? "#92400e" : "#374151", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 500 }}>
                {project.status}
              </span>
            </div>

            <h1 style={{ fontFamily: "'Sono', sans-serif", fontSize: "clamp(28px, 4vw, 48px)", color: "#000", marginBottom: "16px", lineHeight: 1.1 }}>
              {project.title}
            </h1>

            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "15px", color: "rgba(0,0,0,0.6)", marginBottom: "32px" }}>
              por <strong style={{ color: "#000" }}>{project.author}</strong> · {project.subject}
            </p>

            {/* Reactions */}
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {[
                { emoji: "💡", count: project.reactions?.inspires || 0, label: "Me inspira" },
                { emoji: "📚", count: project.reactions?.learned || 0, label: "Aprendí" },
                { emoji: "⭐", count: project.reactions?.professional || 0, label: "Profesional" },
                { emoji: "🚧", count: project.reactions?.inProgress || 0, label: "En proceso" },
              ].map((r) => (
                <button key={r.label} title={r.label} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "100px", border: "1px solid rgba(0,0,0,0.1)", background: "transparent", cursor: "pointer", fontFamily: "'Montserrat', sans-serif", fontSize: "14px" }}>
                  <span>{r.emoji}</span>
                  <span style={{ fontWeight: 500 }}>{r.count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* HISTORIA DE ORIGEN */}
        {project.originStory && (
          <div style={{ padding: "40px", background: "rgba(0,0,0,0.02)", borderRadius: "12px", marginBottom: "48px" }}>
            <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(0,0,0,0.5)", marginBottom: "16px" }}>
              Historia de origen
            </h2>
            <p style={{ fontFamily: "system-ui, sans-serif", fontSize: "18px", lineHeight: 1.7, color: "#000", fontStyle: "italic" }}>
              "{project.originStory}"
            </p>
          </div>
        )}

        {/* GALERÍA + PROCESO */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "48px", marginBottom: "48px" }}>
          {/* Gallery */}
          {project.images?.length > 0 && (
            <div>
              <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(0,0,0,0.5)", marginBottom: "24px" }}>
                Galería
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {project.images.map((img: string, i: number) => (
                  <div key={i} style={{ borderRadius: "8px", overflow: "hidden", aspectRatio: i === 0 ? "16/10" : "4/3", gridColumn: i === 0 ? "1 / -1" : "auto" }}>
                    <img src={img} alt={`${project.title} ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Process */}
          {project.process?.length > 0 && (
            <div>
              <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(0,0,0,0.5)", marginBottom: "24px" }}>
                Proceso creativo
              </h2>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {project.process.map((step: string, i: number) => (
                  <div key={i} style={{ display: "flex", gap: "16px", padding: "20px 0", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#000", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif", fontSize: "13px", fontWeight: 600, flexShrink: 0 }}>
                      {i + 1}
                    </div>
                    <p style={{ fontFamily: "system-ui, sans-serif", fontSize: "15px", color: "#000", lineHeight: 1.5, paddingTop: "4px" }}>
                      {step}
                    </p>
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
                  <span key={tool} style={{ fontFamily: "system-ui, sans-serif", fontSize: "13px", padding: "6px 12px", borderRadius: "6px", background: "rgba(0,0,0,0.05)" }}>{tool}</span>
                ))}
              </div>
            </div>
          )}
          {project.subject && (
            <div style={{ padding: "32px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.08)" }}>
              <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(0,0,0,0.5)", marginBottom: "12px" }}>Materia</h3>
              <p style={{ fontFamily: "system-ui, sans-serif", fontSize: "15px", color: "#000" }}>{project.subject}</p>
            </div>
          )}
          {project.format && (
            <div style={{ padding: "32px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.08)" }}>
              <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(0,0,0,0.5)", marginBottom: "12px" }}>Formato</h3>
              <p style={{ fontFamily: "system-ui, sans-serif", fontSize: "15px", color: "#000" }}>{project.format}</p>
            </div>
          )}
        </div>

        {/* APRENDIZAJES */}
        {project.learnings && (
          <div style={{ padding: "40px", background: "rgba(0,0,0,0.02)", borderRadius: "12px", marginBottom: "48px" }}>
            <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(0,0,0,0.5)", marginBottom: "16px" }}>
              Aprendizajes clave
            </h2>
            <p style={{ fontFamily: "system-ui, sans-serif", fontSize: "18px", lineHeight: 1.7, color: "#000" }}>
              "{project.learnings}"
            </p>
          </div>
        )}

        {/* LINKS */}
        {(project.fullLink || project.prototypeLink) && (
          <div style={{ display: "flex", gap: "16px", marginBottom: "48px", flexWrap: "wrap" }}>
            {project.fullLink && (
              <a href={project.fullLink.startsWith('http') ? project.fullLink : `https://${project.fullLink}`} target="_blank" rel="noopener noreferrer"
                style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "14px", padding: "14px 28px", borderRadius: "100px", background: "#000", color: "#fff", textDecoration: "none" }}>
                Ver proyecto completo →
              </a>
            )}
            {project.prototypeLink && (
              <a href={project.prototypeLink} target="_blank" rel="noopener noreferrer"
                style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "14px", padding: "14px 28px", borderRadius: "100px", border: "1px solid rgba(0,0,0,0.2)", color: "#000", textDecoration: "none" }}>
                Prototipo interactivo ↗
              </a>
            )}
          </div>
        )}

        {/* COLECCIONES */}
        {project.collections?.length > 0 && (
          <div style={{ marginBottom: "48px" }}>
            <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(0,0,0,0.5)", marginBottom: "16px" }}>
              Colecciones
            </h2>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {project.collections.map((c: string) => (
                <span key={c} style={{ fontFamily: "system-ui, sans-serif", fontSize: "13px", padding: "10px 20px", borderRadius: "100px", border: "1px solid rgba(0,0,0,0.15)" }}>{c}</span>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
