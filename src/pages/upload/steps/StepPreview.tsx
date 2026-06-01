import { useUpload } from "@/context/UploadContext";
import { useAuth } from "@/context/AuthContext";

export default function StepPreview() {
  const { data } = useUpload();
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-nexo-dark" style={{ fontFamily: "'Sono', sans-serif" }}>
        Vista previa
      </h2>

      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <img 
            src={user?.avatar || "/images/avatar_default.jpg"} 
            alt={user?.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="font-medium text-sm">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>

        {data.thumbnail && (
          <img src={data.thumbnail} alt={data.title} className="w-full h-48 object-cover rounded-xl" />
        )}

        <h3 className="text-lg font-bold">{data.title || "Sin título"}</h3>
        <p className="text-sm text-gray-600">{data.area} · {data.semester}</p>
        <p className="text-sm text-gray-500 line-clamp-3">{data.originStory}</p>

        <div className="flex flex-wrap gap-2">
          {data.tools.map((tool) => (
            <span key={tool} className="text-xs px-3 py-1 bg-white rounded-full border border-gray-200">
              {tool}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}