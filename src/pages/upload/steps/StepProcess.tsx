import { useUpload } from "@/context/UploadContext";
import { useState } from "react";

export default function StepProcess() {
  const { data, updateField } = useUpload();
  const [newStep, setNewStep] = useState("");

  const handleAdd = () => {
    if (newStep.trim()) {
      updateField("process", [...data.process, newStep.trim()]);
      setNewStep("");
    }
  };

  const handleRemove = (index: number) => {
    updateField("process", data.process.filter((_, i) => i !== index));
  };

  const handleMove = (index: number, direction: -1 | 1) => {
    const newProcess = [...data.process];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= newProcess.length) return;
    [newProcess[index], newProcess[newIndex]] = [newProcess[newIndex], newProcess[index]];
    updateField("process", newProcess);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 style={{ fontFamily: "'Sono', sans-serif", fontSize: "22px", fontWeight: 700, color: "#0a0a0a", marginBottom: "6px" }}>
          Proceso creativo
        </h2>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "13px", color: "#888" }}>
          Describe las etapas por las que pasó tu proyecto.
        </p>
      </div>

      <div style={{ display: "flex", gap: "8px" }}>
        <input
          type="text"
          value={newStep}
          onChange={(e) => setNewStep(e.target.value)}
          placeholder="Ej: Investigación de campo"
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          style={{
            flex: 1, padding: "12px 16px",
            border: "1.5px solid rgba(0,0,0,0.08)",
            borderRadius: "14px",
            background: "rgba(0,0,0,0.02)",
            fontFamily: "'Montserrat', sans-serif",
            fontSize: "14px", outline: "none",
          }}
          onFocus={e => { e.target.style.borderColor = "#004FCD"; e.target.style.boxShadow = "0 0 0 3px rgba(0,79,205,0.1)"; }}
          onBlur={e => { e.target.style.borderColor = "rgba(0,0,0,0.08)"; e.target.style.boxShadow = "none"; }}
        />
        <button
          onClick={handleAdd}
          type="button"
          style={{
            padding: "12px 20px",
            borderRadius: "14px",
            background: "linear-gradient(135deg, #004FCD, #3b7de8)",
            color: "#fff",
            fontFamily: "'Montserrat', sans-serif",
            fontSize: "13px", fontWeight: 600,
            border: "none", cursor: "pointer",
            boxShadow: "0 4px 14px rgba(0,79,205,0.3)",
            whiteSpace: "nowrap",
          }}
        >
          + Agregar
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {data.process.map((step, i) => (
          <div
            key={i}
            style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "14px 16px",
              borderRadius: "14px",
              background: "rgba(0,0,0,0.02)",
              border: "1.5px solid rgba(0,0,0,0.06)",
              transition: "border-color 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(0,79,205,0.2)")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(0,0,0,0.06)")}
          >
            <div style={{
              width: "28px", height: "28px", borderRadius: "50%",
              background: "linear-gradient(135deg, #004FCD, #3b7de8)",
              color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Sono', sans-serif", fontSize: "12px", fontWeight: 700, flexShrink: 0,
            }}>
              {i + 1}
            </div>
            <span style={{ flex: 1, fontFamily: "'Montserrat', sans-serif", fontSize: "14px", color: "#333" }}>
              {step}
            </span>
            <div style={{ display: "flex", gap: "4px" }}>
              <button
                onClick={() => handleMove(i, -1)}
                disabled={i === 0}
                type="button"
                style={{ padding: "4px 8px", borderRadius: "8px", border: "none", background: "transparent", cursor: i === 0 ? "not-allowed" : "pointer", color: i === 0 ? "#ccc" : "#666", fontSize: "14px" }}
              >↑</button>
              <button
                onClick={() => handleMove(i, 1)}
                disabled={i === data.process.length - 1}
                type="button"
                style={{ padding: "4px 8px", borderRadius: "8px", border: "none", background: "transparent", cursor: i === data.process.length - 1 ? "not-allowed" : "pointer", color: i === data.process.length - 1 ? "#ccc" : "#666", fontSize: "14px" }}
              >↓</button>
              <button
                onClick={() => handleRemove(i)}
                type="button"
                style={{ padding: "4px 8px", borderRadius: "8px", border: "none", background: "rgba(239,68,68,0.06)", cursor: "pointer", color: "#ef4444", fontSize: "16px", lineHeight: 1 }}
              >×</button>
            </div>
          </div>
        ))}
      </div>

      {data.process.length === 0 && (
        <div style={{
          padding: "32px", textAlign: "center",
          borderRadius: "16px",
          border: "1.5px dashed rgba(0,0,0,0.1)",
        }}>
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "13px", color: "#aaa" }}>
            Aún no has agregado pasos. Empieza con el primero.
          </p>
        </div>
      )}
    </div>
  );
}
