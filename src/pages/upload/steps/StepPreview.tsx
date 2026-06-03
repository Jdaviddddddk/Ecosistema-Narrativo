import { useUpload } from "@/context/UploadContext";
import { useAuth } from "@/context/AuthContext";

export default function StepPreview() {
  const { data } = useUpload();
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h2 style={{ fontFamily: "'Sono', sans-serif", fontSize: "22px", fontWeight: 700, color: "#0a0a0a", marginBottom: "6px" }}>
          Vista previa
        </h2>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "13px", color: "#888" }}>
          Así se verá tu proyecto antes de publicarlo.
        </p>
      </div>

      <div style={{
        borderRadius: "20px",
        overflow: "hidden",
        border: "1.5px solid rgba(0,0,0,0.07)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}>
        {/* Thumbnail */}
        {data.thumbnail ? (
          <img src={data.thumbnail} alt={data.title} style={{ width: "100%", height: "220px", objectFit: "cover", display: "block" }} />
        ) : (
          <div style={{ width: "100%", height: "160px", background: "linear-gradient(135deg, #f0f4ff, #e8f0fe)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "48px", opacity: 0.3 }}>🖼</span>
          </div>
        )}

        <div style={{ padding: "20px" }}>
          {/* Author */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <img
              src={user?.avatar || "/images/avatar_default.jpg"}
              alt={user?.name}
              style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(0,79,205,0.15)" }}
            />
            <div>
              <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "13px", fontWeight: 600, color: "#1a1a1a" }}>{user?.name}</p>
              <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", color: "#aaa" }}>{user?.email}</p>
            </div>
          </div>

          {/* Tags */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
            {data.area && (
              <span style={{ padding: "4px 10px", borderRadius: "100px", background: "rgba(0,79,205,0.08)", color: "#004FCD", fontFamily: "'Montserrat', sans-serif", fontSize: "11px", fontWeight: 600 }}>
                {data.area}
              </span>
            )}
            {data.semester && (
              <span style={{ padding: "4px 10px", borderRadius: "100px", background: "rgba(0,0,0,0.05)", color: "#666", fontFamily: "'Montserrat', sans-serif", fontSize: "11px" }}>
                {data.semester} sem.
              </span>
            )}
            {data.productionStatus && (
              <span style={{ padding: "4px 10px", borderRadius: "100px", background: "rgba(139,92,246,0.08)", color: "#7c3aed", fontFamily: "'Montserrat', sans-serif", fontSize: "11px", fontWeight: 600 }}>
                {data.productionStatus}
              </span>
            )}
          </div>

          <h3 style={{ fontFamily: "'Sono', sans-serif", fontSize: "20px", fontWeight: 700, color: "#0a0a0a", marginBottom: "8px", lineHeight: 1.2 }}>
            {data.title || "Sin título"}
          </h3>

          {data.originStory && (
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "13px", color: "#666", lineHeight: 1.6, marginBottom: "12px" }}>
              {data.originStory.slice(0, 180)}{data.originStory.length > 180 ? "..." : ""}
            </p>
          )}

          {data.tools.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {data.tools.slice(0, 5).map((tool) => (
                <span key={tool} style={{ padding: "4px 10px", borderRadius: "6px", background: "rgba(0,0,0,0.04)", fontFamily: "'Montserrat', sans-serif", fontSize: "11px", color: "#555" }}>
                  {tool}
                </span>
              ))}
              {data.tools.length > 5 && (
                <span style={{ padding: "4px 10px", borderRadius: "6px", background: "rgba(0,0,0,0.04)", fontFamily: "'Montserrat', sans-serif", fontSize: "11px", color: "#999" }}>
                  +{data.tools.length - 5} más
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{
        padding: "14px 16px",
        borderRadius: "14px",
        background: "rgba(34,197,94,0.06)",
        border: "1px solid rgba(34,197,94,0.2)",
        display: "flex", alignItems: "center", gap: "10px",
      }}>
        <span style={{ fontSize: "18px" }}>✓</span>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "13px", color: "#166534", fontWeight: 500 }}>
          Todo listo. Pulsa <strong>Publicar Proyecto</strong> cuando estés seguro.
        </p>
      </div>
    </div>
  );
}
