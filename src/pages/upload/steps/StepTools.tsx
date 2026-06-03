import { useUpload } from "@/context/UploadContext";
import { useState } from "react";

const COMMON_TOOLS = [
  "Illustrator", "Photoshop", "Figma", "After Effects", "Premiere Pro",
  "Blender", "Cinema 4D", "Rhino", "Grasshopper", "AutoCAD",
  "Procreate", "Processing", "TouchDesigner", "Unity", "Unreal Engine",
  "D3.js", "React", "Vue", "Python", "R",
  "Lightroom", "DaVinci Resolve", "InDesign", "Sketch", "XD",
];

export default function StepTools() {
  const { data, updateField } = useUpload();
  const [customTool, setCustomTool] = useState("");

  const toggleTool = (tool: string) => {
    if (data.tools.includes(tool)) {
      updateField("tools", data.tools.filter((t) => t !== tool));
    } else {
      updateField("tools", [...data.tools, tool]);
    }
  };

  const addCustomTool = () => {
    if (customTool.trim() && !data.tools.includes(customTool.trim())) {
      updateField("tools", [...data.tools, customTool.trim()]);
      setCustomTool("");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 style={{ fontFamily: "'Sono', sans-serif", fontSize: "22px", fontWeight: 700, color: "#0a0a0a", marginBottom: "6px" }}>
          Herramientas utilizadas
        </h2>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "13px", color: "#888" }}>
          Selecciona las herramientas que usaste en este proyecto.
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {COMMON_TOOLS.map((tool) => {
          const selected = data.tools.includes(tool);
          return (
            <button
              key={tool}
              onClick={() => toggleTool(tool)}
              type="button"
              style={{
                padding: "8px 16px",
                borderRadius: "100px",
                border: selected ? "1.5px solid #004FCD" : "1.5px solid rgba(0,0,0,0.08)",
                background: selected ? "rgba(0,79,205,0.08)" : "rgba(0,0,0,0.02)",
                color: selected ? "#004FCD" : "#555",
                fontFamily: "'Montserrat', sans-serif",
                fontSize: "12px", fontWeight: selected ? 600 : 500,
                cursor: "pointer",
                transition: "all 0.15s",
                boxShadow: selected ? "0 2px 8px rgba(0,79,205,0.18)" : "none",
              }}
            >
              {selected && <span style={{ marginRight: "4px" }}>✓</span>}
              {tool}
            </button>
          );
        })}
      </div>

      <div style={{ paddingTop: "8px", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        <label style={{ display: "block", fontFamily: "'Montserrat', sans-serif", fontSize: "12px", fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px" }}>
          Otra herramienta
        </label>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            value={customTool}
            onChange={(e) => setCustomTool(e.target.value)}
            placeholder="Nombre de la herramienta"
            onKeyDown={(e) => e.key === "Enter" && addCustomTool()}
            style={{
              flex: 1, padding: "11px 16px",
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
            onClick={addCustomTool}
            type="button"
            style={{
              padding: "11px 18px",
              borderRadius: "14px",
              border: "1.5px solid rgba(0,0,0,0.1)",
              background: "rgba(0,0,0,0.03)",
              color: "#333",
              fontFamily: "'Montserrat', sans-serif",
              fontSize: "13px", fontWeight: 600,
              cursor: "pointer", whiteSpace: "nowrap",
            }}
          >
            Agregar
          </button>
        </div>
      </div>

      {data.tools.length > 0 && (
        <div>
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", color: "#999", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
            Seleccionadas ({data.tools.length})
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {data.tools.map((tool) => (
              <span
                key={tool}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  padding: "6px 12px",
                  borderRadius: "100px",
                  background: "rgba(0,79,205,0.07)",
                  border: "1px solid rgba(0,79,205,0.15)",
                  color: "#004FCD",
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "12px", fontWeight: 500,
                }}
              >
                {tool}
                <button
                  onClick={() => toggleTool(tool)}
                  type="button"
                  style={{ border: "none", background: "transparent", cursor: "pointer", color: "#004FCD", fontSize: "14px", lineHeight: 1, padding: 0, opacity: 0.6 }}
                >×</button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
