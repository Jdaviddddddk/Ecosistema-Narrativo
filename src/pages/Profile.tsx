import { Navigate, Link } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { siteConfig } from '../config';

interface Project {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  status: "published" | "draft" | "archived";
  createdAt: string;
  views: number;
}

interface Review {
  id: string;
  projectTitle: string;
  rating: number;
  comment: string;
  date: string;
}

interface Insight {
  id: string;
  type: "milestone" | "badge" | "streak";
  title: string;
  description: string;
  unlockedAt: string;
  icon: string;
}

const MOCK_PROJECTS: Project[] = [
  {
    id: "proj_1",
    title: "Ecosistema Lumínico",
    category: "Fotografía",
    thumbnail: "/images/portrait_01.jpg",
    status: "published",
    createdAt: "2025-01-20",
    views: 1240,
  },
  {
    id: "proj_2",
    title: "Vórtice Interior",
    category: "Instalación",
    thumbnail: "/images/portrait_02.jpg",
    status: "draft",
    createdAt: "2025-03-10",
    views: 0,
  },
];

const MOCK_REVIEWS: Review[] = [
  {
    id: "rev_1",
    projectTitle: "Ecosistema Lumínico",
    rating: 5,
    comment: "Una narrativa visual impresionante. La composición del vórtice transmite movimiento y quietud al mismo tiempo.",
    date: "2025-02-15",
  },
];

const MOCK_INSIGHTS: Insight[] = [
  {
    id: "ins_1",
    type: "milestone",
    title: "Primer Proyecto",
    description: "Publicaste tu primera obra en el ecosistema",
    unlockedAt: "2025-01-20",
    icon: "🎯",
  },
  {
    id: "ins_2",
    type: "badge",
    title: "Creador Visual",
    description: "Acumulaste más de 1,000 vistas en tus proyectos",
    unlockedAt: "2025-02-01",
    icon: "👁",
  },
  {
    id: "ins_3",
    type: "streak",
    title: "Constancia",
    description: "30 días consecutivos de actividad",
    unlockedAt: "2025-04-01",
    icon: "🔥",
  },
];

type Tab = "info" | "proyectos" | "calificaciones" | "resenas" | "insights";

export default function Profile() {
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("info");

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "info", label: "Información" },
    { key: "proyectos", label: "Proyectos" },
    { key: "calificaciones", label: "Calificaciones" },
    { key: "resenas", label: "Reseñas" },
    { key: "insights", label: "Insights" },
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < rating ? "#eab308" : "#d1d5db" }}>★</span>
    ));
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

          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <Link
              to="/projects"
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: "13px",
                color: "#000",
                textDecoration: "none",
                opacity: 0.7,
              }}
            >
              Proyectos
            </Link>
            <Link
              to="/info"
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: "13px",
                color: "#000",
                textDecoration: "none",
                opacity: 0.7,
              }}
            >
              Info
            </Link>
            <button
              onClick={logout}
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: "13px",
                color: "#000",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                opacity: 0.7,
              }}
            >
              Salir
            </button>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 32px 80px" }}>
        {/* Profile Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "32px",
            marginBottom: "48px",
            paddingBottom: "40px",
            borderBottom: "1px solid rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ position: "relative" }}>
            <div
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #e0e0e0, #c0c0c0)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "36px",
                fontFamily: "'Times New Roman', serif",
                color: "#000",
                border: "2px solid rgba(0,0,0,0.1)",
              }}
            >
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div
              style={{
                position: "absolute",
                bottom: "-2px",
                right: "-2px",
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                background: "#22c55e",
                border: "3px solid #fff",
              }}
            />
          </div>

          <div style={{ flex: 1 }}>
            <h1
              style={{
                fontFamily: "'Times New Roman', serif",
                fontSize: "36px",
                color: "#000",
                marginBottom: "8px",
              }}
            >
              {user?.name}
            </h1>
            <p
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: "14px",
                color: "rgba(0,0,0,0.5)",
                marginBottom: "4px",
              }}
            >
              {user?.email}
            </p>
            <p
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: "14px",
                color: "rgba(0,0,0,0.5)",
                marginBottom: "12px",
              }}
            >
              {user?.location}
            </p>
            <p
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: "15px",
                color: "rgba(0,0,0,0.7)",
                lineHeight: 1.6,
                maxWidth: "600px",
              }}
            >
              {user?.bio}
            </p>
            <div
              style={{
                display: "flex",
                gap: "16px",
                marginTop: "16px",
                fontFamily: "system-ui, sans-serif",
                fontSize: "11px",
                color: "rgba(0,0,0,0.4)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              <span>Miembro desde {new Date(user?.joinedAt || "").toLocaleDateString("es-MX")}</span>
              <span>•</span>
              <span>{user?.role === "creator" ? "Creador" : "Espectador"}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: "4px",
            marginBottom: "40px",
            borderBottom: "1px solid rgba(0,0,0,0.1)",
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "12px 20px",
                fontFamily: "system-ui, sans-serif",
                fontSize: "14px",
                fontWeight: 500,
                background: "transparent",
                border: "none",
                borderBottom: activeTab === tab.key ? "2px solid #000" : "2px solid transparent",
                color: activeTab === tab.key ? "#000" : "rgba(0,0,0,0.4)",
                cursor: "pointer",
                marginBottom: "-1px",
                transition: "all 0.2s ease",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "info" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "48px",
              }}
            >
              <div>
                <h3
                  style={{
                    fontFamily: "'Times New Roman', serif",
                    fontSize: "24px",
                    color: "#000",
                    marginBottom: "24px",
                  }}
                >
                  Datos personales
                </h3>
                <dl style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {[
                    { label: "Nombre completo", value: user?.name },
                    { label: "Correo electrónico", value: user?.email },
                    { label: "Ubicación", value: user?.location },
                    { label: "Rol en el ecosistema", value: user?.role === "creator" ? "Creador" : "Espectador" },
                  ].map((item) => (
                    <div key={item.label}>
                      <dt
                        style={{
                          fontFamily: "system-ui, sans-serif",
                          fontSize: "11px",
                          color: "rgba(0,0,0,0.4)",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          marginBottom: "4px",
                        }}
                      >
                        {item.label}
                      </dt>
                      <dd
                        style={{
                          fontFamily: "system-ui, sans-serif",
                          fontSize: "15px",
                          color: "rgba(0,0,0,0.8)",
                        }}
                      >
                        {item.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div>
                <h3
                  style={{
                    fontFamily: "'Times New Roman', serif",
                    fontSize: "24px",
                    color: "#000",
                    marginBottom: "24px",
                  }}
                >
                  Estadísticas del ecosistema
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "12px",
                  }}
                >
                  {[
                    { label: "Proyectos publicados", value: "1" },
                    { label: "Total de vistas", value: "1,240" },
                    { label: "Reseñas recibidas", value: "1" },
                    { label: "Insights desbloqueados", value: "3" },
                    { label: "Calificación promedio", value: "5.0" },
                    { label: "Días activo", value: "45" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      style={{
                        padding: "20px",
                        border: "1px solid rgba(0,0,0,0.1)",
                        borderRadius: "4px",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "'Times New Roman', serif",
                          fontSize: "28px",
                          color: "#000",
                          marginBottom: "4px",
                        }}
                      >
                        {stat.value}
                      </div>
                      <div
                        style={{
                          fontFamily: "system-ui, sans-serif",
                          fontSize: "11px",
                          color: "rgba(0,0,0,0.4)",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "proyectos" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "24px",
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Times New Roman', serif",
                    fontSize: "24px",
                    color: "#000",
                  }}
                >
                  Mis proyectos
                </h3>
                <span
                  style={{
                    fontFamily: "system-ui, sans-serif",
                    fontSize: "14px",
                    color: "rgba(0,0,0,0.5)",
                  }}
                >
                  {MOCK_PROJECTS.length} proyectos
                </span>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "20px",
                }}
              >
                {MOCK_PROJECTS.map((project) => (
                  <div
                    key={project.id}
                    style={{
                      border: "1px solid rgba(0,0,0,0.1)",
                      borderRadius: "4px",
                      overflow: "hidden",
                      transition: "border-color 0.3s ease",
                    }}
                  >
                    <div style={{ aspectRatio: "4/3", overflow: "hidden", background: "rgba(0,0,0,0.03)" }}>
                      <img
                        src={project.thumbnail}
                        alt={project.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition: "transform 0.5s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "scale(1.05)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "scale(1)";
                        }}
                      />
                    </div>
                    <div style={{ padding: "20px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "8px",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "system-ui, sans-serif",
                            fontSize: "11px",
                            color: "rgba(0,0,0,0.4)",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                          }}
                        >
                          {project.category}
                        </span>
                        <span
                          style={{
                            fontSize: "11px",
                            padding: "4px 10px",
                            borderRadius: "100px",
                            background:
                              project.status === "published"
                                ? "#dcfce7"
                                : project.status === "draft"
                                ? "#fef9c3"
                                : "#f3f4f6",
                            color:
                              project.status === "published"
                                ? "#166534"
                                : project.status === "draft"
                                ? "#854d0e"
                                : "#374151",
                          }}
                        >
                          {project.status === "published" ? "Publicado" : project.status === "draft" ? "Borrador" : "Archivado"}
                        </span>
                      </div>
                      <h4
                        style={{
                          fontFamily: "'Times New Roman', serif",
                          fontSize: "18px",
                          color: "#000",
                          marginBottom: "8px",
                        }}
                      >
                        {project.title}
                      </h4>
                      <div
                        style={{
                          display: "flex",
                          gap: "16px",
                          fontFamily: "system-ui, sans-serif",
                          fontSize: "12px",
                          color: "rgba(0,0,0,0.5)",
                        }}
                      >
                        <span>{new Date(project.createdAt).toLocaleDateString("es-MX")}</span>
                        {project.views > 0 && <span>{project.views.toLocaleString()} vistas</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "calificaciones" && (
            <div>
              <h3
                style={{
                  fontFamily: "'Times New Roman', serif",
                  fontSize: "24px",
                  color: "#000",
                  marginBottom: "24px",
                }}
              >
                Calificaciones recibidas
              </h3>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  marginBottom: "32px",
                  padding: "24px",
                  border: "1px solid rgba(0,0,0,0.1)",
                  borderRadius: "4px",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Times New Roman', serif",
                    fontSize: "48px",
                    color: "#000",
                  }}
                >
                  5.0
                </div>
                <div>
                  <div style={{ fontSize: "20px" }}>{renderStars(5)}</div>
                  <p
                    style={{
                      fontFamily: "system-ui, sans-serif",
                      fontSize: "14px",
                      color: "rgba(0,0,0,0.5)",
                    }}
                  >
                    Basado en 1 reseña
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {MOCK_REVIEWS.map((review) => (
                  <div
                    key={review.id}
                    style={{
                      padding: "20px",
                      border: "1px solid rgba(0,0,0,0.1)",
                      borderRadius: "4px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "12px",
                      }}
                    >
                      <h4
                        style={{
                          fontFamily: "system-ui, sans-serif",
                          fontSize: "15px",
                          fontWeight: 500,
                          color: "#000",
                        }}
                      >
                        {review.projectTitle}
                      </h4>
                      <span
                        style={{
                          fontFamily: "system-ui, sans-serif",
                          fontSize: "12px",
                          color: "rgba(0,0,0,0.4)",
                        }}
                      >
                        {new Date(review.date).toLocaleDateString("es-MX")}
                      </span>
                    </div>
                    <div style={{ marginBottom: "8px" }}>{renderStars(review.rating)}</div>
                    <p
                      style={{
                        fontFamily: "system-ui, sans-serif",
                        fontSize: "14px",
                        color: "rgba(0,0,0,0.6)",
                        lineHeight: 1.6,
                      }}
                    >
                      "{review.comment}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "resenas" && (
            <div>
              <h3
                style={{
                  fontFamily: "'Times New Roman', serif",
                  fontSize: "24px",
                  color: "#000",
                  marginBottom: "24px",
                }}
              >
                Reseñas
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {MOCK_REVIEWS.map((review) => (
                  <div
                    key={review.id}
                    style={{
                      padding: "20px",
                      border: "1px solid rgba(0,0,0,0.1)",
                      borderRadius: "4px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "12px",
                      }}
                    >
                      <div>
                        <h4
                          style={{
                            fontFamily: "system-ui, sans-serif",
                            fontSize: "15px",
                            fontWeight: 500,
                            color: "#000",
                            marginBottom: "4px",
                          }}
                        >
                          {review.projectTitle}
                        </h4>
                        <div>{renderStars(review.rating)}</div>
                      </div>
                      <span
                        style={{
                          fontFamily: "system-ui, sans-serif",
                          fontSize: "12px",
                          color: "rgba(0,0,0,0.4)",
                        }}
                      >
                        {new Date(review.date).toLocaleDateString("es-MX")}
                      </span>
                    </div>
                    <p
                      style={{
                        fontFamily: "system-ui, sans-serif",
                        fontSize: "14px",
                        color: "rgba(0,0,0,0.6)",
                        lineHeight: 1.6,
                      }}
                    >
                      "{review.comment}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "insights" && (
            <div>
              <h3
                style={{
                  fontFamily: "'Times New Roman', serif",
                  fontSize: "24px",
                  color: "#000",
                  marginBottom: "24px",
                }}
              >
                Logros e insights
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                  gap: "16px",
                }}
              >
                {MOCK_INSIGHTS.map((insight) => (
                  <div
                    key={insight.id}
                    style={{
                      padding: "32px",
                      border: "1px solid rgba(0,0,0,0.1)",
                      borderRadius: "4px",
                      textAlign: "center",
                      transition: "border-color 0.3s ease",
                    }}
                  >
                    <div style={{ fontSize: "40px", marginBottom: "12px" }}>{insight.icon}</div>
                    <h4
                      style={{
                        fontFamily: "system-ui, sans-serif",
                        fontSize: "15px",
                        fontWeight: 500,
                        color: "#000",
                        marginBottom: "4px",
                      }}
                    >
                      {insight.title}
                    </h4>
                    <p
                      style={{
                        fontFamily: "system-ui, sans-serif",
                        fontSize: "12px",
                        color: "rgba(0,0,0,0.5)",
                        marginBottom: "12px",
                      }}
                    >
                      {insight.description}
                    </p>
                    <span
                      style={{
                        fontFamily: "system-ui, sans-serif",
                        fontSize: "11px",
                        color: "rgba(0,0,0,0.3)",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      {new Date(insight.unlockedAt).toLocaleDateString("es-MX")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}