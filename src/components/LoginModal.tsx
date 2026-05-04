import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function LoginModal({ open, onClose }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setEmail("");
      setError("");
      setSuccess(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Ingresa tu correo institucional");
      return;
    }

    if (!email.endsWith("@universidadmayor.edu.co")) {
      setError("Correo institucional requerido (@universidadmayor.edu.co)");
      return;
    }

    login(email);
    setSuccess(true);
  };

  const handleClose = () => {
    onClose();
    // Resetear después de cerrar para la próxima vez
    setTimeout(() => setSuccess(false), 350);
  };

  return (
    <div
      onClick={handleClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(10, 10, 10, 0.85)",
        backdropFilter: "blur(8px)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: open ? 1 : 0,
        pointerEvents: open ? "auto" : "none",
        transition: "opacity 0.35s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#ffffff",
          padding: "48px",
          maxWidth: "420px",
          width: "90%",
          position: "relative",
          transform: open ? "scale(1)" : "scale(0.95)",
          transition: "transform 0.35s ease",
        }}
      >
        <button
          onClick={handleClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "20px",
            background: "transparent",
            border: "none",
            fontSize: "24px",
            cursor: "pointer",
            color: "#000",
            opacity: 0.5,
            transition: "opacity 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.5")}
        >
          ×
        </button>

        {!success ? (
          <>
            <p
              style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontSize: "11px",
                fontWeight: 400,
                color: "#000",
                opacity: 0.5,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                margin: "0 0 12px 0",
              }}
            >
              Acceso al Ecosistema
            </p>

            <h2
              style={{
                fontFamily: "'Times New Roman', serif",
                fontSize: "28px",
                fontWeight: 400,
                lineHeight: 1.15,
                margin: "0 0 24px 0",
                color: "#000",
              }}
            >
              Ingresa con tu correo institucional
            </h2>

            <form onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="usuario@universidadmayor.edu.co"
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  fontSize: "14px",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  border: error
                    ? "1.5px solid #ff006e"
                    : "1.5px solid rgba(0,0,0,0.15)",
                  outline: "none",
                  transition: "border-color 0.2s ease",
                  boxSizing: "border-box",
                  marginBottom: error ? "8px" : "20px",
                }}
                onFocus={(e) => {
                  if (!error) e.currentTarget.style.borderColor = "rgba(0,0,0,0.4)";
                }}
                onBlur={(e) => {
                  if (!error) e.currentTarget.style.borderColor = "rgba(0,0,0,0.15)";
                }}
              />

              {error && (
                <p
                  style={{
                    color: "#ff006e",
                    fontSize: "12px",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    margin: "0 0 16px 0",
                  }}
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "14px",
                  background: "#000",
                  color: "#fff",
                  border: "none",
                  fontSize: "13px",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  fontWeight: 400,
                  letterSpacing: "0.04em",
                  cursor: "pointer",
                  transition: "opacity 0.2s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Acceder
              </button>
            </form>

            <p
              style={{
                fontSize: "12px",
                fontFamily: "system-ui, -apple-system, sans-serif",
                color: "rgba(0,0,0,0.4)",
                marginTop: "16px",
                lineHeight: 1.5,
              }}
            >
              Solo correos con dominio @universidadmayor.edu.co tienen acceso.
            </p>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "#38b000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                color: "#fff",
                fontSize: "24px",
              }}
            >
              ✓
            </div>
            <h2
              style={{
                fontFamily: "'Times New Roman', serif",
                fontSize: "24px",
                fontWeight: 400,
                margin: "0 0 12px 0",
                color: "#000",
              }}
            >
              Acceso concedido
            </h2>
            <p
              style={{
                fontSize: "14px",
                fontFamily: "system-ui, -apple-system, sans-serif",
                color: "rgba(0,0,0,0.6)",
                margin: "0 0 24px 0",
                lineHeight: 1.5,
              }}
            >
              Bienvenido al ecosistema, {email.split("@")[0].replace(".", " ")}.
            </p>
            <button
              onClick={handleClose}
              style={{
                padding: "10px 28px",
                background: "transparent",
                color: "#000",
                border: "1.5px solid rgba(0,0,0,0.2)",
                fontSize: "13px",
                fontFamily: "system-ui, -apple-system, sans-serif",
                cursor: "pointer",
                transition: "border-color 0.2s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "rgba(0,0,0,0.5)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "rgba(0,0,0,0.2)")
              }
            >
              Continuar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}