import { useUpload } from "@/context/UploadContext";

export default function StepIdentity() {
  const { data, updateField } = useUpload();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-nexo-dark" style={{ fontFamily: "'Sono', sans-serif" }}>
        Identidad académica
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Semestre</label>
          <select
            value={data.semester}
            onChange={(e) => updateField("semester", e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexo-primary"
          >
            <option value="">Selecciona</option>
            {["1°", "2°", "3°", "4°", "5°", "6°", "7°", "8°", "9°", "10°"].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Materia</label>
          <input
            type="text"
            value={data.subject}
            onChange={(e) => updateField("subject", e.target.value)}
            placeholder="Ej: Diseño de Identidad Visual"
            className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexo-primary"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Visibilidad</label>
        <div className="flex gap-3">
          {(["Público", "Privado", "Solo comunidad"] as const).map((v) => (
            <button
              key={v}
              onClick={() => updateField("visibility", v)}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                data.visibility === v
                  ? "bg-nexo-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}