import { useUpload } from "@/context/UploadContext";

export default function StepLearnings() {
  const { data, updateField } = useUpload();

  const summaryItems = [
    { label: "Título",       value: data.title },
    { label: "Área",         value: data.area },
    { label: "Semestre",     value: data.semester },
    { label: "Estado",       value: data.productionStatus },
    { label: "Herramientas", value: data.tools.length ? `${data.tools.length} seleccionadas` : undefined },
    { label: "Imágenes",     value: data.images.length ? `${data.images.length} imagen${data.images.length > 1 ? "es" : ""}` : undefined },
    { label: "Publicación",  value: data.status },
  ];

  return (
    <div className="space-y-7">
      <div>
        <h2 style={{ fontFamily: "'Sono', sans-serif", fontSize: "22px", fontWeight: 700, color: "#0a0a0a", marginBottom: "6px" }}>
          Aprendizajes clave
        </h2>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "13px", color: "#888" }}>
          ¿Qué aprendiste con este proyecto? Comparte tus insights para que otros se inspiren.
        </p>
      </div>

      <div style={{ position: "relative" }}>
        <textarea
          value={data.learnings}
          onChange={(e) => updateField("learnings", e.target.value)}
          placeholder="Este proyecto me enseñó que..."
          rows={5}
          style={{
            width: "100%", padding: "16px", resize: "none",
            border: "1.5px solid rgba(0,0,0,0.08)",
            borderRadius: "16px",
            background: "rgba(0,0,0,0.02)",
            fontFamily: "'Montserrat', sans-serif",
            fontSize: "14px", lineHeight: 1.7,
            color: "#1a1a1a", outline: "none",
          }}
          onFocus={e => { e.target.style.borderColor = "#004FCD"; e.target.style.boxShadow = "0 0 0 3px rgba(0,79,205,0.1)"; }}
          onBlur={e => { e.target.style.borderColor = "rgba(0,0,0,0.08)"; e.target.style.boxShadow = "none"; }}
        />
      </div>

      <div>
        <label style={{ display: "block", fontFamily: "'Montserrat', sans-serif", fontSize: "12px", fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px" }}>
          Colecciones / etiquetas
        </label>
        <input
          type="text"
          value={data.collections.join(", ")}
          onChange={(e) => updateField("collections", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
          placeholder="Ej: Mejores Branding 2026, 7° semestre, Sostenibilidad"
          style={{
            width: "100%", padding: "12px 16px",
            border: "1.5px solid rgba(0,0,0,0.08)",
            borderRadius: "14px",
            background: "rgba(0,0,0,0.02)",
            fontFamily: "'Montserrat', sans-serif",
            fontSize: "14px", color: "#1a1a1a", outline: "none",
          }}
          onFocus={e => { e.target.style.borderColor = "#004FCD"; e.target.style.boxShadow = "0 0 0 3px rgba(0,79,205,0.1)"; }}
          onBlur={e => { e.target.style.borderColor = "rgba(0,0,0,0.08)"; e.target.style.boxShadow = "none"; }}
        />
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", color: "#aaa", marginTop: "5px" }}>
          Separa las colecciones con comas
        </p>
      </div>

      {/* Summary */}
      <div style={{
        borderRadius: "16px",
        border: "1.5px solid rgba(0,79,205,0.1)",
        overflow: "hidden",
      }}>
        <div style={{ padding: "12px 16px", background: "rgba(0,79,205,0.05)", borderBottom: "1px solid rgba(0,79,205,0.08)" }}>
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", fontWeight: 700, color: "#004FCD", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Resumen del proyecto
          </p>
        </div>
        <div style={{ padding: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          {summaryItems.map(({ label, value }) => (
            <div key={label}>
              <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", color: "#aaa" }}>{label}: </span>
              <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "12px", fontWeight: 600, color: value ? "#1a1a1a" : "#ddd" }}>
                {value || "—"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
