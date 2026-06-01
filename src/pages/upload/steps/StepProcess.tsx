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
      <h2 className="text-xl font-semibold text-nexo-dark" style={{ fontFamily: "'Sono', sans-serif" }}>
        Proceso creativo
      </h2>
      <p className="text-sm text-gray-500" style={{ fontFamily: "'Montserrat', sans-serif" }}>
        Describe las etapas por las que pasó tu proyecto.
      </p>

      <div className="flex gap-2">
        <input
          type="text"
          value={newStep}
          onChange={(e) => setNewStep(e.target.value)}
          placeholder="Ej: Investigación de campo"
          className="flex-1 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexo-primary"
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <button
          onClick={handleAdd}
          className="px-5 py-3 bg-nexo-primary text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
        >
          Agregar
        </button>
      </div>

      <div className="space-y-2">
        {data.process.map((step, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl group"
          >
            <span className="w-8 h-8 rounded-full bg-nexo-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
              {i + 1}
            </span>
            <span className="flex-1 text-sm text-gray-700">{step}</span>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleMove(i, -1)}
                disabled={i === 0}
                className="p-1.5 hover:bg-gray-200 rounded-lg disabled:opacity-30 transition-colors"
              >
                ↑
              </button>
              <button
                onClick={() => handleMove(i, 1)}
                disabled={i === data.process.length - 1}
                className="p-1.5 hover:bg-gray-200 rounded-lg disabled:opacity-30 transition-colors"
              >
                ↓
              </button>
              <button
                onClick={() => handleRemove(i)}
                className="p-1.5 hover:bg-red-100 text-red-500 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      {data.process.length === 0 && (
        <p className="text-center text-sm text-gray-400 py-8">
          Aún no has agregado pasos. Empieza con el primero.
        </p>
      )}
    </div>
  );
}