import { useEffect, useRef, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import VortexGallery from "@/lib/VortexGallery";
import Lenis from "lenis";
import { siteConfig } from "@/config";
import ImageDetailOverlay from "@/components/ImageDetailOverlay";
import LoginModal from "@/components/LoginModal";
import { useAuth } from "@/context/AuthContext";
import NomadaInactividad from '@/components/NomadaInactividad';
import NomadaGuia from '@/components/NomadaGuia';
import { projectsAPI } from '@/lib/api';

export default function Home() {
  const [centerBounds, setCenterBounds] = useState<{ x: number; y: number; width: number; height: number; bottom: number; top: number } | null>(null);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const vortexRef = useRef<VortexGallery | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [isNight, setIsNight] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [centerProject, setCenterProject] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar proyectos desde el backend
  useEffect(() => {
    projectsAPI.list()
      .then(data => {
        setProjects(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error cargando proyectos:', err);
        setLoading(false);
      });
  }, []);

  const images = useMemo(() => {
    return projects.flatMap((p) =>
      (p.images || []).map((img: string) => ({
        src: img,
        category: p.area || "General",
        title: p.title || "Sin título",
        description: p.originStory || "",
      }))
    );
  }, [projects]);

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

  // Actualizar proyecto central según el textureIndex del vortex
  useEffect(() => {
    const interval = setInterval(() => {
      if (vortexRef.current && projects.length > 0) {
        const idx = vortexRef.current.textureIndex % projects.length;
        setCenterProject(projects[idx]);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [projects]);

  // Actualizar bounds del centerMesh en cada frame para sincronizar overlay
  useEffect(() => {
    let rafId: number;

    const updateBounds = () => {
      if (vortexRef.current && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const bounds = vortexRef.current.getCenterMeshScreenBounds(rect);
        if (bounds) {
          setCenterBounds(bounds);
        }
      }
      rafId = requestAnimationFrame(updateBounds);
    };

    rafId = requestAnimationFrame(updateBounds);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // ─── ESTADOS DE CARGA ───

  // 1. Mientras carga desde el backend: spinner
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#ffffff' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid #004FCD',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ fontFamily: "'Montserrat', sans-serif", color: '#666' }}>Cargando ecosistema...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // 2. Si no hay proyectos: mensaje + CTA (condicional según auth)
  if (!hasImages) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#ffffff', gap: '24px' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'Sono', sans-serif", fontSize: '32px', color: '#1a1a1a', marginBottom: '12px' }}>
            El ecosistema está vacío
          </h2>
          <p style={{ fontFamily: "'Montserrat', sans-serif", color: '#666', fontSize: '16px', marginBottom: '32px' }}>
            No hay proyectos disponibles aún. Sé el primero en publicar.
          </p>
          <button
            onClick={() => {
              if (isAuthenticated) {
                navigate('/upload');
              } else {
                setLoginOpen(true);
              }
            }}
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: '14px',
              fontWeight: 600,
              color: '#ffffff',
              background: 'linear-gradient(135deg, #004FCD, #0039a8)',
              border: 'none',
              borderRadius: '100px',
              padding: '16px 36px',
              cursor: 'pointer',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            🚀 Publicar primer proyecto
          </button>
          {!isAuthenticated && (
            <p style={{ fontFamily: "'Montserrat', sans-serif", color: '#999', fontSize: '13px', marginTop: '16px' }}>
              Necesitas iniciar sesión para publicar
            </p>
          )}
        </div>
        {/* LoginModal para el estado vacío */}
        <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      </div>
    );
  }

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

        {/* OVERLAY: Info del proyecto central - ALINEADO EXACTAMENTE DEBAJO DE LA IMAGEN DEL SHADER */}
        {centerProject && centerBounds && (
          <div
            style={{
              position: "absolute",
              top: `${centerBounds.bottom}px`,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 100,
              width: `${centerBounds.width}px`,
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(20px) saturate(140%)",
                WebkitBackdropFilter: "blur(20px) saturate(140%)",
                borderRadius: "0 0 16px 16px",
                padding: "20px 24px",
                border: "1px solid rgba(255,255,255,0.4)",
                borderTop: "none",
                boxShadow: "0 16px 40px rgba(0,79,205,0.1), 0 4px 12px rgba(0,0,0,0.04)",
                textAlign: "center",
                animation: "fadeIn 0.5s ease-out",
              }}
            >
              {/* Area tag */}
              <span
                style={{
                  display: "inline-block",
                  padding: "3px 12px",
                  borderRadius: "100px",
                  fontSize: "10px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  background: "linear-gradient(135deg, rgba(0,79,205,0.1), rgba(0,79,205,0.05))",
                  color: "#004FCD",
                  fontFamily: "'Montserrat', sans-serif",
                  marginBottom: "8px",
                }}
              >
                {centerProject.area}
              </span>

              {/* Title */}
              <h3
                style={{
                  fontFamily: "'Sono', sans-serif",
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#1a1a1a",
                  lineHeight: 1.2,
                  marginBottom: "6px",
                }}
              >
                {centerProject.title}
              </h3>

              {/* Author */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                {isAuthenticated && user ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid rgba(0,79,205,0.2)",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #004FCD, #0039a8)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "10px",
                      color: "white",
                      fontFamily: "'Sono', sans-serif",
                      fontWeight: 700,
                    }}
                  >
                    {centerProject.author?.charAt(0).toUpperCase() || "?"}
                  </div>
                )}
                <span
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: "12px",
                    color: "#555",
                    fontWeight: 500,
                  }}
                >
                  {centerProject.author}
                </span>
              </div>

              {/* Description */}
              <p
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "12px",
                  color: "#777",
                  lineHeight: 1.6,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {centerProject.originStory}
              </p>
            </div>
          </div>
        )}

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
          {/* Top Navigation Bar - NEXO Style */}
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
            {/* Logo NEXO */}
            <Link to="/" className="flex items-center gap-3 group" style={{ textDecoration: "none" }}>
              <img
                src="/images/logo-nexo.png"
                className="h-8 w-auto transition-transform duration-300 group-hover:scale-105"
                style={{ filter: isNight ? "brightness(0) invert(1)" : "none" }}
              />
            </Link>

            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              <Link
                to="/info"
                className="nexo-nav-link"
                style={{
                  color: textColor,
                  opacity: 0.8,
                  fontSize: "13px",
                }}
              >
                Nosotros
              </Link>

              <Link
                to="/projects"
                className="nexo-nav-link"
                style={{
                  color: textColor,
                  opacity: 0.8,
                  fontSize: "13px",
                }}
              >
                Proyectos
              </Link>

              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => navigate("/yo")}
                    className="flex items-center gap-2 transition-all duration-300 hover:opacity-100"
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: "13px",
                      color: textColor,
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      opacity: 0.8,
                    }}
                  >
                    <img
                      src={user?.avatar || "/images/avatar_default.jpg"}
                      alt={user?.name}
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                    Yo
                  </button>
                  <button
                    onClick={logout}
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: "13px",
                      color: textColor,
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      opacity: 0.7,
                      transition: "opacity 0.3s ease",
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
                  className="nexo-btn-primary"
                  style={{ fontSize: "12px", padding: "10px 20px" }}
                >
                  Acceso
                </button>
              )}

              <button
                onClick={() => setIsNight(!isNight)}
                className="flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "11px",
                  color: textColor,
                  background: isNight ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                  border: `1px solid ${borderColor}`,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {isNight ? "☀️ Día" : "🌙 Noche"}
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
                bottom: "32px",
                left: "50%",
                transform: "translateX(-50%)",
                fontFamily: "'Montserrat', sans-serif",
                fontSize: "13px",
                fontWeight: 600,
                color: "#ffffff",
                background: "linear-gradient(135deg, #004FCD, #0039a8)",
                border: "none",
                borderRadius: "100px",
                padding: "16px 36px",
                cursor: "pointer",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                pointerEvents: "auto",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: "0 8px 32px rgba(0, 79, 205, 0.4)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateX(-50%) translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 12px 40px rgba(0, 79, 205, 0.6)";
                e.currentTarget.style.background = "linear-gradient(135deg, #0058e6, #0045a0)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateX(-50%) translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 79, 205, 0.4)";
                e.currentTarget.style.background = "linear-gradient(135deg, #004FCD, #0039a8)";
              }}
            >
              Explorar
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ transition: "transform 0.3s ease" }}
              >
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </button>

            <div style={{ display: "flex", gap: "10px", pointerEvents: "auto" }}>
              <button
                onClick={() => {
                  const vortex = vortexRef.current;
                  if (vortex) { const idx = vortex.textureIndex ?? 0; setSelectedIdx(idx); }
                }}
                style={{
                  fontFamily: "system-ui, -apple-system, sans-serif", fontSize: "12px",
                  color: textColor, background: "transparent", border: `1.5px solid ${borderColor}`,
                  padding: "10px 20px", cursor: "pointer", letterSpacing: "0.04em",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = isNight ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                Vista rápida
              </button>
              {centerProject && (
                <button
                  onClick={() => navigate(`/projects/${centerProject.id}`)}
                  style={{
                    fontFamily: "system-ui, -apple-system, sans-serif", fontSize: "12px", fontWeight: 600,
                    color: "#fff", background: "linear-gradient(135deg, #004FCD, #3b7de8)",
                    border: "none", padding: "10px 20px", cursor: "pointer", letterSpacing: "0.04em",
                    boxShadow: "0 4px 14px rgba(0,79,205,0.35)", transition: "all 0.3s ease",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,79,205,0.5)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,79,205,0.35)"; }}
                >
                  Ver proyecto →
                </button>
              )}
            </div>
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
              color: isNight ? "rgba(0,79,205,0.8)" : "#004FCD",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: "16px",
              fontWeight: 600,
            }}
          >
            Funcionamiento
          </p>
          <h2
            style={{
              fontFamily: "'Sono', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(32px, 5vw, 56px)",
              color: textColor,
              marginBottom: "64px",
              lineHeight: 1.1,
              transition: "color 1.2s ease",
              letterSpacing: "-0.02em",
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
                icon: (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#004FCD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                ),
              },
              {
                title: "Curaduría Inteligente",
                description: "Visibilidad dirigida a audiencias relevantes según disciplina e intereses.",
                icon: (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#004FCD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                    <path d="M11 8v6" />
                    <path d="M8 11h6" />
                  </svg>
                ),
              },
              {
                title: "Conexiones entre Proyectos",
                description: "Red de vinculación automática por etiquetas y áreas de conocimiento.",
                icon: (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#004FCD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                ),
              },
              {
                title: "Comunidad Activa",
                description: "Espacios de interacción, retroalimentación y colaboración entre pares.",
                icon: (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#004FCD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                ),
              },
            ].map((cap, i) => (
              <div
                key={i}
                style={{
                  background: isNight ? "rgba(255,255,255,0.03)" : "white",
                  border: `1px solid ${isNight ? "rgba(0,79,205,0.15)" : "rgba(0,79,205,0.08)"}`,
                  padding: "40px 32px",
                  borderRadius: "16px",
                  cursor: "pointer",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow = isNight
                    ? "0 20px 40px rgba(0,79,205,0.2)"
                    : "0 20px 40px rgba(0,79,205,0.12)";
                  e.currentTarget.style.borderColor = "rgba(0,79,205,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor = isNight ? "rgba(0,79,205,0.15)" : "rgba(0,79,205,0.08)";
                }}
              >
                {/* Número de fondo decorativo */}
                <div
                  style={{
                    position: "absolute",
                    top: "20px",
                    right: "24px",
                    fontFamily: "'Sono', sans-serif",
                    fontSize: "64px",
                    fontWeight: 700,
                    color: isNight ? "rgba(0,79,205,0.08)" : "rgba(0,79,205,0.06)",
                    lineHeight: 1,
                    userSelect: "none",
                  }}
                >
                  0{i + 1}
                </div>

                {/* Icono */}
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "12px",
                    background: isNight ? "rgba(0,79,205,0.15)" : "rgba(0,79,205,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "24px",
                    transition: "all 0.3s ease",
                  }}
                >
                  {cap.icon}
                </div>

                <h3
                  style={{
                    fontFamily: "'Sono', sans-serif",
                    fontWeight: 700,
                    fontSize: "22px",
                    color: textColor,
                    marginBottom: "12px",
                    transition: "color 1.2s ease",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {cap.title}
                </h3>
                <p
                  style={{
                    fontFamily: "system-ui, sans-serif",
                    fontSize: "14px",
                    color: mutedColor,
                    lineHeight: 1.7,
                    fontWeight: 400,
                  }}
                >
                  {cap.description}
                </p>

                {/* Línea decorativa inferior */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: "32px",
                    right: "32px",
                    height: "3px",
                    background: "linear-gradient(90deg, #004FCD, #3b7de8)",
                    borderRadius: "3px 3px 0 0",
                    opacity: 0,
                    transition: "opacity 0.3s ease",
                  }}
                  className="card-accent-line"
                />
              </div>
            ))}
          </div>
        </div>
        <NomadaInactividad />
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
              <source
                src="public\videos\ecosistema.mp4"
                type="video/mp4"
              />
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
                fontFamily: "'Sono', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(32px, 5vw, 56px)",
                color: textColor,
                marginBottom: "64px",
                lineHeight: 1.1,
                transition: "color 1.2s ease",
                letterSpacing: "-0.02em",
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
              fontFamily: "'Sono', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(32px, 5vw, 56px)",
              color: textColor,
              marginBottom: "64px",
              lineHeight: 1.1,
              transition: "color 1.2s ease",
              letterSpacing: "-0.02em",
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
                const totalA = (a.reactions?.inspires || 0) + (a.reactions?.learned || 0) + (a.reactions?.professional || 0);
                const totalB = (b.reactions?.inspires || 0) + (b.reactions?.learned || 0) + (b.reactions?.professional || 0);
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
                      src={project.thumbnail || project.images?.[0] || "/images/placeholder.jpg"}
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
              fontFamily: "'Sono', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(32px, 5vw, 56px)",
              color: textColor,
              marginBottom: "64px",
              lineHeight: 1.1,
              transition: "color 1.2s ease",
              letterSpacing: "-0.02em",
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
              fontFamily: "'Sono', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(32px, 5vw, 56px)",
              color: textColor,
              marginBottom: "64px",
              lineHeight: 1.1,
              transition: "color 1.2s ease",
              letterSpacing: "-0.02em",
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
      <NomadaGuia escena="bienvenida" onAccion={() => navigate('/projects')} />
    </div>
  );
}