import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onLoginSuccess?: (user: any) => void;
}

export default function LoginModal({ open, onClose, onSuccess, onLoginSuccess }: Props) {
  const { login } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) setError("");
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleGoogleSuccess = (credentialResponse: any) => {
    try {
      const loggedUser = login(credentialResponse.credential);
      onClose();
      if (onLoginSuccess) {
        onLoginSuccess(loggedUser);
      } else if (onSuccess) {
        onSuccess();
      } else {
        window.location.href = '/upload';
      }
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    }
  };

  const handleGoogleError = () => {
    setError("No se pudo conectar con Google. Intenta de nuevo.");
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[200] flex items-center justify-center transition-opacity duration-300"
      style={{
        background: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(16px)",
        opacity: open ? 1 : 0,
        pointerEvents: open ? "auto" : "none",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-[90%] max-w-md bg-white rounded-3xl shadow-2xl transition-transform duration-300 overflow-hidden"
        style={{
          transform: open ? "scale(1)" : "scale(0.95)",
        }}
      >
        <div className="h-1.5 nexo-gradient-bg" />

        <div className="p-8 md:p-10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <div className="flex justify-center mb-6">
            <img src="/images/logo-nexo.png" className="h-16 w-auto" alt="NEXO" />
          </div>

          <p className="text-center text-xs uppercase tracking-[0.2em] mb-2 font-montserrat font-medium text-nexo-primary">
            Acceso al Ecosistema
          </p>

          <h2 className="text-center text-2xl md:text-3xl mb-2 font-sono font-bold text-nexo-dark">
            Bienvenido a NEXO
          </h2>

          <p className="text-center text-sm mb-8 font-montserrat text-gray-500">
            Ingresa con cualquier cuenta Google para acceder al ecosistema.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-sm text-red-600">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
              {error}
            </div>
          )}

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              size="large"
              text="signin_with"
              shape="pill"

            />
          </div>

          <p className="mt-6 text-center text-xs font-montserrat text-gray-400">
            Cualquier cuenta Google puede acceder. Los usuarios con correo{" "}
            <span className="font-semibold text-nexo-primary">@universidadmayor.edu.co</span>{" "}
            tienen acceso a contenido exclusivo de la comunidad.
          </p>
        </div>
      </div>
    </div>
  );
}