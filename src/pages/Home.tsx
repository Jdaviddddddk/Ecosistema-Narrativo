import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import VortexGallery from "@/lib/VortexGallery";
import Lenis from "lenis";
import {
  siteConfig,
  navigationConfig,
  galleryConfig,
} from "@/config";
import ImageDetailOverlay from "@/components/ImageDetailOverlay";
import LoginModal from "@/components/LoginModal";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const vortexRef = useRef<VortexGallery | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [isNight, setIsNight] = useState(false);

  const images = galleryConfig.images;
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

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: isNight ? "#001233" : "#ffffff",
        transition: "background 1.2s ease",
      }}
    >
      {/* WebGL Canvas */}
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

      {/* UI Overlay */}
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
          {/* Left: Logo */}
          <Link
            to="/"
            style={{
              fontFamily: "'Times New Roman', serif",
              fontSize: "18px",
              fontWeight: 400,
              color: isNight ? "#ffffff" : "#000000",
              letterSpacing: "0.05em",
              textDecoration: "none",
              transition: "opacity 0.3s ease, color 1.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.6")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            {siteConfig.brandName}
          </Link>

          {/* Right: Navigation Links */}
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
                color: isNight ? "#ffffff" : "#000000",
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

            <button
              onClick={() => setLoginOpen(true)}
              style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontSize: "13px",
                fontWeight: 400,
                color: isNight ? "#ffffff" : "#000000",
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

            <button
              onClick={() => setIsNight(!isNight)}
              style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontSize: "11px",
                fontWeight: 400,
                color: isNight ? "#ffffff" : "#000000",
                background: "transparent",
                border: `1px solid ${isNight ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.15)"}`,
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
          {/* Left: Project Info */}
          <div
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontSize: "12px",
              fontWeight: 400,
              color: isNight ? "#ffffff" : "#000000",
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

          {/* Center: Scroll hint */}
          <div
            style={{
              position: "absolute",
              bottom: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontSize: "11px",
              fontWeight: 400,
              color: isNight ? "#ffffff" : "#000000",
              opacity: 0.35,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              transition: "color 1.2s ease",
              textAlign: "center",
            }}
          >
            Desplaza para explorar
            <div
              style={{
                width: "1px",
                height: "16px",
                background: isNight ? "#ffffff" : "#000000",
                margin: "6px auto 0",
                opacity: 0.3,
                transition: "background 1.2s ease",
              }}
            />
          </div>

          {/* Right: View Project CTA */}
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
              color: isNight ? "#ffffff" : "#000000",
              background: "transparent",
              border: `1.5px solid ${isNight ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.15)"}`,
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

      <ImageDetailOverlay
        image={selectedIdx !== null ? images[selectedIdx] : null}
        onClose={() => setSelectedIdx(null)}
      />

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
}
