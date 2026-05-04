import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import VortexGallery from "@/lib/VortexGallery";
import Lenis from "lenis";
import {
  siteConfig,
  navigationConfig,
} from "@/config";
import ImageDetailOverlay from "@/components/ImageDetailOverlay";
import LoginModal from "@/components/LoginModal";
import { useMemo } from "react";
import { projects } from "@/config/projects";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const vortexRef = useRef<VortexGallery | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [isNight, setIsNight] = useState(false);

  const images = useMemo(() => {
    return projects.flatMap((p) =>
      (p.images || []).map((img) => ({
        src: img,
        category: p.area || "General",
        title: p.title || "Sin título",
        description: p.originStory || "",
      }))
    );
  }, []);

  const hasImages = images.length > 0;

  useEffect(() => {
    if (!canvasRef.current || !hasImages) return;

    const vortex = new VortexGallery(
      canvasRef.current,
      images.map((i) => i.src)
    );
    vortexRef.current = vortex;

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      vortex.destroy();
      lenis.destroy();
    };
  }, [hasImages, images]);

  useEffect(() => {
    vortexRef.current?.setPaused(selectedIdx !== null || loginOpen);
  }, [selectedIdx, loginOpen]);

  useEffect(() => {
    const color = isNight ? 0x001233 : 0xffffff;
    vortexRef.current?.setBackgroundColor(color);
  }, [isNight]);

  if (!hasImages) return null;

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const vortex = vortexRef.current;
    const canvas = canvasRef.current;
    if (!vortex || !canvas) return;
    const idx = vortex.pickAtScreen(
      e.clientX,
      e.clientY,
      canvas.getBoundingClientRect()
    );
    if (idx !== null) {
      setSelectedIdx(idx);
    }
  };

  const scrollToContent = () => {
    const element = document.getElementById("como-funciona");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const textColor = isNight ? "#ffffff" : "#000000";
  const mutedColor = isNight ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)";
  const borderColor = isNight ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)";
  const bgColor = isNight ? "#001233" : "#ffffff";
  const cardBg = isNight ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)";

  return (
    <div style={{ background: bgColor, transition: "background 1.2s ease" }}>
      {/* HERO: VORTEX */}
      <section
        style={{
          position: "relative",
          width: "100%",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 1,
            cursor: "pointer",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          {/* Top Navigation Bar */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px 32px",
              pointerEvents: "auto",
            }}
          >
            <Link
              to="/"
              style={{
                fontFamily: "'Times New Roman', serif",
                fontSize: "18px",
                fontWeight: 400,
                color: textColor,
                letterSpacing: "0.05em",
                textDecoration: "none",
                transition: "opacity 0.3s ease, color 1.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.6")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              {siteConfig.brandName}
            </Link>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "24px",
              }}
            >
              <Link
                to="/info"
                style={{
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  fontSize: "13px",
                  fontWeight: 400,
                  color: textColor,
                  textDecoration: "none",
                  letterSpacing: "0.02em",
                  opacity: 0.7,
                  transition: "opacity 0.3s ease, color 1.2s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
              >
                {navigationConfig.infoLinkLabel}
              </Link>

              <Link
                to="/projects"
                style={{
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  fontSize: "13px",
                  fontWeight: 400,
                  color: textColor,
                  textDecoration: "none",
                  letterSpacing: "0.02em",
                  opacity: 0.7,
                  transition: "opacity 0.3s ease, color 1.2s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
              >
                Proyectos
              </Link>

              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => navigate("/yo")}
                    style={{
                      fontFamily: "system-ui, -apple-system, sans-serif",
                      fontSize: "13px",
                      fontWeight: 400,
                      color: textColor,
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      letterSpacing: "0.02em",
                      opacity: 0.7,
                      transition: "opacity 0.3s ease, color 1.2s ease",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
                  >
                    <div style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: isNight ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "11px",
                      fontFamily: "'Times New Roman', serif",
                      color: textColor,
                    }}>
                      {user?.name.charAt(0).toUpperCase()}
                    </div>
                    Yo
                  </button>
                  <button
                    onClick={logout}
                    style={{
                      fontFamily: "system-ui, -apple-system, sans-serif",
                      fontSize: "13px",
                      fontWeight: 400,
                      color: textColor,
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      letterSpacing: "0.02em",
                      opacity: 0.7,
                      transition: "opacity 0.3s ease, color 1.2s ease",
                      padding: 0,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
                  >
                    Salir
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setLoginOpen(true)}
                  style={{
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    fontSize: "13px",
                    fontWeight: 400,
                    color: textColor,
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    letterSpacing: "0.02em",
                    opacity: 0.7,
                    transition: "opacity 0.3s ease, color 1.2s ease",
                    padding: 0,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
                >
                  Acceso
                </button>
              )}

              <button
                onClick={() => setIsNight(!isNight)}
                style={{
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  fontSize: "11px",
                  fontWeight: 400,
                  color: textColor,
                  background: "transparent",
                  border: `1px solid ${borderColor}`,
                  cursor: "pointer",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  padding: "6px 12px",
                  transition: "all 0.3s ease, color 1.2s ease, border-color 1.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isNight
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(0,0,0,0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {isNight ? "Día" : "Noche"}
              </button>
            </div>
          </div>

          {/* Bottom Info Bar */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              padding: "20px 32px",
            }}
          >
            <div
              style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontSize: "12px",
                fontWeight: 400,
                color: textColor,
                opacity: 0.5,
                letterSpacing: "0.02em",
                lineHeight: 1.6,
                transition: "color 1.2s ease",
                pointerEvents: "auto",
              }}
            >
              <div style={{ fontSize: "13px", opacity: 0.8, marginBottom: "2px" }}>
                Ecosistema Narrativo Digital
              </div>
              <div>Universidad Colegio Mayor de Cundinamarca</div>
              <div>Diseño Digital y Multimedia</div>
            </div>

            <button
              onClick={scrollToContent}
              style={{
                position: "absolute",
                bottom: "24px",
                left: "50%",
                transform: "translateX(-50%)",
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontSize: "12px",
                fontWeight: 500,
                color: isNight ? "#001233" : "#ffffff",
                background: isNight ? "#ffffff" : "#000000",
                border: "none",
                borderRadius: "100px",
                padding: "14px 32px",
                cursor: "pointer",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                pointerEvents: "auto",
                transition: "all 0.3s ease, background 1.2s ease, color 1.2s ease",
                boxShadow: isNight
                  ? "0 4px 20px rgba(255,255,255,0.15)"
                  : "0 4px 20px rgba(0,0,0,0.15)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateX(-50%) translateY(-2px)";
                e.currentTarget.style.boxShadow = isNight
                  ? "0 8px 30px rgba(255,255,255,0.25)"
                  : "0 8px 30px rgba(0,0,0,0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateX(-50%) translateY(0)";
                e.currentTarget.style.boxShadow = isNight
                  ? "0 4px 20px rgba(255,255,255,0.15)"
                  : "0 4px 20px rgba(0,0,0,0.15)";
              }}
            >
              Explorar
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </button>

            <button
              onClick={() => {
                const vortex = vortexRef.current;
                if (vortex) {
                  const idx = vortex.textureIndex ?? 0;
                  setSelectedIdx(idx);
                }
              }}
              style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontSize: "12px",
                fontWeight: 400,
                color: textColor,
                background: "transparent",
                border: `1.5px solid ${borderColor}`,
                padding: "10px 20px",
                cursor: "pointer",
                letterSpacing: "0.04em",
                pointerEvents: "auto",
                transition: "all 0.3s ease, color 1.2s ease, border-color 1.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isNight
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.05)";
                e.currentTarget.style.borderColor = isNight
                  ? "rgba(255,255,255,0.5)"
                  : "rgba(0,0,0,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = isNight
                  ? "rgba(255,255,255,0.25)"
                  : "rgba(0,0,0,0.15)";
              }}
            >
              Ver Proyecto
            </button>
          </div>
        </div>
      </section>

      {/* SECCIÓN: FUNCIONAMIENTO */}
      <section
        id="como-funciona"
        style={{
          position: "relative",
          zIndex: 20,
          padding: "120px 32px",
          background: bgColor,
          transition: "background 1.2s ease",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <p
            style={{
              fontFamily: "system-ui, sans-serif",
              fontSize: "11px",
              color: mutedColor,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            Funcionamiento
          </p>
          <h2
            style={{
              fontFamily: "'Times New Roman', serif",
              fontSize: "clamp(32px, 5vw, 56px)",
              color: textColor,
              marginBottom: "64px",
              lineHeight: 1.1,
              transition: "color 1.2s ease",
            }}
          >
            Un ecosistema que potencia<br />cada proyecto
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "24px",
            }}
          >
            {[
              {
                title: "Narrativa Estructurada",
                description: "Plantillas que guían la publicación de proyectos con formatos claros y coherentes.",
                icon: "📐",
              },
              {
                title: "Curaduría Inteligente",
                description: "Visibilidad dirigida a audiencias relevantes según disciplina e intereses.",
                icon: "🎯",
              },
              {
                title: "Conexiones entre Proyectos",
                description: "Red de vinculación automática por etiquetas y áreas de conocimiento.",
                icon: "🔗",
              },
              {
                title: "Comunidad Activa",
                description: "Espacios de interacción, retroalimentación y colaboración entre pares.",
                icon: "🤝",
              },
            ].map((cap, i) => (
              <div
                key={i}
                style={{
                  background: cardBg,
                  border: `1px solid ${borderColor}`,
                  padding: "40px 32px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  transition: "transform 0.4s ease, box-shadow 0.4s ease, background 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow = isNight
                    ? "0 20px 40px rgba(0,0,0,0.4)"
                    : "0 20px 40px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ fontSize: "32px", marginBottom: "20px" }}>{cap.icon}</div>
                <h3
                  style={{
                    fontFamily: "'Times New Roman', serif",
                    fontSize: "22px",
                    color: textColor,
                    marginBottom: "12px",
                    transition: "color 1.2s ease",
                  }}
                >
                  {cap.title}
                </h3>
                <p
                  style={{
                    fontFamily: "system-ui, sans-serif",
                    fontSize: "14px",
                    color: mutedColor,
                    lineHeight: 1.6,
                  }}
                >
                  {cap.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECCIÓN: ECOSISTEMA */}
      <section
        id="ecosistema"
        style={{
          position: "relative",
          zIndex: 20,
          padding: "0 32px 120px",
          background: bgColor,
          transition: "background 1.2s ease",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div
            style={{
              width: "100%",
              aspectRatio: "21/9",
              borderRadius: "8px",
              overflow: "hidden",
              position: "relative",
              marginBottom: "48px",
            }}
          >
            <video
              autoPlay
              muted
              loop
              playsInline
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            >
              <source src="/videos/ecosistema.mp4" type="video/mp4" />
              Tu navegador no soporta videos HTML5.
            </video>
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: isNight
                  ? "linear-gradient(135deg, #001233 0%, #0a1628 100%)"
                  : "linear-gradient(135deg, #e8e8e8 0%, #f5f5f5 100%)",
              }}
            />
            <div style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  border: `2px solid ${mutedColor}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  cursor: "pointer",
                }}
              >
                <svg width="20" height="24" viewBox="0 0 20 24" fill="none">
                  <path d="M20 12L0 24V0L20 12Z" fill={textColor} />
                </svg>
              </div>
              <p style={{ fontFamily: "system-ui, sans-serif", fontSize: "13px", color: mutedColor }}>
                Video cinemático del ecosistema
              </p>
            </div>
          </div>

          <div style={{ maxWidth: "800px" }}>
            <p
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: "11px",
                color: mutedColor,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                marginBottom: "16px",
              }}
            >
              Ecosistema
            </p>
            <h2
              style={{
                fontFamily: "'Times New Roman', serif",
                fontSize: "clamp(28px, 4vw, 48px)",
                color: textColor,
                marginBottom: "24px",
                lineHeight: 1.15,
                transition: "color 1.2s ease",
              }}
            >
              Más que un repositorio,<br />una red viva
            </h2>
            <p
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: "16px",
                color: mutedColor,
                lineHeight: 1.7,
              }}
            >
              El Ecosistema Narrativo Digital no es solo un archivo de proyectos. Es una plataforma
              donde cada pieza de trabajo se conecta con otras, creando tejidos de conocimiento
              visibles e interactivos. Aquí, el diseño se convierte en conversación, y cada
              proyecto estudiantil encuentra su lugar en una red mayor de creatividad e innovación.
            </p>
          </div>
        </div>
      </section>

      {/* SECCIÓN: DESTACADOS */}
      <section
        id="destacados"
        style={{
          position: "relative",
          zIndex: 20,
          padding: "120px 32px",
          background: isNight ? "#000d1f" : "#f8f8f8",
          transition: "background 1.2s ease",
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <p
            style={{
              fontFamily: "system-ui, sans-serif",
              fontSize: "11px",
              color: mutedColor,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            Destacados
          </p>
          <h2
            style={{
              fontFamily: "'Times New Roman', serif",
              fontSize: "clamp(32px, 5vw, 56px)",
              color: textColor,
              marginBottom: "64px",
              lineHeight: 1.1,
              transition: "color 1.2s ease",
            }}
          >
            Proyectos que definen<br />el programa
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {projects
              .filter((p) => p.status === "Publicado")
              .sort((a, b) => {
                const totalA = a.reactions.inspires + a.reactions.learned + a.reactions.professional;
                const totalB = b.reactions.inspires + b.reactions.learned + b.reactions.professional;
                return totalB - totalA;
              })
              .slice(0, 12)
              .map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      position: "relative",
                      cursor: "pointer",
                      overflow: "hidden",
                      borderRadius: "4px",
                      background: cardBg,
                    }}
                    onMouseEnter={(e) => {
                      const img = e.currentTarget.querySelector("img") as HTMLImageElement;
                      if (img) img.style.filter = "grayscale(0%)";
                      const overlay = e.currentTarget.querySelector(".project-overlay") as HTMLElement;
                      if (overlay) overlay.style.opacity = "1";
                    }}
                    onMouseLeave={(e) => {
                      const img = e.currentTarget.querySelector("img") as HTMLImageElement;
                      if (img) img.style.filter = "grayscale(100%)";
                      const overlay = e.currentTarget.querySelector(".project-overlay") as HTMLElement;
                      if (overlay) overlay.style.opacity = "0";
                    }}
                  >
                    <img
                      src={project.thumbnail}
                      alt={project.title}
                      loading="lazy"
                      style={{
                        width: "100%",
                        aspectRatio: "4/5",
                        objectFit: "cover",
                        filter: "grayscale(100%)",
                        transition: "filter 0.6s ease, transform 0.6s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.05)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    />
                    <div
                      className="project-overlay"
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: "24px",
                        background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
                        opacity: 0,
                        transition: "opacity 0.4s ease",
                      }}
                    >
                      <p
                        style={{
                          fontFamily: "system-ui, sans-serif",
                          fontSize: "11px",
                          color: "#fff",
                          opacity: 0.7,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          marginBottom: "4px",
                        }}
                      >
                        {project.area} · {project.semester}
                      </p>
                      <h3
                        style={{
                          fontFamily: "'Times New Roman', serif",
                          fontSize: "18px",
                          color: "#fff",
                        }}
                      >
                        {project.title}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* SECCIÓN: EXPLORAR */}
      <section
        id="explorar"
        style={{
          position: "relative",
          zIndex: 20,
          padding: "120px 32px",
          background: bgColor,
          transition: "background 1.2s ease",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <p
            style={{
              fontFamily: "system-ui, sans-serif",
              fontSize: "11px",
              color: mutedColor,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            Explorar
          </p>
          <h2
            style={{
              fontFamily: "'Times New Roman', serif",
              fontSize: "clamp(32px, 5vw, 56px)",
              color: textColor,
              marginBottom: "48px",
              lineHeight: 1.1,
              transition: "color 1.2s ease",
            }}
          >
            Navega por disciplinas<br />y áreas de interés
          </h2>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              marginBottom: "80px",
              justifyContent: "center",
            }}
          >
            {[
              "Diseño Gráfico", "Branding", "Tipografía", "UI/UX", "Arquitectura",
              "Fotografía", "Motion", "Sostenibilidad", "Ilustración", "Data Viz",
              "Moda", "XR", "Editorial", "Señalética", "Packaging"
            ].map((tag) => (
              <button
                key={tag}
                style={{
                  fontFamily: "system-ui, sans-serif",
                  fontSize: "14px",
                  padding: "10px 20px",
                  borderRadius: "100px",
                  border: `1.5px solid ${borderColor}`,
                  background: "transparent",
                  color: textColor,
                  cursor: "pointer",
                  transition: "all 0.3s ease, color 1.2s ease",
                }}
              >
                {tag}
              </button>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "24px",
            }}
          >
            {[
              { name: "Diseño Visual", count: 124, color: "#e63946" },
              { name: "Diseño Digital", count: 98, color: "#457b9d" },
              { name: "Diseño Espacial y de Objetos", count: 76, color: "#2a9d8f" },
            ].map((cat, i) => (
              <div
                key={i}
                style={{
                  padding: "48px 36px",
                  borderRadius: "8px",
                  border: `1px solid ${borderColor}`,
                  background: cardBg,
                  cursor: "pointer",
                  transition: "transform 0.4s ease, box-shadow 0.4s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = `0 12px 32px ${cat.color}20`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "4px",
                    background: cat.color,
                    marginBottom: "24px",
                    borderRadius: "2px",
                  }}
                />
                <h3
                  style={{
                    fontFamily: "'Times New Roman', serif",
                    fontSize: "28px",
                    color: textColor,
                    marginBottom: "8px",
                    transition: "color 1.2s ease",
                  }}
                >
                  {cat.name}
                </h3>
                <p
                  style={{
                    fontFamily: "system-ui, sans-serif",
                    fontSize: "14px",
                    color: mutedColor,
                  }}
                >
                  {cat.count} proyectos
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECCIÓN: COMUNIDAD */}
      <section
        id="comunidad"
        style={{
          position: "relative",
          zIndex: 20,
          padding: "120px 32px",
          background: isNight ? "#000d1f" : "#f8f8f8",
          transition: "background 1.2s ease",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <p
            style={{
              fontFamily: "system-ui, sans-serif",
              fontSize: "11px",
              color: mutedColor,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            Comunidad
          </p>
          <h2
            style={{
              fontFamily: "'Times New Roman', serif",
              fontSize: "clamp(32px, 5vw, 56px)",
              color: textColor,
              marginBottom: "64px",
              lineHeight: 1.1,
              transition: "color 1.2s ease",
            }}
          >
            Creadores que construyen<br />el ecosistema
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "24px",
            }}
          >
            {[
              { name: "Mariana Torres", role: "Diseñadora Visual", tags: ["Branding", "Tipografía"], projects: 12, connections: 34, avatar: "MT" },
              { name: "Carlos Ríos", role: "UX Researcher", tags: ["UX/UI", "Data Viz"], projects: 8, connections: 28, avatar: "CR" },
              { name: "Valentina Soto", role: "Ilustradora", tags: ["Ilustración", "Editorial"], projects: 15, connections: 42, avatar: "VS" },
              { name: "Andrés Méndez", role: "Arquitecto", tags: ["Arquitectura", "Sostenibilidad"], projects: 6, connections: 19, avatar: "AM" },
            ].map((creator, i) => (
              <div
                key={i}
                style={{
                  padding: "36px",
                  borderRadius: "8px",
                  border: `1px solid ${borderColor}`,
                  background: cardBg,
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = isNight
                    ? "0 16px 32px rgba(0,0,0,0.3)"
                    : "0 16px 32px rgba(0,0,0,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    background: isNight
                      ? "linear-gradient(135deg, #1a3a5c, #0d2137)"
                      : "linear-gradient(135deg, #e0e0e0, #c0c0c0)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'Times New Roman', serif",
                    fontSize: "24px",
                    color: textColor,
                    marginBottom: "20px",
                  }}
                >
                  {creator.avatar}
                </div>

                <h3
                  style={{
                    fontFamily: "'Times New Roman', serif",
                    fontSize: "22px",
                    color: textColor,
                    marginBottom: "4px",
                    transition: "color 1.2s ease",
                  }}
                >
                  {creator.name}
                </h3>
                <p
                  style={{
                    fontFamily: "system-ui, sans-serif",
                    fontSize: "13px",
                    color: mutedColor,
                    marginBottom: "16px",
                  }}
                >
                  {creator.role}
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "20px" }}>
                  {creator.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontFamily: "system-ui, sans-serif",
                        fontSize: "11px",
                        color: mutedColor,
                        padding: "4px 10px",
                        borderRadius: "100px",
                        border: `1px solid ${borderColor}`,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "24px",
                    paddingTop: "16px",
                    borderTop: `1px solid ${borderColor}`,
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontFamily: "'Times New Roman', serif",
                        fontSize: "24px",
                        color: textColor,
                        transition: "color 1.2s ease",
                      }}
                    >
                      {creator.projects}
                    </p>
                    <p style={{ fontFamily: "system-ui, sans-serif", fontSize: "11px", color: mutedColor }}>
                      Proyectos
                    </p>
                  </div>
                  <div>
                    <p
                      style={{
                        fontFamily: "'Times New Roman', serif",
                        fontSize: "24px",
                        color: textColor,
                        transition: "color 1.2s ease",
                      }}
                    >
                      {creator.connections}
                    </p>
                    <p style={{ fontFamily: "system-ui, sans-serif", fontSize: "11px", color: mutedColor }}>
                      Conexiones
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          position: "relative",
          zIndex: 20,
          padding: "80px 32px 40px",
          background: isNight ? "#000814" : "#111111",
          color: "#ffffff",
          transition: "background 1.2s ease",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "48px",
            marginBottom: "64px",
          }}
        >
          <div>
            <h4
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: "11px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                opacity: 0.5,
                marginBottom: "20px",
              }}
            >
              Plataforma
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {["Explorar proyectos", "Publicar trabajo", "Cómo funciona", "Preguntas frecuentes"].map((item) => (
                <li key={item} style={{ marginBottom: "12px" }}>
                  <a
                    href="#"
                    style={{
                      fontFamily: "system-ui, sans-serif",
                      fontSize: "14px",
                      color: "#ffffff",
                      opacity: 0.7,
                      textDecoration: "none",
                      transition: "opacity 0.3s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: "11px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                opacity: 0.5,
                marginBottom: "20px",
              }}
            >
              Recursos
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {["Guía de publicación", "Plantillas", "Tutoriales", "Blog"].map((item) => (
                <li key={item} style={{ marginBottom: "12px" }}>
                  <a
                    href="#"
                    style={{
                      fontFamily: "system-ui, sans-serif",
                      fontSize: "14px",
                      color: "#ffffff",
                      opacity: 0.7,
                      textDecoration: "none",
                      transition: "opacity 0.3s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: "11px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                opacity: 0.5,
                marginBottom: "20px",
              }}
            >
              Conectar
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {["Instagram", "LinkedIn", "Behance", "Contacto"].map((item) => (
                <li key={item} style={{ marginBottom: "12px" }}>
                  <a
                    href="#"
                    style={{
                      fontFamily: "system-ui, sans-serif",
                      fontSize: "14px",
                      color: "#ffffff",
                      opacity: 0.7,
                      textDecoration: "none",
                      transition: "opacity 0.3s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            paddingTop: "32px",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <p
            style={{
              fontFamily: "system-ui, sans-serif",
              fontSize: "12px",
              opacity: 0.5,
            }}
          >
            {siteConfig.copyright || "© 2026 Ecosistema Narrativo Digital"}
          </p>
          <div style={{ display: "flex", gap: "24px" }}>
            {["Privacidad", "Términos", "Cookies"].map((item) => (
              <a
                key={item}
                href="#"
                style={{
                  fontFamily: "system-ui, sans-serif",
                  fontSize: "12px",
                  color: "#ffffff",
                  opacity: 0.5,
                  textDecoration: "none",
                  transition: "opacity 0.3s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.5")}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>

      <ImageDetailOverlay
        image={selectedIdx !== null ? images[selectedIdx] : null}
        onClose={() => setSelectedIdx(null)}
      />

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
}