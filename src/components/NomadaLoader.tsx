import { useState, useEffect } from "react";

// Frames en orden de animación
const FRAMES = [
  "/images/nomada-frames/f01.png",
  "/images/nomada-frames/f02.png",
  "/images/nomada-frames/f03.png",
  "/images/nomada-frames/f04.png",
  "/images/nomada-frames/f05.png",
  "/images/nomada-frames/f08.png",
  "/images/nomada-frames/f09.png",
  "/images/nomada-frames/f10.png",
  "/images/nomada-frames/f12.png",
  "/images/nomada-frames/f13.png",
  "/images/nomada-frames/f14.png",
  "/images/nomada-frames/f15.png",
];

interface NomadaLoaderProps {
  mensaje?: string;
  fullScreen?: boolean;
  size?: number;
  fps?: number;
}

export default function NomadaLoader({
  mensaje = "Cargando...",
  fullScreen = true,
  size = 96,
  fps = 8,
}: NomadaLoaderProps) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(f => (f + 1) % FRAMES.length);
    }, 1000 / fps);
    return () => clearInterval(interval);
  }, [fps]);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "14px",
      ...(fullScreen ? { minHeight: "100vh", background: "#ffffff" } : { padding: "60px 0" }),
    }}>
      <img
        src={FRAMES[frame]}
        alt="Nómada cargando"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          objectFit: "contain",
          imageRendering: "pixelated",
        }}
      />
      {mensaje && (
        <p style={{
          fontFamily: "'Montserrat', sans-serif",
          fontSize: "12px",
          color: "rgba(0,0,0,0.35)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}>
          {mensaje}
        </p>
      )}
    </div>
  );
}
