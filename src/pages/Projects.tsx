import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { projectsAPI } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import NomadaGuia from "@/components/NomadaGuia";
import NomadaLoader from "@/components/NomadaLoader";

const DDM_AREAS = [
  "Diseño análogo", "Diseño de interfaces", "Diseño web", "Fotografía",
  "Cortometraje", "Largometraje", "Diseño de experiencias", "Diseño tipográfico",
  "Diseño de marca", "Investigación", "Motion Graphics", "Animación",
  "Ilustración digital", "Diseño editorial", "Diseño de empaque",
  "Señalética", "Diseño sonoro", "Realidad extendida (XR)",
];

const PRODUCTION_STATES = ["Ideación", "En desarrollo", "Prototipo", "En producción", "Finalizado", "Archivado"];
const SEMESTERS = ["1°","2°","3°","4°","5°","6°","7°","8°","9°","10°"];

const selectStyle: React.CSSProperties = {
  fontFamily: "'Montserrat', sans-serif",
  fontSize: "12px",
  padding: "8px 14px",
  borderRadius: "100px",
  border: "1px solid rgba(0,0,0,0.12)",
  background: "white",
  cursor: "pointer",
  outline: "none",
  appearance: "none",
  color: "#333",
};

export default function Projects() {
  const { isAuthenticated, isCommunityMember, user, logout } = useAuth();
  const navigate = useNavigate();

  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const [selectedProduction, setSelectedProduction] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    projectsAPI.list()
      .then((data: any[]) => setAllProjects(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Visibilidad: ocultar "Solo comunidad" a no-miembros
  const visibleProjects = useMemo(() => {
    return allProjects.filter(p => {
      if (p.visibility === "Privado") return false;
      if (p.visibility === "Solo comunidad" && !isCommunityMember) return false;
      return true;
    });
  }, [allProjects, isCommunityMember]);

  const filteredProjects = useMemo(() => {
    return visibleProjects.filter((p) => {
      const matchArea = !selectedArea || p.area === selectedArea;
      const matchSem = !selectedSemester || p.semester === selectedSemester;
      const matchProd = !selectedProduction || p.productionStatus === selectedProduction;
      const matchSearch = !searchQuery ||
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.subject?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchArea && matchSem && matchProd && matchSearch;
    });
  }, [visibleProjects, selectedArea, selectedSemester, selectedProduction, searchQuery]);

  const activeFilters = [selectedArea, selectedSemester, selectedProduction, searchQuery].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedArea(null);
    setSelectedSemester(null);
    setSelectedProduction(null);
    setSearchQuery("");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa" }}>

      {/* ── Header sticky ─────────────────────────────────────────────────── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(255,255,255,0.96)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0,0,0,0.07)",
        padding: "14px 32px",
      }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>

          {/* Logo + nav */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <Link to="/" style={{ textDecoration: "none" }}>
              <img src="/images/logo-nexo.png" alt="NEXO" style={{ height: "32px", width: "auto" }} />
            </Link>
            <Link to="/projects" style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "13px", color: "#004FCD", fontWeight: 600, textDecoration: "none" }}>Proyectos</Link>
            <Link to="/info" style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.5)", textDecoration: "none" }}>Info</Link>
          </div>

          {/* Search + auth */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Buscar proyectos o autores..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  ...selectStyle, borderRadius: "12px",
                  padding: "9px 16px 9px 36px", width: "260px",
                }}
              />
              <svg style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#aaa" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </div>

            {isAuthenticated ? (
              <>
                <button onClick={() => navigate("/yo")} style={{ ...selectStyle, display: "flex", alignItems: "center", gap: "6px", border: "none", background: "transparent" }}>
                  <img src={user?.avatar} alt={user?.name} style={{ width: "26px", height: "26px", borderRadius: "50%", objectFit: "cover" }} />
                  <span style={{ color: "rgba(0,0,0,0.7)" }}>Yo</span>
                </button>
                <button onClick={logout} style={{ ...selectStyle, border: "none", background: "transparent", color: "rgba(0,0,0,0.4)" }}>Salir</button>
              </>
            ) : (
              <button onClick={() => navigate("/")} style={{ ...selectStyle, background: "#004FCD", color: "#fff", border: "none" }}>Acceder</button>
            )}
          </div>
        </div>
      </div>

      {/* ── Filtros ───────────────────────────────────────────────────────── */}
      <div style={{ background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.05)", padding: "12px 32px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", marginRight: "4px" }}>Filtrar:</span>

          {/* Área */}
          <div style={{ position: "relative" }}>
            <select value={selectedArea || ""} onChange={(e) => setSelectedArea(e.target.value || null)} style={{ ...selectStyle, paddingRight: "28px", background: selectedArea ? "rgba(0,79,205,0.06)" : "white", borderColor: selectedArea ? "#004FCD" : "rgba(0,0,0,0.12)", color: selectedArea ? "#004FCD" : "#333", fontWeight: selectedArea ? 600 : 400 }}>
              <option value="">Categoría</option>
              {DDM_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <span style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", fontSize: "9px", color: "#999" }}>▼</span>
          </div>

          {/* Semestre */}
          <div style={{ position: "relative" }}>
            <select value={selectedSemester || ""} onChange={(e) => setSelectedSemester(e.target.value || null)} style={{ ...selectStyle, paddingRight: "28px", background: selectedSemester ? "rgba(0,79,205,0.06)" : "white", borderColor: selectedSemester ? "#004FCD" : "rgba(0,0,0,0.12)", color: selectedSemester ? "#004FCD" : "#333", fontWeight: selectedSemester ? 600 : 400 }}>
              <option value="">Semestre</option>
              {SEMESTERS.map(s => <option key={s} value={s}>{s} sem.</option>)}
            </select>
            <span style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", fontSize: "9px", color: "#999" }}>▼</span>
          </div>

          {/* Estado de producción */}
          <div style={{ position: "relative" }}>
            <select value={selectedProduction || ""} onChange={(e) => setSelectedProduction(e.target.value || null)} style={{ ...selectStyle, paddingRight: "28px", background: selectedProduction ? "rgba(0,79,205,0.06)" : "white", borderColor: selectedProduction ? "#004FCD" : "rgba(0,0,0,0.12)", color: selectedProduction ? "#004FCD" : "#333", fontWeight: selectedProduction ? 600 : 400 }}>
              <option value="">Estado del producto</option>
              {PRODUCTION_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <span style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", fontSize: "9px", color: "#999" }}>▼</span>
          </div>

          {activeFilters > 0 && (
            <button onClick={clearFilters} style={{ ...selectStyle, color: "#ef4444", borderColor: "rgba(239,68,68,0.2)", display: "flex", alignItems: "center", gap: "4px" }}>
              <span>✕</span> Limpiar ({activeFilters})
            </button>
          )}

          {/* Badge comunidad */}
          {!isCommunityMember && (
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "100px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
              <span style={{ fontSize: "12px" }}>🔒</span>
              <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", color: "#92400e" }}>Algunos proyectos son solo para la comunidad universitaria</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Conteo ────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "20px 32px 0" }}>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.4)" }}>
          {loading ? "Cargando..." : `${filteredProjects.length} proyecto${filteredProjects.length !== 1 ? "s" : ""}`}
          {activeFilters > 0 && <span style={{ color: "#004FCD" }}> · {activeFilters} filtro{activeFilters > 1 ? "s" : ""} activo{activeFilters > 1 ? "s" : ""}</span>}
        </p>
      </div>

      {/* ── Grid ──────────────────────────────────────────────────────────── */}
      {loading ? (
        <NomadaLoader mensaje="Buscando proyectos..." fullScreen={false} />
      ) : filteredProjects.length === 0 ? (
        <div style={{ maxWidth: "600px", margin: "80px auto", textAlign: "center", padding: "0 32px" }}>
          <p style={{ fontFamily: "'Sono', sans-serif", fontSize: "24px", color: "#1a1a1a", marginBottom: "8px" }}>
            {allProjects.length === 0 ? "El ecosistema está vacío" : "Ningún proyecto coincide"}
          </p>
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "14px", color: "rgba(0,0,0,0.4)", marginBottom: "24px" }}>
            {activeFilters > 0 ? "Prueba con otros filtros o limpia la búsqueda." : "Sé el primero en publicar un proyecto."}
          </p>
          {isAuthenticated && (
            <Link to="/upload" style={{ display: "inline-block", padding: "12px 28px", background: "#004FCD", color: "white", borderRadius: "100px", textDecoration: "none", fontSize: "13px", fontFamily: "'Montserrat', sans-serif", fontWeight: 600 }}>
              + Subir proyecto
            </Link>
          )}
        </div>
      ) : (
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "20px 32px 80px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
          {filteredProjects.map((project) => (
            <Link key={project.id} to={`/projects/${project.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div
                style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(0,0,0,0.07)", background: "#fff", transition: "transform 0.25s ease, box-shadow 0.25s ease", cursor: "pointer", height: "100%", display: "flex", flexDirection: "column" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
              >
                {/* Thumbnail */}
                <div style={{ position: "relative", aspectRatio: "4/3", overflow: "hidden", background: "#f3f4f6" }}>
                  {project.thumbnail
                    ? <img src={project.thumbnail} alt={project.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                    : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px", color: "rgba(0,0,0,0.15)" }}>🖼</div>
                  }
                  {/* Badges */}
                  <div style={{ position: "absolute", top: "10px", left: "10px", display: "flex", gap: "6px" }}>
                    {project.visibility === "Solo comunidad" && (
                      <span style={{ padding: "3px 10px", borderRadius: "100px", fontFamily: "'Montserrat', sans-serif", fontSize: "10px", fontWeight: 600, background: "rgba(245,158,11,0.9)", color: "#fff" }}>
                        🏫 Comunidad
                      </span>
                    )}
                    {project.productionStatus && (
                      <span style={{ padding: "3px 10px", borderRadius: "100px", fontFamily: "'Montserrat', sans-serif", fontSize: "10px", fontWeight: 500, background: "rgba(0,0,0,0.55)", color: "#fff", backdropFilter: "blur(8px)" }}>
                        {project.productionStatus}
                      </span>
                    )}
                  </div>
                </div>

                {/* Body */}
                <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", color: "#004FCD", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{project.area}</span>
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", color: "rgba(0,0,0,0.35)" }}>{project.semester} sem.</span>
                  </div>
                  <h3 style={{ fontFamily: "'Sono', sans-serif", fontSize: "18px", color: "#0a0a0a", marginBottom: "4px", lineHeight: 1.25 }}>{project.title}</h3>
                  <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "12px", color: "rgba(0,0,0,0.5)", marginBottom: "12px" }}>por {project.author}</p>
                  <div style={{ marginTop: "auto", display: "flex", gap: "12px", paddingTop: "12px", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "12px", color: "rgba(0,0,0,0.4)" }}>💡 {project.reactions?.inspires || 0}</span>
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "12px", color: "rgba(0,0,0,0.4)" }}>📚 {project.reactions?.learned || 0}</span>
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "12px", color: "rgba(0,0,0,0.4)" }}>⭐ {project.reactions?.professional || 0}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <NomadaGuia escena="explorar" onAccion={() => navigate('/upload')} />
    </div>
  );
}
