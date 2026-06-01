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
      <h2 className="text-xl font-semibold text-nexo-dark" style={{ fontFamily: "'Sono', sans-serif" }}>
        Herramientas utilizadas
      </h2>
      <p className="text-sm text-gray-500">
        Selecciona las herramientas que usaste en este proyecto.
      </p>

      <div className="flex flex-wrap gap-2">
        {COMMON_TOOLS.map((tool) => (
          <button
            key={tool}
            onClick={() => toggleTool(tool)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              data.tools.includes(tool)
                ? "bg-nexo-primary text-white shadow-md shadow-blue-500/20"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tool}
          </button>
        ))}
      </div>

      <div className="pt-4 border-t border-gray-100">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Otra herramienta
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customTool}
            onChange={(e) => setCustomTool(e.target.value)}
            placeholder="Nombre de la herramienta"
            className="flex-1 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexo-primary"
            onKeyDown={(e) => e.key === "Enter" && addCustomTool()}
          />
          <button
            onClick={addCustomTool}
            className="px-5 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
          >
            Agregar
          </button>
        </div>
      </div>

      {data.tools.length > 0 && (
        <div className="pt-2">
          <p className="text-xs text-gray-400 mb-2">Seleccionadas ({data.tools.length}):</p>
          <div className="flex flex-wrap gap-2">
            {data.tools.map((tool) => (
              <span
                key={tool}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-nexo-primary rounded-full text-sm"
              >
                {tool}
                <button
                  onClick={() => toggleTool(tool)}
                  className="ml-1 hover:text-red-500 transition-colors"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}