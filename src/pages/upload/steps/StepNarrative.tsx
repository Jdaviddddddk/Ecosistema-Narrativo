import { useUpload } from "@/context/UploadContext";

export default function StepNarrative() {
  const { data, updateField } = useUpload();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-nexo-dark" style={{ fontFamily: "'Sono', sans-serif" }}>
        Historia de origen
      </h2>
      <p className="text-sm text-gray-500">
        Cuéntanos cómo nació este proyecto. ¿Qué problema resuelve? ¿Qué te inspiró?
      </p>

      <textarea
        value={data.originStory}
        onChange={(e) => updateField("originStory", e.target.value)}
        placeholder="Este proyecto nació cuando..."
        rows={6}
        className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexo-primary resize-none"
      />
    </div>
  );
}