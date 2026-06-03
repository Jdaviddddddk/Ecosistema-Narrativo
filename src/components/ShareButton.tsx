import { useState } from "react";

interface ShareButtonProps {
  url: string;
  label: string;
  style?: React.CSSProperties;
}

export default function ShareButton({ url, label, style }: ShareButtonProps) {
  const [state, setState] = useState<"idle" | "copied">("idle");

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: label, url });
      } else {
        await navigator.clipboard.writeText(url);
        setState("copied");
        setTimeout(() => setState("idle"), 2500);
      }
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        setState("copied");
        setTimeout(() => setState("idle"), 2500);
      } catch { /* sin soporte */ }
    }
  };

  return (
    <button
      onClick={handleShare}
      style={{
        display: "inline-flex", alignItems: "center", gap: "6px",
        padding: "9px 18px", borderRadius: "100px",
        border: state === "copied" ? "1px solid rgba(34,197,94,0.4)" : "1px solid rgba(0,0,0,0.12)",
        background: state === "copied" ? "rgba(34,197,94,0.06)" : "rgba(255,255,255,0.9)",
        backdropFilter: "blur(8px)",
        fontFamily: "'Montserrat', sans-serif", fontSize: "12px", fontWeight: 600,
        color: state === "copied" ? "#166534" : "#555",
        cursor: "pointer", transition: "all 0.2s",
        ...style,
      }}
    >
      <img
        src={state === "copied" ? "/images/icons/icon-guardado.png" : "/images/icons/icon-compartir.png"}
        alt="compartir"
        style={{ width: "16px", height: "16px", imageRendering: "pixelated" }}
      />
      {state === "copied" ? "Enlace copiado" : "Compartir"}
    </button>
  );
}
