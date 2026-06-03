import { useUpload } from "@/context/UploadContext";

const fieldStyle: React.CSSProperties = {
  width: "100%", padding: "12px 16px",
  border: "1.5px solid rgba(0,0,0,0.08)",
  borderRadius: "14px",
  background: "rgba(0,0,0,0.02)",
  fontFamily: "'Montserrat', sans-serif",
  fontSize: "14px", color: "#1a1a1a", outline: "none",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "'Montserrat', sans-serif",
  fontSize: "12px", fontWeight: 600, color: "#555",
  textTransform: "uppercase", letterSpacing: "0.07em",
  marginBottom: "8px",
};

export default function StepCredits() {
  const { data, updateField } = useUpload();

  return (
    <div className="space-y-7">
      <div>
        <h2 style={{ fontFamily: "'Sono', sans-serif", fontSize: "22px", fontWeight: 700, color: "#0a0a0a", marginBottom: "6px" }}>
          Créditos y enlaces
        </h2>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "13px", color: "#888" }}>
          Comparte dónde se puede ver o interactuar con tu proyecto.
        </p>
      </div>

      {/* Prototipo — obligatorio */}
      <div>
        <label style={labelStyle}>
          Link de prototipo o previsualización{" "}
          <span style={{ color: "#ef4444", fontWeight: 700 }}>*</span>
        </label>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "16px", pointerEvents: "none" }}>🔗</span>
          <input
            type="text"
            value={data.prototypeLink}
            onChange={(e) => updateField("prototypeLink", e.target.value)}
            placeholder="figma.com/proto/..., youtube.com/watch?v=..."
            style={{ ...fieldStyle, paddingLeft: "40px" }}
            onFocus={e => { e.target.style.borderColor = "#004FCD"; e.target.style.boxShadow = "0 0 0 3px rgba(0,79,205,0.1)"; }}
            onBlur={e => { e.target.style.borderColor = "rgba(0,0,0,0.08)"; e.target.style.boxShadow = "none"; }}
          />
        </div>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", color: "#aaa", marginTop: "5px" }}>
          Figma, YouTube, Vimeo, Wix, GitHub Pages, etc. (obligatorio)
        </p>
      </div>

      {/* Enlace adicional */}
      <div>
        <label style={{ ...labelStyle, color: "#888" }}>
          Enlace adicional{" "}
          <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opcional)</span>
        </label>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "16px", pointerEvents: "none" }}>↗</span>
          <input
            type="text"
            value={data.fullLink}
            onChange={(e) => updateField("fullLink", e.target.value)}
            placeholder="behance.net/tuusuario/proyecto, github.com/..."
            style={{ ...fieldStyle, paddingLeft: "40px" }}
            onFocus={e => { e.target.style.borderColor = "#004FCD"; e.target.style.boxShadow = "0 0 0 3px rgba(0,79,205,0.1)"; }}
            onBlur={e => { e.target.style.borderColor = "rgba(0,0,0,0.08)"; e.target.style.boxShadow = "none"; }}
          />
        </div>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", color: "#aaa", marginTop: "5px" }}>
          Behance, Dribbble, GitHub, etc.
        </p>
      </div>

      {/* Formato */}
      <div>
        <label style={labelStyle}>Formato de entrega</label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
          {["Digital", "Impreso", "Digital + Impreso", "Físico", "Interactivo"].map((f) => {
            const selected = data.format === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => updateField("format", f)}
                style={{
                  padding: "10px 8px",
                  borderRadius: "12px",
                  border: selected ? "1.5px solid #004FCD" : "1.5px solid rgba(0,0,0,0.07)",
                  background: selected ? "rgba(0,79,205,0.07)" : "rgba(0,0,0,0.02)",
                  color: selected ? "#004FCD" : "#555",
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "12px", fontWeight: selected ? 600 : 500,
                  cursor: "pointer", transition: "all 0.15s",
                  boxShadow: selected ? "0 2px 10px rgba(0,79,205,0.15)" : "none",
                }}
              >
                {f}
              </button>
            );
          })}
        </div>
      </div>

      {/* Estado de publicación */}
      <div>
        <label style={labelStyle}>Estado de publicación</label>
        <div style={{ display: "flex", gap: "8px" }}>
          {([
            { value: "Publicado" as const,   label: "Publicar ahora",    desc: "Visible para todos",      icon: "🟢" },
            { value: "En revisión" as const, label: "En revisión",       desc: "Pendiente de aprobación", icon: "🟡" },
            { value: "Borrador" as const,    label: "Guardar borrador",  desc: "Solo tú puedes verlo",    icon: "⚪" },
          ]).map((option) => {
            const selected = data.status === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => updateField("status", option.value)}
                style={{
                  flex: 1, padding: "14px 10px",
                  borderRadius: "14px",
                  border: selected ? "1.5px solid #004FCD" : "1.5px solid rgba(0,0,0,0.07)",
                  background: selected ? "rgba(0,79,205,0.05)" : "rgba(0,0,0,0.02)",
                  cursor: "pointer", textAlign: "left",
                  transition: "all 0.15s",
                  boxShadow: selected ? "0 2px 12px rgba(0,79,205,0.12)" : "none",
                }}
              >
                <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "12px", fontWeight: 600, color: selected ? "#004FCD" : "#333", marginBottom: "2px" }}>
                  {option.icon} {option.label}
                </p>
                <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", color: "#999" }}>
                  {option.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
