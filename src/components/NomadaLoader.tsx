interface NomadaLoaderProps {
  mensaje?: string;
  fullScreen?: boolean;
}

export default function NomadaLoader({ mensaje = "Cargando...", fullScreen = true }: NomadaLoaderProps) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "12px",
      ...(fullScreen ? { minHeight: "100vh", background: "#ffffff" } : { padding: "60px 0" }),
    }}>
      <img
        src="/images/nomada-loading.gif"
        alt="Cargando..."
        style={{
          width: "80px",
          height: "80px",
          imageRendering: "pixelated",
        }}
      />
      <p style={{
        fontFamily: "'Montserrat', sans-serif",
        fontSize: "13px",
        color: "rgba(0,0,0,0.4)",
        letterSpacing: "0.05em",
      }}>
        {mensaje}
      </p>
    </div>
  );
}
