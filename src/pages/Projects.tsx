import { useState, useMemo } from "react";
import { Link } from "react-router";
import { projects, areas, semesters } from "@/config/projects";
import type { Project } from "@/config/projects";
import { siteConfig } from "@/config";

export default function Projects() {
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = useMemo(() => {
    return projects.filter((project: Project) => {
      const matchesArea = !selectedArea || project.area === selectedArea;
      const matchesSemester = !selectedSemester || project.semester === selectedSemester;
      const matchesStatus = !selectedStatus || project.status === selectedStatus;
      const matchesSearch = 
        !searchQuery ||
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.subject.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesArea && matchesSemester && matchesStatus && matchesSearch;
    });
  }, [selectedArea, selectedSemester, selectedStatus, searchQuery]);

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
          <Link
            to="/"
            style={{
              fontFamily: "'Times New Roman', serif",
              fontSize: "20px",
              color: "#000",
              textDecoration: "none",
              letterSpacing: "0.05em",
            }}
          >
            {siteConfig.brandName}
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            {/* Search */}
            <input
              type="text"
              placeholder="Buscar proyectos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: "14px",
                padding: "10px 16px",
                borderRadius: "100px",
                border: "1px solid rgba(0,0,0,0.15)",
                outline: "none",
                width: "240px",
              }}
            />

            {/* Area filter */}
            <select
              value={selectedArea || ""}
              onChange={(e) => setSelectedArea(e.target.value || null)}
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: "13px",
                padding: "10px 16px",
                borderRadius: "100px",
                border: "1px solid rgba(0,0,0,0.15)",
                background: "white",
                cursor: "pointer",
              }}
            >
              <option value="">Todas las áreas</option>
              {areas.map((area) => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>

            {/* Semester filter */}
            <select
              value={selectedSemester || ""}
              onChange={(e) => setSelectedSemester(e.target.value || null)}
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: "13px",
                padding: "10px 16px",
                borderRadius: "100px",
                border: "1px solid rgba(0,0,0,0.15)",
                background: "white",
                cursor: "pointer",
              }}
            >
              <option value="">Todos los semestres</option>
              {semesters.map((sem) => (
                <option key={sem} value={sem}>{sem} semestre</option>
              ))}
            </select>

            {/* Status filter */}
            <select
              value={selectedStatus || ""}
              onChange={(e) => setSelectedStatus(e.target.value || null)}
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: "13px",
                padding: "10px 16px",
                borderRadius: "100px",
                border: "1px solid rgba(0,0,0,0.15)",
                background: "white",
                cursor: "pointer",
              }}
            >
              <option value="">Todos los estados</option>
              <option value="Publicado">Publicado</option>
              <option value="En revisión">En revisión</option>
              <option value="Borrador">Borrador</option>
            </select>

            {(selectedArea || selectedSemester || selectedStatus || searchQuery) && (
              <button
                onClick={clearFilters}
                style={{
                  fontFamily: "system-ui, sans-serif",
                  fontSize: "13px",
                  padding: "10px 16px",
                  borderRadius: "100px",
                  border: "1px solid rgba(0,0,0,0.15)",
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results count */}
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "24px 32px 0",
        }}
      >
        <p
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: "14px",
            color: "rgba(0,0,0,0.5)",
          }}
        >
          {filteredProjects.length} proyecto{filteredProjects.length !== 1 ? "s" : ""} encontrado
          {filteredProjects.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Projects Grid */}
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "24px 32px 80px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "24px",
        }}
      >
        {filteredProjects.map((project) => (
          <Link
            key={project.id}
            to={`/project/${project.id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div
              style={{
                borderRadius: "8px",
                overflow: "hidden",
                border: "1px solid rgba(0,0,0,0.08)",
                background: "#fff",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                cursor: "pointer",
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Thumbnail */}
              <div style={{ position: "relative", aspectRatio: "4/3", overflow: "hidden" }}>
                <img
                  src={project.thumbnail}
                  alt={project.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    padding: "4px 12px",
                    borderRadius: "100px",
                    fontFamily: "system-ui, sans-serif",
                    fontSize: "11px",
                    fontWeight: 500,
                    background:
                      project.status === "Publicado"
                        ? "#22c55e"
                        : project.status === "En revisión"
                        ? "#f59e0b"
                        : "#6b7280",
                    color: "#fff",
                  }}
                >
                  {project.status}
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "system-ui, sans-serif",
                      fontSize: "11px",
                      color: "rgba(0,0,0,0.5)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {project.area}
                  </span>
                  <span
                    style={{
                      fontFamily: "system-ui, sans-serif",
                      fontSize: "11px",
                      color: "rgba(0,0,0,0.4)",
                    }}
                  >
                    {project.semester} semestre
                  </span>
                </div>

                <h3
                  style={{
                    fontFamily: "'Times New Roman', serif",
                    fontSize: "20px",
                    color: "#000",
                    marginBottom: "8px",
                    lineHeight: 1.2,
                  }}
                >
                  {project.title}
                </h3>

                <p
                  style={{
                    fontFamily: "system-ui, sans-serif",
                    fontSize: "13px",
                    color: "rgba(0,0,0,0.6)",
                    marginBottom: "16px",
                  }}
                >
                  por {project.author}
                </p>

                <div
                  style={{
                    marginTop: "auto",
                    display: "flex",
                    gap: "16px",
                    paddingTop: "16px",
                    borderTop: "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  <span style={{ fontSize: "16px" }}>💡 {project.reactions.inspires}</span>
                  <span style={{ fontSize: "16px" }}>⭐ {project.reactions.professional}</span>
                </div>
              </div>
            </div>  
          </Link>
        ))}
      </div>
    </div>
  );
}