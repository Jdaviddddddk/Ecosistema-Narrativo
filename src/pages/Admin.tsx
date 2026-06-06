import { useState, useEffect, useCallback } from "react";
import { Navigate, Link } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { adminAPI } from "@/lib/api";
import NomadaLoader from "@/components/NomadaLoader";

type Tab = "cola" | "proyectos" | "comentarios" | "usuarios";

const DDM_AREAS = [
  "Diseño análogo","Diseño de interfaces","Diseño web","Fotografía",
  "Cortometraje","Largometraje","Diseño de experiencias","Diseño tipográfico",
  "Diseño de marca","Investigación","Motion Graphics","Animación",
  "Ilustración digital","Diseño editorial","Diseño de empaque",
  "Señalética","Diseño sonoro","Realidad extendida (XR)",
];

const VISIBILITY_OPTIONS = ["Público","Solo comunidad","Privado"];
const STATUS_OPTIONS = ["Publicado","En revisión","Borrador"];

const pill = (label: string, color: string, bg: string) => (
  <span style={{ padding:"3px 10px", borderRadius:"100px", fontFamily:"'Montserrat',sans-serif", fontSize:"11px", fontWeight:600, background:bg, color }}>{label}</span>
);

const statusBadge = (s: string) => {
  if (s === "Publicado") return pill(s, "#166534","#dcfce7");
  if (s === "En revisión") return pill(s, "#92400e","#fef3c7");
  return pill(s, "#374151","#f3f4f6");
};

const scoreBadge = (n: number) => {
  const color = n >= 7 ? "#166534" : n >= 5 ? "#92400e" : "#991b1b";
  const bg    = n >= 7 ? "#dcfce7" : n >= 5 ? "#fef3c7" : "#fee2e2";
  return pill(`${n}/10`, color, bg);
};

// ─── Panel de curaduría IA ───────────────────────────────────────────────────
function CurationPanel({ project, onApply }: { project: any; onApply: (updates: any) => void }) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const analyze = async () => {
    setLoading(true); setError(""); setAnalysis(null);
    try {
      const res = await adminAPI.curateProject(project);
      if (res.error) throw new Error(res.error);
      setAnalysis(res.analysis);
    } catch (e: any) {
      setError(e.message || "Error al analizar");
    } finally { setLoading(false); }
  };

  const handleApply = () => {
    if (!analysis) return;
    onApply({
      area:       analysis.categoríaSugerida,
      visibility: analysis.visibilidadSugerida,
      status:     analysis.aprobacion === "publicar" ? "Publicado" : "En revisión",
      collections: analysis.etiquetas || [],
    });
  };

  return (
    <div style={{ background:"rgba(0,79,205,0.04)", border:"1px solid rgba(0,79,205,0.15)", borderRadius:"14px", padding:"20px", marginTop:"16px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"12px" }}>
        <img src="/images/nomada-frames/f01.png" alt="" style={{ width:"32px", imageRendering:"pixelated" }} />
        <div>
          <p style={{ fontFamily:"'Sono',sans-serif", fontSize:"15px", fontWeight:700, color:"#004FCD" }}>Curaduría con IA</p>
          <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"11px", color:"#888" }}>Claude analiza categoría, calidad y visibilidad sugerida</p>
        </div>
        <button
          onClick={analyze} disabled={loading}
          style={{ marginLeft:"auto", padding:"8px 18px", borderRadius:"100px", background:"linear-gradient(135deg,#004FCD,#3b7de8)", color:"#fff", border:"none", fontFamily:"'Montserrat',sans-serif", fontSize:"12px", fontWeight:600, cursor:loading?"wait":"pointer" }}
        >
          {loading ? "Analizando..." : analysis ? "Re-analizar" : "✦ Analizar"}
        </button>
      </div>

      {loading && <NomadaLoader mensaje="Claude está revisando el proyecto..." fullScreen={false} size={48} />}
      {error && <p style={{ color:"#dc2626", fontFamily:"'Montserrat',sans-serif", fontSize:"12px" }}>⚠ {error}</p>}

      {analysis && (
        <div>
          {/* Puntaje y aprobación */}
          <div style={{ display:"flex", gap:"10px", flexWrap:"wrap", marginBottom:"14px" }}>
            {scoreBadge(analysis.puntaje)}
            {pill(analysis.calidadGeneral, "#1d4ed8","#eff6ff")}
            {analysis.aprobacion === "publicar"  && pill("✓ Publicar",  "#166534","#dcfce7")}
            {analysis.aprobacion === "revisar"   && pill("⚠ Revisar",   "#92400e","#fef3c7")}
            {analysis.aprobacion === "rechazar"  && pill("✗ Rechazar",  "#991b1b","#fee2e2")}
          </div>

          {/* Resumen */}
          <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"13px", color:"#444", lineHeight:1.6, marginBottom:"12px", fontStyle:"italic" }}>
            "{analysis.resumen}"
          </p>

          {/* Sugerencias */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"14px" }}>
            <div style={{ padding:"12px", borderRadius:"10px", background:"rgba(34,197,94,0.05)", border:"1px solid rgba(34,197,94,0.2)" }}>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"11px", fontWeight:700, color:"#166534", marginBottom:"6px", textTransform:"uppercase", letterSpacing:"0.06em" }}>Fortalezas</p>
              {analysis.fortalezas?.map((f: string, i: number) => (
                <p key={i} style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"12px", color:"#444", marginBottom:"3px" }}>✓ {f}</p>
              ))}
            </div>
            <div style={{ padding:"12px", borderRadius:"10px", background:"rgba(245,158,11,0.05)", border:"1px solid rgba(245,158,11,0.2)" }}>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"11px", fontWeight:700, color:"#92400e", marginBottom:"6px", textTransform:"uppercase", letterSpacing:"0.06em" }}>Observaciones</p>
              {analysis.observaciones?.map((o: string, i: number) => (
                <p key={i} style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"12px", color:"#444", marginBottom:"3px" }}>• {o}</p>
              ))}
            </div>
          </div>

          {/* Sugerencias de cambio */}
          <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", marginBottom:"14px", padding:"10px", background:"rgba(0,0,0,0.02)", borderRadius:"10px" }}>
            <span style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"11px", color:"#888" }}>Sugerencias:</span>
            <span style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"12px", color:"#004FCD", fontWeight:600 }}>📂 {analysis.categoríaSugerida}</span>
            <span style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"12px", color:"#555" }}>·</span>
            <span style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"12px", color:"#004FCD", fontWeight:600 }}>👁 {analysis.visibilidadSugerida}</span>
            {analysis.etiquetas?.map((t: string) => (
              <span key={t} style={{ padding:"2px 8px", borderRadius:"100px", background:"rgba(0,79,205,0.08)", color:"#004FCD", fontFamily:"'Montserrat',sans-serif", fontSize:"11px" }}>{t}</span>
            ))}
          </div>

          <button
            onClick={handleApply}
            style={{ padding:"9px 20px", borderRadius:"100px", background:"#004FCD", color:"#fff", border:"none", fontFamily:"'Montserrat',sans-serif", fontSize:"12px", fontWeight:600, cursor:"pointer" }}
          >
            Aplicar sugerencias de IA →
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Admin Dashboard ─────────────────────────────────────────────────────────
export default function Admin() {
  const { isAdmin, user, credential } = useAuth();
  const [tab, setTab]           = useState<Tab>("cola");
  const [projects, setProjects] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [users, setUsers]       = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState("");

  if (!isAdmin) return <Navigate to="/" replace />;

  useEffect(() => {
    if (!credential) return;
    Promise.all([
      adminAPI.getProjects(credential).catch(() => []),
      adminAPI.getComments(credential).catch(() => []),
      adminAPI.getUsers(credential).catch(() => []),
    ]).then(([p, c, u]) => {
      setProjects(Array.isArray(p) ? p : []);
      setComments(Array.isArray(c) ? c : []);
      setUsers(Array.isArray(u) ? u : []);
    }).finally(() => setLoading(false));
  }, []);

  const reviewQueue = projects.filter(p => p.status === "En revisión");

  const flash = (text: string) => { setMsg(text); setTimeout(() => setMsg(""), 3000); };

  const updateProject = useCallback(async (id: string, updates: any) => {
    if (!credential) return;
    setSaving(true);
    try {
      const updated = await adminAPI.updateProject(id, updates, credential);
      setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
      if (selected?.id === id) setSelected((prev: any) => ({ ...prev, ...updated }));
      flash("✓ Proyecto actualizado");
    } catch { flash("✗ Error al actualizar"); }
    finally { setSaving(false); }
  }, [selected]);

  const deleteProject = useCallback(async (id: string) => {
    if (!confirm("¿Eliminar este proyecto?")) return;
    await adminAPI.deleteProject(id, credential ?? '').catch(() => {});
    setProjects(prev => prev.filter(p => p.id !== id));
    if (selected?.id === id) setSelected(null);
    flash("✓ Proyecto eliminado");
  }, [selected]);

  const deleteComment = useCallback(async (projectId: string, commentId: string) => {
    if (!confirm("¿Eliminar este comentario?")) return;
    await adminAPI.deleteComment(projectId, commentId).catch(() => {});
    setComments(prev => prev.filter(c => c.id !== commentId));
    flash("✓ Comentario eliminado");
  }, []);

  const deleteUser = useCallback(async (id: string) => {
    if (!confirm("¿Eliminar este usuario? Sus proyectos no se eliminan.")) return;
    await adminAPI.deleteUser(id, credential ?? '').catch(() => {});
    setUsers(prev => prev.filter(u => u.id !== id));
    flash("✓ Usuario eliminado");
  }, []);

  const tabStyle = (t: Tab) => ({
    padding:"10px 20px", border:"none", background:"transparent", cursor:"pointer",
    fontFamily:"'Montserrat',sans-serif", fontSize:"13px", fontWeight: tab===t ? 700 : 400,
    color: tab===t ? "#004FCD" : "#888",
    borderBottom: tab===t ? "2px solid #004FCD" : "2px solid transparent",
    transition:"all 0.2s",
  } as React.CSSProperties);

  return (
    <div style={{ minHeight:"100vh", background:"#f8faff", paddingTop:"72px" }}>
      {/* Header */}
      <div style={{ background:"#fff", borderBottom:"1px solid rgba(0,0,0,0.08)", padding:"16px 20px", display:"flex", alignItems:"center", gap:"12px" }}>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontFamily:"'Sono',sans-serif", fontSize:"18px", fontWeight:700, color:"#0a0a0a", margin:0 }}>Panel Admin</p>
          <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"11px", color:"#888", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.name} · {user?.email}</p>
        </div>
        <img src="/images/nomada-frames/f09.png" alt="" style={{ width:"36px", imageRendering:"pixelated", flexShrink:0 }} />
      </div>

      {/* Flash msg */}
      {msg && (
        <div style={{ position:"fixed", top:"80px", right:"16px", zIndex:999, padding:"10px 20px", borderRadius:"100px", background: msg.startsWith("✓") ? "#dcfce7" : "#fee2e2", color: msg.startsWith("✓") ? "#166534" : "#991b1b", fontFamily:"'Montserrat',sans-serif", fontSize:"13px", fontWeight:600, boxShadow:"0 4px 16px rgba(0,0,0,0.1)" }}>
          {msg}
        </div>
      )}

      {/* Tabs */}
      <div style={{ background:"#fff", borderBottom:"1px solid rgba(0,0,0,0.06)", padding:"0 12px", display:"flex", gap:"2px", overflowX:"auto" }}>
        <button style={tabStyle("cola")} onClick={() => setTab("cola")}>
          Cola de revisión {reviewQueue.length > 0 && <span style={{ marginLeft:"6px", padding:"1px 7px", borderRadius:"100px", background:"#ef4444", color:"#fff", fontSize:"10px" }}>{reviewQueue.length}</span>}
        </button>
        <button style={tabStyle("proyectos")} onClick={() => setTab("proyectos")}>Proyectos ({projects.length})</button>
        <button style={tabStyle("comentarios")} onClick={() => setTab("comentarios")}>Comentarios ({comments.length})</button>
        <button style={tabStyle("usuarios")} onClick={() => setTab("usuarios")}>Usuarios ({users.length})</button>
      </div>

      {loading && <NomadaLoader mensaje="Cargando datos..." fullScreen={false} />}

      <div style={{ maxWidth:"1400px", margin:"0 auto", padding:"16px", display:"grid", gridTemplateColumns: selected ? "minmax(0,1fr) min(420px,100%)" : "1fr", gap:"16px" }}>

        {/* ── COLA DE REVISIÓN ─────────────────────────────────────────────── */}
        {tab === "cola" && (
          <div>
            <h2 style={{ fontFamily:"'Sono',sans-serif", fontSize:"20px", color:"#0a0a0a", marginBottom:"16px" }}>Cola de revisión</h2>
            {reviewQueue.length === 0 ? (
              <div style={{ padding:"60px", textAlign:"center", background:"#fff", borderRadius:"16px", border:"1px solid rgba(0,0,0,0.07)" }}>
                <img src="/images/nomada-frames/f05.png" alt="" style={{ width:"56px", imageRendering:"pixelated", marginBottom:"12px" }} />
                <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"14px", color:"rgba(0,0,0,0.4)" }}>No hay proyectos pendientes de revisión ✓</p>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
                {reviewQueue.map(p => (
                  <div
                    key={p.id}
                    onClick={() => setSelected(selected?.id === p.id ? null : p)}
                    style={{ padding:"16px 20px", background:"#fff", borderRadius:"14px", border: selected?.id===p.id ? "1.5px solid #004FCD" : "1px solid rgba(0,0,0,0.07)", cursor:"pointer", transition:"all 0.2s", display:"flex", gap:"16px", alignItems:"center" }}
                  >
                    {p.thumbnail && <img src={p.thumbnail} alt="" style={{ width:"64px", height:"48px", objectFit:"cover", borderRadius:"8px", flexShrink:0 }} />}
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontFamily:"'Sono',sans-serif", fontSize:"16px", color:"#0a0a0a", marginBottom:"2px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.title}</p>
                      <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"12px", color:"#888" }}>{p.author} · {p.area} · {p.semester} sem.</p>
                    </div>
                    <div style={{ display:"flex", gap:"8px", flexShrink:0 }}>
                      <button onClick={e => { e.stopPropagation(); updateProject(p.id, { status:"Publicado" }); }} style={{ padding:"6px 14px", borderRadius:"100px", background:"#dcfce7", color:"#166534", border:"none", fontFamily:"'Montserrat',sans-serif", fontSize:"12px", fontWeight:600, cursor:"pointer" }}>✓ Publicar</button>
                      <button onClick={e => { e.stopPropagation(); deleteProject(p.id); }} style={{ padding:"6px 14px", borderRadius:"100px", background:"#fee2e2", color:"#991b1b", border:"none", fontFamily:"'Montserrat',sans-serif", fontSize:"12px", fontWeight:600, cursor:"pointer" }}>✗ Rechazar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PROYECTOS ────────────────────────────────────────────────────── */}
        {tab === "proyectos" && (
          <div>
            <h2 style={{ fontFamily:"'Sono',sans-serif", fontSize:"20px", color:"#0a0a0a", marginBottom:"16px" }}>Todos los proyectos</h2>
            <div style={{ background:"#fff", borderRadius:"14px", border:"1px solid rgba(0,0,0,0.07)", overflow:"hidden" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background:"rgba(0,0,0,0.02)", borderBottom:"1px solid rgba(0,0,0,0.07)" }}>
                    {["Proyecto","Autor","Área","Estado","Visibilidad","Acciones"].map(h => (
                      <th key={h} style={{ padding:"12px 16px", fontFamily:"'Montserrat',sans-serif", fontSize:"11px", color:"#888", textTransform:"uppercase", letterSpacing:"0.06em", textAlign:"left", fontWeight:600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p, i) => (
                    <tr key={p.id} style={{ borderBottom:"1px solid rgba(0,0,0,0.05)", background: i%2===0 ? "#fff" : "rgba(0,0,0,0.01)" }}>
                      <td style={{ padding:"12px 16px" }}>
                        <button onClick={() => setSelected(selected?.id===p.id ? null : p)} style={{ fontFamily:"'Sono',sans-serif", fontSize:"14px", color:"#004FCD", background:"none", border:"none", cursor:"pointer", textAlign:"left", padding:0 }}>
                          {p.title?.slice(0,40)}{p.title?.length>40?"…":""}
                        </button>
                      </td>
                      <td style={{ padding:"12px 16px", fontFamily:"'Montserrat',sans-serif", fontSize:"12px", color:"#555" }}>{p.author}</td>
                      <td style={{ padding:"12px 16px", fontFamily:"'Montserrat',sans-serif", fontSize:"12px", color:"#555" }}>{p.area}</td>
                      <td style={{ padding:"12px 16px" }}>{statusBadge(p.status)}</td>
                      <td style={{ padding:"12px 16px", fontFamily:"'Montserrat',sans-serif", fontSize:"12px", color:"#555" }}>{p.visibility}</td>
                      <td style={{ padding:"12px 16px" }}>
                        <div style={{ display:"flex", gap:"6px" }}>
                          <Link to={`/projects/${p.id}`} target="_blank" style={{ padding:"4px 10px", borderRadius:"8px", border:"1px solid rgba(0,0,0,0.12)", color:"#555", textDecoration:"none", fontFamily:"'Montserrat',sans-serif", fontSize:"11px" }}>Ver</Link>
                          <button onClick={() => deleteProject(p.id)} style={{ padding:"4px 10px", borderRadius:"8px", background:"#fee2e2", color:"#991b1b", border:"none", fontFamily:"'Montserrat',sans-serif", fontSize:"11px", cursor:"pointer" }}>Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── COMENTARIOS ──────────────────────────────────────────────────── */}
        {tab === "comentarios" && (
          <div>
            <h2 style={{ fontFamily:"'Sono',sans-serif", fontSize:"20px", color:"#0a0a0a", marginBottom:"16px" }}>Moderación de comentarios</h2>
            {comments.length === 0 ? (
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"14px", color:"rgba(0,0,0,0.4)", textAlign:"center", padding:"40px 0" }}>No hay comentarios todavía.</p>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                {comments.map(c => (
                  <div key={c.id} style={{ padding:"14px 16px", background:"#fff", borderRadius:"12px", border:"1px solid rgba(0,0,0,0.07)", display:"flex", gap:"12px", alignItems:"flex-start" }}>
                    <img src={c.authorAvatar||"/images/avatar_default.jpg"} alt="" style={{ width:"32px", height:"32px", borderRadius:"50%", objectFit:"cover", flexShrink:0 }} />
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", gap:"8px", alignItems:"center", marginBottom:"4px" }}>
                        <span style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"12px", fontWeight:600, color:"#1a1a1a" }}>{c.authorName}</span>
                        <span style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"11px", color:"#bbb" }}>{new Date(c.createdAt).toLocaleDateString("es-CO")}</span>
                        <Link to={`/projects/${c.projectId}`} target="_blank" style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"10px", color:"#004FCD", textDecoration:"none" }}>Ver proyecto ↗</Link>
                      </div>
                      <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"13px", color:"#444", lineHeight:1.6, margin:0 }}>{c.text}</p>
                    </div>
                    <button onClick={() => deleteComment(c.projectId, c.id)} style={{ padding:"5px 12px", borderRadius:"8px", background:"#fee2e2", color:"#991b1b", border:"none", fontFamily:"'Montserrat',sans-serif", fontSize:"11px", cursor:"pointer", flexShrink:0 }}>Eliminar</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── USUARIOS ─────────────────────────────────────────────────────── */}
        {tab === "usuarios" && (
          <div>
            <h2 style={{ fontFamily:"'Sono',sans-serif", fontSize:"20px", color:"#0a0a0a", marginBottom:"16px" }}>Usuarios registrados</h2>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:"12px" }}>
              {users.map(u => (
                <div key={u.id} style={{ padding:"16px", background:"#fff", borderRadius:"14px", border:"1px solid rgba(0,0,0,0.07)", display:"flex", gap:"12px", alignItems:"center" }}>
                  {u.avatar
                    ? <img src={u.avatar} alt="" style={{ width:"40px", height:"40px", borderRadius:"10px", objectFit:"cover", flexShrink:0 }} />
                    : <div style={{ width:"40px", height:"40px", borderRadius:"10px", background:"linear-gradient(135deg,#004FCD,#3b7de8)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontFamily:"'Sono',sans-serif", fontSize:"16px", fontWeight:700, flexShrink:0 }}>
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                  }
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontFamily:"'Sono',sans-serif", fontSize:"14px", color:"#0a0a0a", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.name}</p>
                    <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"11px", color:"#888", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.email}</p>
                    {u.isCommunityMember && <span style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"10px", color:"#004FCD" }}>🏫 DDM</span>}
                  </div>
                  <div style={{ display:"flex", gap:"4px", flexShrink:0 }}>
                    <Link to={`/profile/${u.id}`} target="_blank" style={{ padding:"4px 8px", borderRadius:"8px", border:"1px solid rgba(0,0,0,0.12)", color:"#555", textDecoration:"none", fontSize:"11px", fontFamily:"'Montserrat',sans-serif" }}>Ver</Link>
                    {u.email !== user?.email && (
                      <button onClick={() => deleteUser(u.id)} style={{ padding:"4px 8px", borderRadius:"8px", background:"#fee2e2", color:"#991b1b", border:"none", fontSize:"11px", fontFamily:"'Montserrat',sans-serif", cursor:"pointer" }}>✕</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PANEL LATERAL DE EDICIÓN ──────────────────────────────────────── */}
        {selected && (
          <div style={{ background:"#fff", borderRadius:"16px", border:"1px solid rgba(0,0,0,0.09)", padding:"20px", height:"fit-content", position:"sticky", top:"80px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
              <p style={{ fontFamily:"'Sono',sans-serif", fontSize:"16px", fontWeight:700, color:"#0a0a0a" }}>Editar proyecto</p>
              <button onClick={() => setSelected(null)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:"18px", color:"#aaa" }}>×</button>
            </div>

            {selected.thumbnail && (
              <img src={selected.thumbnail} alt="" style={{ width:"100%", aspectRatio:"4/3", objectFit:"cover", borderRadius:"10px", marginBottom:"14px" }} />
            )}

            <p style={{ fontFamily:"'Sono',sans-serif", fontSize:"15px", color:"#0a0a0a", marginBottom:"4px" }}>{selected.title}</p>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"12px", color:"#888", marginBottom:"16px" }}>por {selected.author}</p>

            {/* Categoría */}
            <div style={{ marginBottom:"12px" }}>
              <label style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"11px", fontWeight:600, color:"#555", textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:"6px" }}>Categoría</label>
              <select
                value={selected.area || ""}
                onChange={e => setSelected((p: any) => ({ ...p, area: e.target.value }))}
                style={{ width:"100%", padding:"9px 12px", borderRadius:"10px", border:"1.5px solid rgba(0,0,0,0.1)", fontFamily:"'Montserrat',sans-serif", fontSize:"13px", outline:"none" }}
              >
                {DDM_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            {/* Estado */}
            <div style={{ marginBottom:"12px" }}>
              <label style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"11px", fontWeight:600, color:"#555", textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:"6px" }}>Estado</label>
              <div style={{ display:"flex", gap:"6px" }}>
                {STATUS_OPTIONS.map(s => (
                  <button key={s} onClick={() => setSelected((p: any) => ({ ...p, status: s }))}
                    style={{ flex:1, padding:"7px 4px", borderRadius:"10px", border: selected.status===s ? "1.5px solid #004FCD" : "1.5px solid rgba(0,0,0,0.1)", background: selected.status===s ? "rgba(0,79,205,0.07)" : "transparent", color: selected.status===s ? "#004FCD" : "#555", fontFamily:"'Montserrat',sans-serif", fontSize:"11px", fontWeight: selected.status===s ? 700 : 400, cursor:"pointer" }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Visibilidad */}
            <div style={{ marginBottom:"16px" }}>
              <label style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"11px", fontWeight:600, color:"#555", textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:"6px" }}>Visibilidad</label>
              <div style={{ display:"flex", gap:"6px" }}>
                {VISIBILITY_OPTIONS.map(v => (
                  <button key={v} onClick={() => setSelected((p: any) => ({ ...p, visibility: v }))}
                    style={{ flex:1, padding:"7px 4px", borderRadius:"10px", border: selected.visibility===v ? "1.5px solid #004FCD" : "1.5px solid rgba(0,0,0,0.1)", background: selected.visibility===v ? "rgba(0,79,205,0.07)" : "transparent", color: selected.visibility===v ? "#004FCD" : "#555", fontFamily:"'Montserrat',sans-serif", fontSize:"11px", fontWeight: selected.visibility===v ? 700 : 400, cursor:"pointer" }}>
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => updateProject(selected.id, { area: selected.area, status: selected.status, visibility: selected.visibility })}
              disabled={saving}
              style={{ width:"100%", padding:"11px", borderRadius:"100px", background:"linear-gradient(135deg,#004FCD,#3b7de8)", color:"#fff", border:"none", fontFamily:"'Montserrat',sans-serif", fontSize:"13px", fontWeight:700, cursor:saving?"wait":"pointer", marginBottom:"8px" }}
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>

            <button
              onClick={() => deleteProject(selected.id)}
              style={{ width:"100%", padding:"11px", borderRadius:"100px", background:"#fee2e2", color:"#991b1b", border:"none", fontFamily:"'Montserrat',sans-serif", fontSize:"13px", fontWeight:600, cursor:"pointer" }}
            >
              Eliminar proyecto
            </button>

            {/* IA Curation */}
            <CurationPanel
              project={selected}
              onApply={(updates) => {
                setSelected((p: any) => ({ ...p, ...updates }));
                updateProject(selected.id, updates);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
