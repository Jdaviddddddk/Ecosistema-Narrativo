import { useUpload } from "@/context/UploadContext";

const SEMESTERS = ["1°","2°","3°","4°","5°","6°","7°","8°","9°","10°"];
const PRODUCTION_STATES = [
  { value: "Ideación",      color: "#f59e0b", bg: "rgba(245,158,11,0.08)"  },
  { value: "En desarrollo", color: "#3b82f6", bg: "rgba(59,130,246,0.08)"  },
  { value: "Prototipo",     color: "#8b5cf6", bg: "rgba(139,92,246,0.08)"  },
  { value: "En producción", color: "#ef4444", bg: "rgba(239,68,68,0.08)"   },
  { value: "Finalizado",    color: "#22c55e", bg: "rgba(34,197,94,0.08)"   },
  { value: "Archivado",     color: "#6b7280", bg: "rgba(107,114,128,0.08)" },
] as const;

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "'Montserrat', sans-serif",
  fontSize: "12px",
  fontWeight: 600,
  color: "#555",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  marginBottom: "8px",
};

const selectStyle: React.CSSProperties = {
  width: "100%", padding: "12px 16px",
  border: "1.5px solid rgba(0,0,0,0.08)",
  borderRadius: "14px",
  background: "rgba(0,0,0,0.02)",
  fontFamily: "'Montserrat', sans-serif",
  fontSize: "14px",
  color: "#1a1a1a",
  outline: "none",
  cursor: "pointer",
  appearance: "none",
};

const inputStyle: React.CSSProperties = {
  ...selectStyle,
};

export default function StepIdentity() {
  const { data, updateField } = useUpload();

  return (
    <div className="space-y-7">
      <h2 style={{ fontFamily: "'Sono', sans-serif", fontSize: "22px", fontWeight: 700, color: "#0a0a0a" }}>
        Identidad académica
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div>
          <label style={labelStyle}>Semestre</label>
          <div style={{ position: "relative" }}>
            <select
              value={data.semester}
              onChange={(e) => updateField("semester", e.target.value)}
              style={selectStyle}
            >
              <option value="">Selecciona</option>
              {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <span style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#999", fontSize: "10px" }}>▼</span>
          </div>
        </div>
        <div>
          <label style={labelStyle}>Materia</label>
          <input
            type="text"
            value={data.subject}
            onChange={(e) => updateField("subject", e.target.value)}
            placeholder="Ej: Diseño de Identidad Visual"
            style={inputStyle}
            onFocus={e => { e.target.style.borderColor = "#004FCD"; e.target.style.boxShadow = "0 0 0 3px rgba(0,79,205,0.1)"; }}
            onBlur={e => { e.target.style.borderColor = "rgba(0,0,0,0.08)"; e.target.style.boxShadow = "none"; }}
          />
        </div>
      </div>

      {/* Estado del producto */}
      <div>
        <label style={labelStyle}>Estado del producto</label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
          {PRODUCTION_STATES.map(({ value, color, bg }) => {
            const selected = data.productionStatus === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => updateField("productionStatus", value)}
                style={{
                  padding: "10px 12px",
                  borderRadius: "12px",
                  border: selected ? `1.5px solid ${color}` : "1.5px solid rgba(0,0,0,0.07)",
                  background: selected ? bg : "rgba(0,0,0,0.02)",
                  color: selected ? color : "#666",
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "12px",
                  fontWeight: selected ? 600 : 500,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  boxShadow: selected ? `0 2px 10px ${color}26` : "none",
                }}
              >
                {value}
              </button>
            );
          })}
        </div>
      </div>

      {/* Visibilidad */}
      <div>
        <label style={labelStyle}>Visibilidad</label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
          {([
            { value: "Público",        icon: "🌎" },
            { value: "Solo comunidad", icon: "🏫" },
            { value: "Privado",        icon: "🔒" },
          ] as const).map(({ value, icon }) => {
            const selected = data.visibility === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => updateField("visibility", value)}
                style={{
                  padding: "12px 8px",
                  borderRadius: "12px",
                  border: selected ? "1.5px solid #004FCD" : "1.5px solid rgba(0,0,0,0.07)",
                  background: selected ? "rgba(0,79,205,0.07)" : "rgba(0,0,0,0.02)",
                  color: selected ? "#004FCD" : "#666",
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "12px",
                  fontWeight: selected ? 600 : 500,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
                  boxShadow: selected ? "0 2px 10px rgba(0,79,205,0.15)" : "none",
                }}
              >
                <span style={{ fontSize: "20px" }}>{icon}</span>
                {value}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
