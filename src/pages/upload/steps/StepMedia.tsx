import { useUpload } from "@/context/UploadContext";
import { useState, useRef, useCallback } from "react";

interface StepMediaProps {
  onFilesChange?: (files: File[]) => void;
}

export default function StepMedia({ onFilesChange }: StepMediaProps) {
  const { data, updateField } = useUpload();
  const [previews, setPreviews] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    // Crear previews
    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
    
    // Actualizar estado local
    const updatedFiles = [...files, ...selectedFiles];
    const updatedPreviews = [...previews, ...newPreviews];
    
    setFiles(updatedFiles);
    setPreviews(updatedPreviews);

    // Notificar al padre (UploadFlow)
    onFilesChange?.(updatedFiles);

    // Guardar previews en el contexto para el preview final
    updateField("images", updatedPreviews);
    
    // La primera imagen es el thumbnail por defecto
    if (!data.thumbnail || previews.length === 0) {
      updateField("thumbnail", newPreviews[0]);
    }

    // Limpiar input para permitir seleccionar el mismo archivo otra vez
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [files, previews, data.thumbnail, updateField, onFilesChange]);

  const handleRemoveImage = useCallback((index: number) => {
    // Revocar URL para liberar memoria
    URL.revokeObjectURL(previews[index]);

    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);

    setFiles(newFiles);
    setPreviews(newPreviews);
    onFilesChange?.(newFiles);
    updateField("images", newPreviews);

    // Actualizar thumbnail si era la que eliminamos
    if (data.thumbnail === previews[index]) {
      updateField("thumbnail", newPreviews.length > 0 ? newPreviews[0] : "");
    }
  }, [files, previews, data.thumbnail, updateField, onFilesChange]);

  const handleSetThumbnail = useCallback((index: number) => {
    updateField("thumbnail", previews[index]);
  }, [previews, updateField]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-nexo-dark" style={{ fontFamily: "'Sono', sans-serif" }}>
        Multimedia
      </h2>

      {/* Input de archivos oculto */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Botón para seleccionar archivos */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full p-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-nexo-primary hover:bg-blue-50 transition-all cursor-pointer"
        type="button"
      >
        <div className="text-center">
          <svg 
            className="mx-auto h-12 w-12 text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" 
            />
          </svg>
          <p className="mt-2 text-sm text-gray-600">Haz clic para seleccionar imágenes</p>
          <p className="text-xs text-gray-400">JPG, PNG, WebP, GIF. Máx 10MB por imagen</p>
        </div>
      </button>

      {/* Preview de imágenes seleccionadas */}
      {previews.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imágenes seleccionadas ({previews.length})
          </label>
          <div className="grid grid-cols-3 gap-3">
            {previews.map((preview, i) => (
              <div 
                key={i} 
                className={`relative group rounded-lg overflow-hidden border-2 ${
                  data.thumbnail === preview ? "border-nexo-primary" : "border-transparent"
                }`}
              >
                <img 
                  src={preview} 
                  alt={`Preview ${i + 1}`} 
                  className="w-full h-32 object-cover"
                />
                
                {/* Badge de thumbnail */}
                {data.thumbnail === preview && (
                  <span className="absolute top-1 left-1 px-2 py-0.5 bg-nexo-primary text-white text-xs rounded font-medium">
                    Principal
                  </span>
                )}

                {/* Botón eliminar */}
                <button
                  onClick={() => handleRemoveImage(i)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  type="button"
                >
                  ×
                </button>

                {/* Botón establecer como thumbnail */}
                {data.thumbnail !== preview && (
                  <button
                    onClick={() => handleSetThumbnail(i)}
                    className="absolute bottom-1 left-1 right-1 py-1 bg-black/50 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    type="button"
                  >
                    Hacer principal
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}