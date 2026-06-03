import { useUpload } from "@/context/UploadContext";

export default function StepNarrative() {
  const { data, updateField } = useUpload();
  const len = data.originStory.length;

  return (
    <div className="space-y-6">
      <div>
        <h2 style={{ fontFamily: "'Sono', sans-serif", fontSize: "22px", fontWeight: 700, color: "#0a0a0a", marginBottom: "6px" }}>
          Historia de origen
        </h2>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "13px", color: "#888" }}>
          Cuéntanos cómo nació este proyecto. ¿Qué problema resuelve? ¿Qué te inspiró?
        </p>
      </div>

      <div style={{ position: "relative" }}>
        <textarea
          value={data.originStory}
          onChange={(e) => updateField("originStory", e.target.value)}
          placeholder="Este proyecto nació cuando..."
          rows={7}
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
        <span style={{
          position: "absolute", bottom: "12px", right: "16px",
          fontFamily: "'Montserrat', sans-serif", fontSize: "11px",
          color: len > 400 ? "#22c55e" : "#bbb",
        }}>
          {len} caracteres
        </span>
      </div>

      {len > 0 && (
        <div style={{
          padding: "16px 20px",
          borderRadius: "14px",
          background: "rgba(0,79,205,0.04)",
          border: "1px solid rgba(0,79,205,0.1)",
        }}>
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "13px", color: "#444", fontStyle: "italic", lineHeight: 1.6 }}>
            "{data.originStory.slice(0, 120)}{data.originStory.length > 120 ? "..." : ""}"
          </p>
        </div>
      )}
    </div>
  );
}
