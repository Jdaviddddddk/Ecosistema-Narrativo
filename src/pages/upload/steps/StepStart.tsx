import { useUpload } from "@/context/UploadContext";

export default function StepStart() {
  const { data, updateField } = useUpload();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-nexo-dark" style={{ fontFamily: "'Sono', sans-serif" }}>
        ¿Qué vas a compartir hoy?
      </h2>
      <p className="text-sm text-gray-500" style={{ fontFamily: "'Montserrat', sans-serif" }}>
        Tu proyecto formará parte del ecosistema narrativo de la Universidad Colegio Mayor de Cundinamarca.
      </p>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          Título del proyecto
        </label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => updateField("title", e.target.value)}
          placeholder="Ej: Rebranding de la cafetería universitaria"
          className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexo-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          Área
        </label>
        <select
          value={data.area}
          onChange={(e) => updateField("area", e.target.value)}
          className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexo-primary"
        >
          <option value="">Selecciona un área</option>
          {["Branding", "Tipografía", "UX/UI", "Arquitectura", "Fotografía", "Ilustración", "Data Viz", "Moda", "XR", "Motion", "Diseño Gráfico", "Señalética"].map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>
    </div>
  );
}