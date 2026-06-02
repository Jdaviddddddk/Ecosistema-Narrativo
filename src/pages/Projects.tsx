import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { projectsAPI } from "@/lib/api";
import { areas, semesters } from "@/config/projects";
import { useAuth } from "@/context/AuthContext";

export default function Projects() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    projectsAPI.list()
      .then((data: any[]) => setAllProjects(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredProjects = useMemo(() => {
    return allProjects.filter((project) => {
      const matchesArea = !selectedArea || project.area === selectedArea;
      const matchesSemester = !selectedSemester || project.semester === selectedSemester;
      const matchesStatus = !selectedStatus || project.status === selectedStatus;
      const matchesSearch =
        !searchQuery ||
        project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.subject?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesArea && matchesSemester && matchesStatus && matchesSearch;
    });
  }, [allProjects, selectedArea, selectedSemester, selectedStatus, searchQuery]);

  const clearFilters = () => {
    setSelectedArea(null);
    setSelectedSemester(null);
    setSelectedStatus(null);
    setSearchQuery("");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff" }}>
      {/* Header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          padding: "20px 32px",
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <Link to="/" className="flex items-center gap-3" style={{ textDecoration: "none" }}>
              <div className="w-9 h-9 rounded-lg overflow-hidden">
                <img src="/images/logo-nexo.png" alt="NEXO" className="w-full h-full object-contain" />
              </div>
            </Link>
            <Link to="/projects" style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "13px", color: "#000", textDecoration: "none", opacity: 0.7 }}>
              Proyectos
            </Link>
            <Link to="/info" style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "13px", color: "#000", textDecoration: "none", opacity: 0.7 }}>
              Info
            </Link>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Buscar proyectos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "14px", padding: "10px 16px", borderRadius: "100px", border: "1px solid rgba(0,0,0,0.15)", outline: "none", width: "240px" }}
            />

            <select
              value={selectedArea || ""}
              onChange={(e) => setSelectedArea(e.target.value || null)}
              style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "13px", padding: "10px 16px", borderRadius: "100px", border: "1px solid rgba(0,0,0,0.15)", background: "white", cursor: "pointer" }}
            >
              <option value="">Todas las áreas</option>
              {areas.map((area) => <option key={area} value={area}>{area}</option>)}
            </select>

            <select
              value={selectedSemester || ""}
              onChange={(e) => setSelectedSemester(e.target.value || null)}
              style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "13px", padding: "10px 16px", borderRadius: "100px", border: "1px solid rgba(0,0,0,0.15)", background: "white", cursor: "pointer" }}
            >
              <option value="">Todos los semestres</option>
              {semesters.map((sem) => <option key={sem} value={sem}>{sem} semestre</option>)}
            </select>

            <select
              value={selectedStatus || ""}
              onChange={(e) => setSelectedStatus(e.target.value || null)}
              style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "13px", padding: "10px 16px", borderRadius: "100px", border: "1px solid rgba(0,0,0,0.15)", background: "white", cursor: "pointer" }}
            >
              <option value="">Todos los estados</option>
              <option value="Publicado">Publicado</option>
              <option value="En revisión">En revisión</option>
              <option value="Borrador">Borrador</option>
            </select>

            {(selectedArea || selectedSemester || selectedStatus || searchQuery) && (
              <button onClick={clearFilters} style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "13px", padding: "10px 16px", borderRadius: "100px", border: "1px solid rgba(0,0,0,0.15)", background: "transparent", cursor: "pointer" }}>
                Limpiar
              </button>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginLeft: "8px", paddingLeft: "16px", borderLeft: "1px solid rgba(0,0,0,0.1)" }}>
              {isAuthenticated ? (
                <>
                  <button onClick={() => navigate("/yo")} style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "13px", color: "#000", background: "transparent", border: "none", cursor: "pointer", opacity: 0.7, display: "flex", alignItems: "center", gap: "8px" }}>
                    <img src={user?.avatar || "/images/avatar_default.jpg"} alt={user?.name} style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover" }} />
                    Yo
                  </button>
                  <button onClick={logout} style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "13px", color: "#000", background: "transparent", border: "none", cursor: "pointer", opacity: 0.7 }}>
                    Salir
                  </button>
                </>
              ) : (
                <button onClick={() => navigate("/")} style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "13px", color: "#000", background: "transparent", border: "none", cursor: "pointer", opacity: 0.7 }}>
                  Acceso
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px 32px 0" }}>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "14px", color: "rgba(0,0,0,0.5)" }}>
          {loading ? "Cargando proyectos..." : `${filteredProjects.length} proyecto${filteredProjects.length !== 1 ? "s" : ""} encontrado${filteredProjects.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px" }}>
          <div style={{ width: "40px", height: "40px", border: "3px solid #004FCD", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div style={{ maxWidth: "1400px", margin: "80px auto", textAlign: "center", fontFamily: "'Montserrat', sans-serif" }}>
          <p style={{ color: "rgba(0,0,0,0.4)", fontSize: "16px", marginBottom: "16px" }}>
            {allProjects.length === 0 ? "No hay proyectos publicados aún." : "No hay proyectos con esos filtros."}
          </p>
          {isAuthenticated && (
            <Link to="/upload" style={{ display: "inline-block", padding: "12px 24px", background: "#004FCD", color: "white", borderRadius: "100px", textDecoration: "none", fontSize: "14px" }}>
              + Subir proyecto
            </Link>
          )}
        </div>
      ) : (
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px 32px 80px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
          {filteredProjects.map((project) => (
            <Link key={project.id} to={`/projects/${project.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div
                style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid rgba(0,0,0,0.08)", background: "#fff", transition: "transform 0.3s ease, box-shadow 0.3s ease", cursor: "pointer", height: "100%", display: "flex", flexDirection: "column" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.1)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ position: "relative", aspectRatio: "4/3", overflow: "hidden", background: "#f3f4f6" }}>
                  {project.thumbnail ? (
                    <img src={project.thumbnail} alt={project.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(0,0,0,0.2)", fontSize: "48px" }}>🖼</div>
                  )}
                  <div style={{ position: "absolute", top: "12px", right: "12px", padding: "4px 12px", borderRadius: "100px", fontFamily: "'Montserrat', sans-serif", fontSize: "11px", fontWeight: 500, background: project.status === "Publicado" ? "#22c55e" : project.status === "En revisión" ? "#f59e0b" : "#6b7280", color: "#fff" }}>
                    {project.status}
                  </div>
                </div>

                <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", color: "rgba(0,0,0,0.5)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{project.area}</span>
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", color: "rgba(0,0,0,0.4)" }}>{project.semester} semestre</span>
                  </div>
                  <h3 style={{ fontFamily: "'Sono', sans-serif", fontSize: "20px", color: "#000", marginBottom: "8px", lineHeight: 1.2 }}>{project.title}</h3>
                  <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.6)", marginBottom: "16px" }}>por {project.author}</p>
                  <div style={{ marginTop: "auto", display: "flex", gap: "16px", paddingTop: "16px", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                    <span style={{ fontSize: "16px" }}>💡 {project.reactions?.inspires || 0}</span>
                    <span style={{ fontSize: "16px" }}>⭐ {project.reactions?.professional || 0}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
