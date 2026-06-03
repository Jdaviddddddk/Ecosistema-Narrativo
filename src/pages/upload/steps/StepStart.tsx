import { useUpload } from "@/context/UploadContext";

const AREAS = [
  { name: "Diseño análogo",         icon: "✏️" },
  { name: "Diseño de interfaces",   icon: "🖥️" },
  { name: "Diseño web",             icon: "🌐" },
  { name: "Fotografía",             icon: "📷" },
  { name: "Cortometraje",           icon: "🎬" },
  { name: "Largometraje",           icon: "🎞️" },
  { name: "Diseño de experiencias", icon: "🎭" },
  { name: "Diseño tipográfico",     icon: "Aa" },
  { name: "Diseño de marca",        icon: "◎" },
  { name: "Investigación",          icon: "🔬" },
  { name: "Motion Graphics",        icon: "▶️" },
  { name: "Animación",              icon: "✨" },
  { name: "Ilustración digital",    icon: "🎨" },
  { name: "Diseño editorial",       icon: "📐" },
  { name: "Diseño de empaque",      icon: "📦" },
  { name: "Señalética",             icon: "🗺️" },
  { name: "Diseño sonoro",          icon: "🎵" },
  { name: "Realidad extendida (XR)", icon: "🥽" },
];

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 16px",
  border: "1.5px solid rgba(0,0,0,0.08)",
  borderRadius: "14px",
  background: "rgba(0,0,0,0.02)",
  fontFamily: "'Montserrat', sans-serif",
  fontSize: "14px",
  color: "#1a1a1a",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

export default function StepStart() {
  const { data, updateField } = useUpload();

  return (
    <div className="space-y-7">
      <div>
        <h2 style={{ fontFamily: "'Sono', sans-serif", fontSize: "22px", fontWeight: 700, color: "#0a0a0a", marginBottom: "6px" }}>
          ¿Qué vas a compartir hoy?
        </h2>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "13px", color: "#888" }}>
          Tu proyecto formará parte del ecosistema narrativo de la Universidad Colegio Mayor de Cundinamarca.
        </p>
      </div>

      {/* Título */}
      <div>
        <label style={{ display: "block", fontFamily: "'Montserrat', sans-serif", fontSize: "12px", fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px" }}>
          Título del proyecto
        </label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => updateField("title", e.target.value)}
          placeholder="Ej: Rebranding de la cafetería universitaria"
          style={inputStyle}
          onFocus={e => { e.target.style.borderColor = "#004FCD"; e.target.style.boxShadow = "0 0 0 3px rgba(0,79,205,0.1)"; }}
          onBlur={e => { e.target.style.borderColor = "rgba(0,0,0,0.08)"; e.target.style.boxShadow = "none"; }}
        />
      </div>

      {/* Área */}
      <div>
        <label style={{ display: "block", fontFamily: "'Montserrat', sans-serif", fontSize: "12px", fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "10px" }}>
          Categoría del proyecto
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
          {AREAS.map((a) => {
            const selected = data.area === a.name;
            return (
              <button
                key={a.name}
                type="button"
                onClick={() => updateField("area", a.name)}
                style={{
                  padding: "10px 8px",
                  borderRadius: "12px",
                  border: selected ? "1.5px solid #004FCD" : "1.5px solid rgba(0,0,0,0.07)",
                  background: selected ? "rgba(0,79,205,0.07)" : "rgba(0,0,0,0.02)",
                  color: selected ? "#004FCD" : "#555",
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "11px",
                  fontWeight: selected ? 600 : 500,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                  lineHeight: 1.3,
                  textAlign: "center",
                  boxShadow: selected ? "0 2px 10px rgba(0,79,205,0.15)" : "none",
                }}
              >
                <span style={{ fontSize: "18px" }}>{a.icon}</span>
                {a.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
