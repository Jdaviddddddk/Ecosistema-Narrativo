import { useEffect } from "react";
import type { ImageItem } from "@/config";
import { overlayConfig } from "@/config";

interface Props {
  image: ImageItem | null;
  onClose: () => void;
}

export default function ImageDetailOverlay({ image, onClose }: Props) {
  useEffect(() => {
    if (!image) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [image, onClose]);

  const open = !!image;

  const eyebrow =
    image && image.category
      ? overlayConfig.frameDetailLabel
        ? `${image.category} — ${overlayConfig.frameDetailLabel}`
        : image.category
      : "";

  return (
    <div
      onClick={onClose}
      className="nexo-overlay"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px",
        opacity: open ? 1 : 0,
        pointerEvents: open ? "auto" : "none",
        transition: "opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {image && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="nexo-overlay-card"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.4fr) minmax(320px, 0.9fr)",
            gap: "48px",
            maxWidth: "1400px",
            width: "100%",
            maxHeight: "100%",
            alignItems: "center",
            transform: open ? "scale(1) translateY(0)" : "scale(0.96) translateY(20px)",
            opacity: open ? 1 : 0,
            transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Image */}
          <div
            className="nexo-overlay-image"
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              maxHeight: "calc(100vh - 128px)",
            }}
          >
            <img
              src={image.src}
              alt={image.title}
              style={{
                display: "block",
                maxWidth: "100%",
                maxHeight: "calc(100vh - 128px)",
                objectFit: "contain",
              }}
            />
          </div>

          {/* Text panel */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              maxHeight: "calc(100vh - 128px)",
              overflow: "auto",
              padding: "8px 8px 8px 0",
            }}
          >
            {eyebrow && (
              <p className="nexo-overlay-eyebrow">
                {eyebrow}
              </p>
            )}

            {image.title && (
              <h2 className="nexo-overlay-title">
                {image.title}
              </h2>
            )}

            {image.description && (
              <p className="nexo-overlay-description">
                {image.description}
              </p>
            )}

            {/* Author info */}
            <div className="nexo-overlay-meta">
              <div className="nexo-overlay-author">
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, var(--nexo-primary), var(--nexo-primary-dark))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'Sono', sans-serif",
                    fontSize: "14px",
                    color: "white",
                    fontWeight: 700,
                  }}
                >
                  {image.title?.charAt(0).toUpperCase() || "N"}
                </div>
                <div>
                  <p className="nexo-overlay-author-name">Autor del proyecto</p>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", fontFamily: "'Montserrat', sans-serif" }}>
                    {image.category}
                  </p>
                </div>
              </div>
            </div>

            {(overlayConfig.fileLabel || overlayConfig.seriesLabel) && (
              <div
                style={{
                  marginTop: "8px",
                  paddingTop: "20px",
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                  display: "grid",
                  gridTemplateColumns: "110px 1fr",
                  rowGap: "10px",
                  fontSize: "13px",
                  opacity: 0.7,
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                {overlayConfig.fileLabel && (
                  <>
                    <span style={{ color: "rgba(255,255,255,0.5)" }}>
                      {overlayConfig.fileLabel}
                    </span>
                    <span style={{ fontFamily: "monospace", color: "rgba(255,255,255,0.8)" }}>
                      {image.src.split("/").pop()}
                    </span>
                  </>
                )}
                {overlayConfig.seriesLabel && (
                  <>
                    <span style={{ color: "rgba(255,255,255,0.5)" }}>
                      {overlayConfig.seriesLabel}
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.8)" }}>{image.title.split(" — ")[0]}</span>
                  </>
                )}
              </div>
            )}

            {overlayConfig.closeLabel && (
              <button
                onClick={onClose}
                className="nexo-overlay-close"
                style={{ alignSelf: "flex-start", marginTop: "8px" }}
              >
                {overlayConfig.closeLabel}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Close X */}
      <button
        onClick={onClose}
        aria-label="Close"
        style={{
          position: "fixed",
          top: "28px",
          right: "36px",
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: "50%",
          width: "44px",
          height: "44px",
          color: "#fff",
          fontSize: "22px",
          lineHeight: 1,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.3s ease",
          backdropFilter: "blur(8px)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(0,79,205,0.3)";
          e.currentTarget.style.borderColor = "var(--nexo-primary-light)";
          e.currentTarget.style.transform = "rotate(90deg)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.08)";
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
          e.currentTarget.style.transform = "rotate(0deg)";
        }}
      >
        ×
      </button>
    </div>
  );
}