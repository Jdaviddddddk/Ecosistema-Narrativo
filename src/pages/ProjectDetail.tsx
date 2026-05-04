import { useParams, Link } from "react-router";
import { projects } from "@/config/projects";
import type { Project } from "@/config/projects";
import { siteConfig } from "@/config";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const project = projects.find((p: Project) => p.id === id);

  if (!project) {
    return (
      <div style={{ padding: "80px 32px", textAlign: "center" }}>
        <h1 style={{ fontFamily: "'Times New Roman', serif", fontSize: "32px" }}>
          Proyecto no encontrado
        </h1>
        <Link to="/projects" style={{ color: "#000", textDecoration: "underline" }}>
          Volver a la galería
        </Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff" }}>
      {/* Sticky Header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          padding: "16px 32px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Link
            to="/"
            style={{
              fontFamily: "'Times New Roman', serif",
              fontSize: "18px",
              color: "#000",
              textDecoration: "none",
              letterSpacing: "0.05em",
            }}
          >
            {siteConfig.brandName}
          </Link>
          <Link
            to="/projects"
            style={{
              fontFamily: "system-ui, sans-serif",
              fontSize: "14px",
              color: "rgba(0,0,0,0.6)",
              textDecoration: "none",
            }}
          >
            ← Volver a proyectos
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 32px" }}>
        {/* HEADER CARD */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "48px",
            marginBottom: "64px",
            alignItems: "start",
          }}
        >
          {/* Left: Thumbnail */}
          <div style={{ borderRadius: "8px", overflow: "hidden" }}>
            <img
              src={project.thumbnail}
              alt={project.title}
              style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover" }}
            />
          </div>

          {/* Right: Meta info */}
          <div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
              <span
                style={{
                  fontFamily: "system-ui, sans-serif",
                  fontSize: "11px",
                  padding: "6px 14px",
                  borderRadius: "100px",
                  background: "rgba(0,0,0,0.05)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {project.area}
              </span>
              <span
                style={{
                  fontFamily: "system-ui, sans-serif",
                  fontSize: "11px",
                  padding: "6px 14px",
                  borderRadius: "100px",
                  background: "rgba(0,0,0,0.05)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {project.semester} semestre
              </span>
              <span
                style={{
                  fontFamily: "system-ui, sans-serif",
                  fontSize: "11px",
                  padding: "6px 14px",
                  borderRadius: "100px",
                  background:
                    project.status === "Publicado"
                      ? "#dcfce7"
                      : project.status === "En revisión"
                      ? "#fef3c7"
                      : "#f3f4f6",
                  color:
                    project.status === "Publicado"
                      ? "#166534"
                      : project.status === "En revisión"
                      ? "#92400e"
                      : "#374151",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontWeight: 500,
                }}
              >
                {project.status}
              </span>
              <span
                style={{
                  fontFamily: "system-ui, sans-serif",
                  fontSize: "11px",
                  padding: "6px 14px",
                  borderRadius: "100px",
                  background: "rgba(0,0,0,0.05)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {project.visibility}
              </span>
            </div>

            <h1
              style={{
                fontFamily: "'Times New Roman', serif",
                fontSize: "clamp(28px, 4vw, 48px)",
                color: "#000",
                marginBottom: "12px",
                lineHeight: 1.1,
              }}
            >
              {project.title}
            </h1>

            <p
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: "16px",
                color: "rgba(0,0,0,0.6)",
                marginBottom: "32px",
              }}
            >
              por <strong style={{ color: "#000" }}>{project.author}</strong>
            </p>

            {/* Reactions */}
            <div style={{ display: "flex", gap: "20px", marginBottom: "32px" }}>
              {[
                { emoji: "💡", count: project.reactions.inspires, label: "Me inspira" },
                { emoji: "📚", count: project.reactions.learned, label: "Aprendí de esto" },
                { emoji: "⭐", count: project.reactions.professional, label: "Profesional" },
                { emoji: "🚧", count: project.reactions.inProgress, label: "En proceso" },
              ].map((reaction) => (
                <button
                  key={reaction.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 16px",
                    borderRadius: "100px",
                    border: "1px solid rgba(0,0,0,0.1)",
                    background: "transparent",
                    cursor: "pointer",
                    fontFamily: "system-ui, sans-serif",
                    fontSize: "14px",
                    transition: "background 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(0,0,0,0.03)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span>{reaction.emoji}</span>
                  <span style={{ fontWeight: 500 }}>{reaction.count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* HISTORIA DE ORIGEN */}
        <div
          style={{
            padding: "40px",
            background: "rgba(0,0,0,0.02)",
            borderRadius: "12px",
            marginBottom: "48px",
          }}
        >
          <h2
            style={{
              fontFamily: "'Times New Roman', serif",
              fontSize: "14px",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              color: "rgba(0,0,0,0.5)",
              marginBottom: "16px",
            }}
          >
            Historia de origen
          </h2>
          <p
            style={{
              fontFamily: "system-ui, sans-serif",
              fontSize: "18px",
              lineHeight: 1.7,
              color: "#000",
              fontStyle: "italic",
            }}
          >
            "{project.originStory}"
          </p>
        </div>

        {/* GALERÍA + PROCESO */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "48px",
            marginBottom: "48px",
          }}
        >
          {/* Gallery */}
          <div>
            <h2
              style={{
                fontFamily: "'Times New Roman', serif",
                fontSize: "14px",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: "rgba(0,0,0,0.5)",
                marginBottom: "24px",
              }}
            >
              Galería
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {project.images.map((img, i) => (
                <div
                  key={i}
                  style={{
                    borderRadius: "8px",
                    overflow: "hidden",
                    aspectRatio: i === 0 ? "16/10" : "4/3",
                    gridColumn: i === 0 ? "1 / -1" : "auto",
                  }}
                >
                  <img
                    src={img}
                    alt={`${project.title} - ${i + 1}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Process */}
          <div>
            <h2
              style={{
                fontFamily: "'Times New Roman', serif",
                fontSize: "14px",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: "rgba(0,0,0,0.5)",
                marginBottom: "24px",
              }}
            >
              Proceso creativo
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {project.process.map((step, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: "16px",
                    padding: "20px 0",
                    borderBottom: "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "#000",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "system-ui, sans-serif",
                      fontSize: "13px",
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </div>
                  <p
                    style={{
                      fontFamily: "system-ui, sans-serif",
                      fontSize: "15px",
                      color: "#000",
                      lineHeight: 1.5,
                      paddingTop: "4px",
                    }}
                  >
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* HERRAMIENTAS Y METADATOS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "24px",
            marginBottom: "48px",
          }}
        >
          <div
            style={{
              padding: "32px",
              borderRadius: "8px",
              border: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <h3
              style={{
                fontFamily: "'Times New Roman', serif",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: "rgba(0,0,0,0.5)",
                marginBottom: "12px",
              }}
            >
              Herramientas
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {project.tools.map((tool) => (
                <span
                  key={tool}
                  style={{
                    fontFamily: "system-ui, sans-serif",
                    fontSize: "13px",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    background: "rgba(0,0,0,0.05)",
                  }}
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>

          <div
            style={{
              padding: "32px",
              borderRadius: "8px",
              border: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <h3
              style={{
                fontFamily: "'Times New Roman', serif",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: "rgba(0,0,0,0.5)",
                marginBottom: "12px",
              }}
            >
              Materia
            </h3>
            <p style={{ fontFamily: "system-ui, sans-serif", fontSize: "15px", color: "#000" }}>
              {project.subject}
            </p>
          </div>

          <div
            style={{
              padding: "32px",
              borderRadius: "8px",
              border: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <h3
              style={{
                fontFamily: "'Times New Roman', serif",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: "rgba(0,0,0,0.5)",
                marginBottom: "12px",
              }}
            >
              Formato
            </h3>
            <p style={{ fontFamily: "system-ui, sans-serif", fontSize: "15px", color: "#000" }}>
              {project.format}
            </p>
          </div>
        </div>

        {/* APRENDIZAJES */}
        <div
          style={{
            padding: "40px",
            background: "rgba(0,0,0,0.02)",
            borderRadius: "12px",
            marginBottom: "48px",
          }}
        >
          <h2
            style={{
              fontFamily: "'Times New Roman', serif",
              fontSize: "14px",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              color: "rgba(0,0,0,0.5)",
              marginBottom: "16px",
            }}
          >
            Aprendizajes clave
          </h2>
          <p
            style={{
              fontFamily: "system-ui, sans-serif",
              fontSize: "18px",
              lineHeight: 1.7,
              color: "#000",
            }}
          >
            "{project.learnings}"
          </p>
        </div>

        {/* LINKS */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginBottom: "48px",
          }}
        >
          <a
            href={`https://${project.fullLink}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "system-ui, sans-serif",
              fontSize: "14px",
              padding: "14px 28px",
              borderRadius: "100px",
              background: "#000",
              color: "#fff",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              transition: "opacity 0.3s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Ver proyecto completo →
          </a>

          {project.prototypeLink && (
            <a
              href={project.prototypeLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: "14px",
                padding: "14px 28px",
                borderRadius: "100px",
                border: "1px solid rgba(0,0,0,0.2)",
                color: "#000",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                transition: "background 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(0,0,0,0.03)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              Prototipo interactivo ↗
            </a>
          )}
        </div>

        {/* RECONOCIMIENTOS */}
        {project.recognitions && (
          <div
            style={{
              padding: "24px 32px",
              borderRadius: "8px",
              border: "1px solid rgba(0,0,0,0.08)",
              marginBottom: "48px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span style={{ fontSize: "24px" }}>🏆</span>
            <p style={{ fontFamily: "system-ui, sans-serif", fontSize: "15px", color: "#000" }}>
              {project.recognitions}
            </p>
          </div>
        )}

        {/* COLECCIONES */}
        <div style={{ marginBottom: "48px" }}>
          <h2
            style={{
              fontFamily: "'Times New Roman', serif",
              fontSize: "14px",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              color: "rgba(0,0,0,0.5)",
              marginBottom: "16px",
            }}
          >
            Colecciones
          </h2>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {project.collections.map((collection) => (
              <span
                key={collection}
                style={{
                  fontFamily: "system-ui, sans-serif",
                  fontSize: "13px",
                  padding: "10px 20px",
                  borderRadius: "100px",
                  border: "1px solid rgba(0,0,0,0.15)",
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                {collection}
              </span>
            ))}
          </div>
        </div>

        {/* PROYECTOS RELACIONADOS */}
        <div style={{ marginBottom: "48px" }}>
          <h2
            style={{
              fontFamily: "'Times New Roman', serif",
              fontSize: "14px",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              color: "rgba(0,0,0,0.5)",
              marginBottom: "24px",
            }}
          >
            Proyectos relacionados
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
            {project.relatedProjects.map((relatedId) => {
              const related = projects.find((p: Project) => p.id === relatedId);
              if (!related) return null;
              return (
                <Link
                  key={relatedId}
                  to={`/project/${relatedId}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div
                    style={{
                      borderRadius: "8px",
                      overflow: "hidden",
                      border: "1px solid rgba(0,0,0,0.08)",
                      transition: "transform 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <img
                      src={related.thumbnail}
                      alt={related.title}
                      style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover" }}
                    />
                    <div style={{ padding: "16px" }}>
                      <p
                        style={{
                          fontFamily: "system-ui, sans-serif",
                          fontSize: "11px",
                          color: "rgba(0,0,0,0.5)",
                          textTransform: "uppercase",
                          marginBottom: "4px",
                        }}
                      >
                        {related.area}
                      </p>
                      <h4
                        style={{
                          fontFamily: "'Times New Roman', serif",
                          fontSize: "16px",
                          color: "#000",
                        }}
                      >
                        {related.title}
                      </h4>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}