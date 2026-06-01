import { useUpload } from "@/context/UploadContext";

export default function StepCredits() {
  const { data, updateField } = useUpload();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-nexo-dark" style={{ fontFamily: "'Sono', sans-serif" }}>
        Créditos y enlaces
      </h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enlace al proyecto completo
        </label>
        <input
          type="text"
          value={data.fullLink}
          onChange={(e) => updateField("fullLink", e.target.value)}
          placeholder="behance.net/tuusuario/proyecto"
          className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexo-primary"
        />
        <p className="text-xs text-gray-400 mt-1">Behance, Dribbble, GitHub, etc.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Formato de entrega
        </label>
        <select
          value={data.format}
          onChange={(e) => updateField("format", e.target.value)}
          className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexo-primary"
        >
          <option value="">Selecciona formato</option>
          <option value="Digital">Digital</option>
          <option value="Impreso">Impreso</option>
          <option value="Digital + Impreso">Digital + Impreso</option>
          <option value="Físico">Físico</option>
          <option value="Interactivo">Interactivo</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Estado de publicación
        </label>
        <div className="flex gap-3">
          {([
            { value: "Publicado" as const, label: "Publicar ahora", desc: "Visible para todos" },
            { value: "En revisión" as const, label: "En revisión", desc: "Pendiente de aprobación" },
            { value: "Borrador" as const, label: "Guardar borrador", desc: "Solo tú puedes verlo" },
          ]).map((option) => (
            <button
              key={option.value}
              onClick={() => updateField("status", option.value)}
              className={`flex-1 p-4 rounded-xl text-left border-2 transition-all ${
                data.status === option.value
                  ? "border-nexo-primary bg-blue-50"
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <p className={`font-medium text-sm ${data.status === option.value ? "text-nexo-primary" : "text-gray-700"}`}>
                {option.label}
              </p>
              <p className="text-xs text-gray-400 mt-1">{option.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}