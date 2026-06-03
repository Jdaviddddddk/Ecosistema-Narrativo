import { useState, useEffect, useCallback } from "react";
import { commentsAPI } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

// ─── Filtro de palabras ofensivas (español) ──────────────────────────────────
const PALABRAS_BLOQUEADAS = [
  "idiota","estúpido","imbécil","mierda","puta","puto","pendejo","pendeja",
  "malparido","malparida","hdp","hijo de puta","marica","maricon","maricón",
  "retardado","retrasado","inútil","basura","asco","gordo","gorda","feo","fea",
  "suicídate","mátate","muérete","cállate","hate","kill","die",
];

function contieneOfensa(texto: string): boolean {
  const lower = texto.toLowerCase();
  return PALABRAS_BLOQUEADAS.some(p => lower.includes(p));
}

interface Comentario {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
}

interface Props {
  projectId: string;
}

export default function ComentariosSeccion({ projectId }: Props) {
  const { user, isAuthenticated } = useAuth();
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    commentsAPI.list(projectId)
      .then(setComentarios)
      .catch(() => setComentarios([]))
      .finally(() => setLoading(false));
  }, [projectId]);

  const handleEnviar = useCallback(async () => {
    if (!user || !texto.trim()) return;
    if (texto.trim().length < 5) { setError("El comentario es muy corto."); return; }
    if (contieneOfensa(texto)) {
      setError("Tu comentario contiene lenguaje inapropiado. Por favor, exprésate con respeto.");
      return;
    }
    setError("");
    setEnviando(true);
    try {
      const nuevo = await commentsAPI.add(projectId, {
        authorId: user.id,
        authorName: user.name,
        authorAvatar: user.avatar,
        text: texto.trim(),
      });
      setComentarios(prev => [nuevo, ...prev]);
      setTexto("");
    } catch {
      setError("No se pudo enviar el comentario. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }, [user, texto, projectId]);

  const handleEliminar = useCallback(async (id: string) => {
    try {
      await commentsAPI.delete(projectId, id);
      setComentarios(prev => prev.filter(c => c.id !== id));
    } catch { /* silencioso */ }
  }, [projectId]);

  return (
    <div style={{ marginTop: "64px", paddingTop: "48px", borderTop: "1px solid rgba(0,0,0,0.06)" }}>

      {/* Encabezado con Nómada */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "20px", marginBottom: "32px" }}>
        <img
          src="/images/nomada/nomada-sitting.svg"
          alt="Nómada"
          style={{ width: "64px", flexShrink: 0, filter: "drop-shadow(0 4px 12px rgba(0,79,205,0.2))" }}
        />
        <div>
          <h2 style={{ fontFamily: "'Sono', sans-serif", fontSize: "22px", fontWeight: 700, color: "#0a0a0a", marginBottom: "6px" }}>
            Comentarios
          </h2>
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "13px", color: "#888", lineHeight: 1.6 }}>
            <em>"Este proyecto le tomó semanas a alguien. Si vas a dejar algo aquí, que valga la pena leerlo."</em>
            {" "}<span style={{ color: "#004FCD", fontWeight: 600 }}>— Nómada</span>
          </p>
        </div>
      </div>

      {/* Formulario */}
      {isAuthenticated ? (
        <div style={{
          background: "rgba(0,79,205,0.03)",
          border: "1px solid rgba(0,79,205,0.1)",
          borderRadius: "16px",
          padding: "20px",
          marginBottom: "32px",
        }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
            <img src={user!.avatar} alt={user!.name} style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid rgba(0,79,205,0.15)" }} />
            <div style={{ flex: 1 }}>
              <textarea
                value={texto}
                onChange={e => { setTexto(e.target.value); setError(""); }}
                placeholder="Deja una retroalimentación constructiva..."
                rows={3}
                style={{
                  width: "100%", padding: "12px 16px", resize: "none",
                  border: error ? "1.5px solid #ef4444" : "1.5px solid rgba(0,0,0,0.08)",
                  borderRadius: "12px", outline: "none",
                  fontFamily: "'Montserrat', sans-serif", fontSize: "13px",
                  lineHeight: 1.6, color: "#1a1a1a", background: "white",
                  transition: "border-color 0.2s",
                }}
                onFocus={e => { if (!error) e.target.style.borderColor = "#004FCD"; }}
                onBlur={e => { if (!error) e.target.style.borderColor = "rgba(0,0,0,0.08)"; }}
                onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleEnviar(); }}
              />
              {error && (
                <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "12px", color: "#ef4444", marginTop: "6px" }}>
                  ⚠ {error}
                </p>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", color: "#bbb" }}>
                  Ctrl+Enter para enviar · {texto.length}/500
                </span>
                <button
                  onClick={handleEnviar}
                  disabled={enviando || !texto.trim()}
                  style={{
                    padding: "8px 20px", borderRadius: "100px",
                    background: enviando || !texto.trim() ? "rgba(0,79,205,0.3)" : "linear-gradient(135deg, #004FCD, #3b7de8)",
                    color: "#fff", border: "none",
                    fontFamily: "'Montserrat', sans-serif", fontSize: "12px", fontWeight: 600,
                    cursor: enviando || !texto.trim() ? "not-allowed" : "pointer",
                    boxShadow: enviando || !texto.trim() ? "none" : "0 4px 12px rgba(0,79,205,0.25)",
                  }}
                >
                  {enviando ? "Enviando..." : "Comentar →"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: "20px", borderRadius: "12px", background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.06)", marginBottom: "32px", textAlign: "center" }}>
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "13px", color: "#888" }}>
            <a href="/" style={{ color: "#004FCD", textDecoration: "none", fontWeight: 600 }}>Inicia sesión</a> para dejar un comentario.
          </p>
        </div>
      )}

      {/* Lista de comentarios */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "32px", color: "#ccc", fontFamily: "'Montserrat', sans-serif", fontSize: "13px" }}>
          Cargando comentarios...
        </div>
      ) : comentarios.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "14px", color: "rgba(0,0,0,0.3)" }}>
            Nadie ha comentado aún. Sé el primero.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {comentarios.map(c => (
            <div
              key={c.id}
              style={{
                display: "flex", gap: "12px",
                padding: "16px",
                borderRadius: "14px",
                border: "1px solid rgba(0,0,0,0.06)",
                background: "#fff",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(0,79,205,0.15)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(0,0,0,0.06)")}
            >
              <img src={c.authorAvatar || "/images/avatar_default.jpg"} alt={c.authorName} style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "13px", fontWeight: 600, color: "#1a1a1a" }}>{c.authorName}</span>
                  <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", color: "#bbb" }}>
                    {new Date(c.createdAt).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
                <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "13px", color: "#444", lineHeight: 1.7, margin: 0 }}>{c.text}</p>
                {user?.id === c.authorId && (
                  <button
                    onClick={() => handleEliminar(c.id)}
                    style={{ marginTop: "8px", background: "none", border: "none", cursor: "pointer", fontFamily: "'Montserrat', sans-serif", fontSize: "11px", color: "#ef4444", padding: 0 }}
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
