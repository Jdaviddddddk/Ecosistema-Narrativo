import { useState, useEffect, useCallback } from "react";
import { commentsAPI } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

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
  parentId?: string;
}

interface ComentarioConReplies extends Comentario {
  replies: Comentario[];
}

// Clave localStorage para guardar relaciones parentId que el backend puede no persistir
function replyKey(projectId: string) { return `nexo_replies_${projectId}`; }

function saveReplyRelation(projectId: string, commentId: string, parentId: string) {
  const map: Record<string, string> = JSON.parse(localStorage.getItem(replyKey(projectId)) || "{}");
  map[commentId] = parentId;
  localStorage.setItem(replyKey(projectId), JSON.stringify(map));
}

function getReplyMap(projectId: string): Record<string, string> {
  return JSON.parse(localStorage.getItem(replyKey(projectId)) || "{}");
}

interface Props {
  projectId: string;
}

// ─── Formulario de texto reutilizable ────────────────────────────────────────
function TextoForm({
  avatar,
  placeholder,
  onSubmit,
  onCancel,
  compact = false,
}: {
  avatar: string;
  placeholder: string;
  onSubmit: (text: string) => Promise<void>;
  onCancel?: () => void;
  compact?: boolean;
}) {
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const handleEnviar = async () => {
    if (!texto.trim()) return;
    if (texto.trim().length < 5) { setError("El texto es muy corto."); return; }
    if (contieneOfensa(texto)) {
      setError("Tu mensaje contiene lenguaje inapropiado. Por favor, exprésate con respeto.");
      return;
    }
    setError("");
    setEnviando(true);
    try {
      await onSubmit(texto.trim());
      setTexto("");
    } catch {
      setError("No se pudo enviar. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
      <img
        src={avatar}
        alt=""
        style={{
          width: compact ? "28px" : "36px",
          height: compact ? "28px" : "36px",
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
          border: "2px solid rgba(0,79,205,0.15)",
          marginTop: "2px",
        }}
      />
      <div style={{ flex: 1 }}>
        <textarea
          value={texto}
          onChange={e => { setTexto(e.target.value); setError(""); }}
          placeholder={placeholder}
          rows={compact ? 2 : 3}
          style={{
            width: "100%",
            padding: "10px 14px",
            resize: "none",
            border: error ? "1.5px solid #ef4444" : "1.5px solid rgba(0,0,0,0.08)",
            borderRadius: "12px",
            outline: "none",
            fontFamily: "'Montserrat', sans-serif",
            fontSize: "13px",
            lineHeight: 1.6,
            color: "#1a1a1a",
            background: "white",
            transition: "border-color 0.2s",
          }}
          onFocus={e => { if (!error) e.target.style.borderColor = "#004FCD"; }}
          onBlur={e => { if (!error) e.target.style.borderColor = "rgba(0,0,0,0.08)"; }}
          onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleEnviar(); }}
        />
        {error && (
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "12px", color: "#ef4444", marginTop: "4px" }}>
            ⚠ {error}
          </p>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
          {onCancel && (
            <button
              onClick={onCancel}
              style={{
                padding: "6px 14px",
                borderRadius: "100px",
                background: "transparent",
                border: "1px solid rgba(0,0,0,0.12)",
                fontFamily: "'Montserrat', sans-serif",
                fontSize: "12px",
                color: "#888",
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
          )}
          <button
            onClick={handleEnviar}
            disabled={enviando || !texto.trim()}
            style={{
              padding: "6px 18px",
              borderRadius: "100px",
              background: enviando || !texto.trim() ? "rgba(0,79,205,0.3)" : "linear-gradient(135deg, #004FCD, #3b7de8)",
              color: "#fff",
              border: "none",
              fontFamily: "'Montserrat', sans-serif",
              fontSize: "12px",
              fontWeight: 600,
              cursor: enviando || !texto.trim() ? "not-allowed" : "pointer",
              boxShadow: enviando || !texto.trim() ? "none" : "0 4px 12px rgba(0,79,205,0.25)",
            }}
          >
            {enviando ? "Enviando..." : compact ? "Responder →" : "Comentar →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function ComentariosSeccion({ projectId }: Props) {
  const { user, isAuthenticated } = useAuth();
  const [comentarios, setComentarios] = useState<ComentarioConReplies[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

  useEffect(() => {
    commentsAPI.list(projectId)
      .then((all: Comentario[]) => {
        // Combinar parentId del backend con el mapa local (por si el backend no lo guardó)
        const localMap = getReplyMap(projectId);
        const enriched = all.map(c => ({
          ...c,
          parentId: c.parentId || localMap[c.id],
        }));
        const roots = enriched.filter(c => !c.parentId);
        const replies = enriched.filter(c => !!c.parentId);
        setComentarios(
          roots
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map(r => ({
              ...r,
              replies: replies
                .filter(rep => rep.parentId === r.id)
                .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
            }))
        );
      })
      .catch(() => setComentarios([]))
      .finally(() => setLoading(false));
  }, [projectId]);

  const handleNuevoComentario = useCallback(async (text: string) => {
    if (!user) return;
    const nuevo = await commentsAPI.add(projectId, {
      authorId: user.id,
      authorName: user.name,
      authorAvatar: user.avatar,
      text,
    });
    setComentarios(prev => [{ ...nuevo, replies: [] }, ...prev]);
  }, [user, projectId]);

  const handleResponder = useCallback(async (parentId: string, text: string) => {
    if (!user) return;
    const nueva = await commentsAPI.add(projectId, {
      authorId: user.id,
      authorName: user.name,
      authorAvatar: user.avatar,
      text,
      parentId,
    });
    // Guardar relación localmente por si el backend no persiste parentId
    saveReplyRelation(projectId, nueva.id, parentId);
    setComentarios(prev => prev.map(c =>
      c.id === parentId
        ? { ...c, replies: [...c.replies, { ...nueva, parentId }] }
        : c
    ));
    setReplyingTo(null);
    setExpandedReplies(prev => new Set([...prev, parentId]));
  }, [user, projectId]);

  const handleEliminar = useCallback(async (id: string, parentId?: string) => {
    await commentsAPI.delete(projectId, id).catch(() => {});
    if (parentId) {
      setComentarios(prev => prev.map(c =>
        c.id === parentId ? { ...c, replies: c.replies.filter(r => r.id !== id) } : c
      ));
    } else {
      setComentarios(prev => prev.filter(c => c.id !== id));
    }
  }, [projectId]);

  const toggleReplies = (id: string) => {
    setExpandedReplies(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

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

      {/* Formulario principal */}
      {isAuthenticated ? (
        <div style={{
          background: "rgba(0,79,205,0.03)",
          border: "1px solid rgba(0,79,205,0.1)",
          borderRadius: "16px",
          padding: "20px",
          marginBottom: "32px",
        }}>
          <TextoForm
            avatar={user!.avatar}
            placeholder="Deja una retroalimentación constructiva..."
            onSubmit={handleNuevoComentario}
          />
        </div>
      ) : (
        <div style={{ padding: "20px", borderRadius: "12px", background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.06)", marginBottom: "32px", textAlign: "center" }}>
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "13px", color: "#888" }}>
            <a href="/" style={{ color: "#004FCD", textDecoration: "none", fontWeight: 600 }}>Inicia sesión</a> para dejar un comentario.
          </p>
        </div>
      )}

      {/* Lista */}
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
            <div key={c.id}>
              {/* Comentario raíz */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
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
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "13px", fontWeight: 600, color: "#1a1a1a" }}>{c.authorName}</span>
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", color: "#bbb" }}>
                      {new Date(c.createdAt).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "13px", color: "#444", lineHeight: 1.7, margin: 0 }}>{c.text}</p>

                  {/* Acciones */}
                  <div style={{ display: "flex", gap: "12px", marginTop: "10px", alignItems: "center" }}>
                    {isAuthenticated && (
                      <button
                        onClick={() => setReplyingTo(replyingTo === c.id ? null : c.id)}
                        style={{
                          background: "none", border: "none", cursor: "pointer",
                          fontFamily: "'Montserrat', sans-serif", fontSize: "12px",
                          color: replyingTo === c.id ? "#004FCD" : "#aaa",
                          fontWeight: 600, padding: 0,
                          transition: "color 0.2s",
                        }}
                      >
                        ↩ Responder
                      </button>
                    )}
                    {c.replies.length > 0 && (
                      <button
                        onClick={() => toggleReplies(c.id)}
                        style={{
                          background: "none", border: "none", cursor: "pointer",
                          fontFamily: "'Montserrat', sans-serif", fontSize: "12px",
                          color: "#888", padding: 0,
                        }}
                      >
                        {expandedReplies.has(c.id)
                          ? `▴ Ocultar respuestas`
                          : `▾ ${c.replies.length} respuesta${c.replies.length !== 1 ? "s" : ""}`}
                      </button>
                    )}
                    {user?.id === c.authorId && (
                      <button
                        onClick={() => handleEliminar(c.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Montserrat', sans-serif", fontSize: "11px", color: "#ef4444", padding: 0, marginLeft: "auto" }}
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Respuestas */}
              {expandedReplies.has(c.id) && c.replies.length > 0 && (
                <div style={{ marginLeft: "48px", marginTop: "8px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  {c.replies.map(r => (
                    <div
                      key={r.id}
                      style={{
                        display: "flex", gap: "10px",
                        padding: "12px 14px",
                        borderRadius: "12px",
                        border: "1px solid rgba(0,0,0,0.05)",
                        background: "rgba(0,79,205,0.02)",
                      }}
                    >
                      <img src={r.authorAvatar || "/images/avatar_default.jpg"} alt={r.authorName} style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                          <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "12px", fontWeight: 600, color: "#1a1a1a" }}>{r.authorName}</span>
                          <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", color: "#bbb" }}>
                            {new Date(r.createdAt).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "13px", color: "#444", lineHeight: 1.7, margin: 0 }}>{r.text}</p>
                        {user?.id === r.authorId && (
                          <button
                            onClick={() => handleEliminar(r.id, c.id)}
                            style={{ marginTop: "6px", background: "none", border: "none", cursor: "pointer", fontFamily: "'Montserrat', sans-serif", fontSize: "11px", color: "#ef4444", padding: 0 }}
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Formulario de respuesta */}
              {replyingTo === c.id && isAuthenticated && (
                <div style={{
                  marginLeft: "48px", marginTop: "10px",
                  background: "rgba(0,79,205,0.03)",
                  border: "1px solid rgba(0,79,205,0.1)",
                  borderRadius: "14px",
                  padding: "14px",
                }}>
                  <TextoForm
                    avatar={user!.avatar}
                    placeholder={`Respondiendo a ${c.authorName}...`}
                    compact
                    onSubmit={(text) => handleResponder(c.id, text)}
                    onCancel={() => setReplyingTo(null)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
