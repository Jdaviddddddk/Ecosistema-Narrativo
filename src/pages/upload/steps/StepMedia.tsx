import { useUpload } from "@/context/UploadContext";
import { useState } from "react";

export default function StepMedia() {
  const { data, updateField, updateFields } = useUpload();
  const [imageUrl, setImageUrl] = useState("");

  const handleAddImage = () => {
    if (imageUrl.trim()) {
      updateField("images", [...data.images, imageUrl.trim()]);
      if (!data.thumbnail) {
        updateField("thumbnail", imageUrl.trim());
      }
      setImageUrl("");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-nexo-dark" style={{ fontFamily: "'Sono', sans-serif" }}>
        Multimedia
      </h2>

      {/* Thumbnail */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Imagen principal (thumbnail)</label>
        <input
          type="text"
          value={data.thumbnail}
          onChange={(e) => updateField("thumbnail", e.target.value)}
          placeholder="URL de la imagen principal"
          className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexo-primary"
        />
        {data.thumbnail && (
          <img src={data.thumbnail} alt="Preview" className="mt-3 w-32 h-32 object-cover rounded-xl" />
        )}
      </div>

      {/* Gallery */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Galería de imágenes</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="URL de imagen"
            className="flex-1 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexo-primary"
            onKeyDown={(e) => e.key === "Enter" && handleAddImage()}
          />
          <button
            onClick={handleAddImage}
            className="px-4 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          >
            +
          </button>
        </div>
        <div className="flex gap-2 mt-3 flex-wrap">
          {data.images.map((img, i) => (
            <div key={i} className="relative">
              <img src={img} alt="" className="w-20 h-20 object-cover rounded-lg" />
              <button
                onClick={() => updateField("images", data.images.filter((_, idx) => idx !== i))}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}