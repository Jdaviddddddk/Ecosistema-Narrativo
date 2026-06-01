import { useUpload } from "@/context/UploadContext";

export default function StepLearnings() {
  const { data, updateField } = useUpload();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-nexo-dark" style={{ fontFamily: "'Sono', sans-serif" }}>
        Aprendizajes clave
      </h2>
      <p className="text-sm text-gray-500">
        ¿Qué aprendiste con este proyecto? Comparte tus insights para que otros se inspiren.
      </p>

      <textarea
        value={data.learnings}
        onChange={(e) => updateField("learnings", e.target.value)}
        placeholder="Este proyecto me enseñó que..."
        rows={6}
        className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexo-primary resize-none"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Colecciones (etiquetas)
        </label>
        <input
          type="text"
          value={data.collections.join(", ")}
          onChange={(e) => updateField("collections", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
          placeholder="Ej: Mejores Branding 2026, 7° semestre, Sostenibilidad"
          className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexo-primary"
        />
        <p className="text-xs text-gray-400 mt-1">Separa las colecciones con comas</p>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-xl p-6 mt-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Resumen de tu proyecto</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-400">Título:</span>{" "}
            <span className="text-gray-700 font-medium">{data.title || "—"}</span>
          </div>
          <div>
            <span className="text-gray-400">Área:</span>{" "}
            <span className="text-gray-700 font-medium">{data.area || "—"}</span>
          </div>
          <div>
            <span className="text-gray-400">Semestre:</span>{" "}
            <span className="text-gray-700 font-medium">{data.semester || "—"}</span>
          </div>
          <div>
            <span className="text-gray-400">Herramientas:</span>{" "}
            <span className="text-gray-700 font-medium">{data.tools.length || "—"}</span>
          </div>
          <div>
            <span className="text-gray-400">Imágenes:</span>{" "}
            <span className="text-gray-700 font-medium">{data.images.length || "—"}</span>
          </div>
          <div>
            <span className="text-gray-400">Estado:</span>{" "}
            <span className="text-gray-700 font-medium">{data.status}</span>
          </div>
        </div>
      </div>
    </div>
  );
}