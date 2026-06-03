import { useUpload } from "@/context/UploadContext";
import { useState, useRef, useCallback } from "react";

interface StepMediaProps {
  onFilesChange?: (files: File[]) => void;
  onPdfChange?: (file: File | null) => void;
}

export default function StepMedia({ onFilesChange, onPdfChange }: StepMediaProps) {
  const { data, updateField } = useUpload();
  const [previews, setPreviews] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
    const updatedFiles = [...files, ...selectedFiles];
    const updatedPreviews = [...previews, ...newPreviews];

    setFiles(updatedFiles);
    setPreviews(updatedPreviews);
    onFilesChange?.(updatedFiles);
    updateField("images", updatedPreviews);

    if (!data.thumbnail || previews.length === 0) {
      updateField("thumbnail", newPreviews[0]);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [files, previews, data.thumbnail, updateField, onFilesChange]);

  const handleRemoveImage = useCallback((index: number) => {
    URL.revokeObjectURL(previews[index]);
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviews(newPreviews);
    onFilesChange?.(newFiles);
    updateField("images", newPreviews);
    if (data.thumbnail === previews[index]) {
      updateField("thumbnail", newPreviews.length > 0 ? newPreviews[0] : "");
    }
  }, [files, previews, data.thumbnail, updateField, onFilesChange]);

  const handleSetThumbnail = useCallback((index: number) => {
    updateField("thumbnail", previews[index]);
  }, [previews, updateField]);

  const handlePdfSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPdfFile(file);
    onPdfChange?.(file);
    if (pdfInputRef.current) pdfInputRef.current.value = "";
  }, [onPdfChange]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-nexo-dark" style={{ fontFamily: "'Sono', sans-serif" }}>
        Multimedia
      </h2>

      {/* Imágenes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Imágenes del proyecto <span className="text-red-500">*</span>
          <span className="text-xs text-gray-400 font-normal ml-1">(mínimo 1 requerida)</span>
        </label>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileSelect}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className={`w-full p-8 border-2 border-dashed rounded-xl hover:border-nexo-primary hover:bg-blue-50 transition-all cursor-pointer ${
            previews.length === 0 ? "border-red-300" : "border-gray-300"
          }`}
          type="button"
        >
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-600">Haz clic para seleccionar imágenes</p>
            <p className="text-xs text-gray-400">JPG, PNG, WebP, GIF. Máx 10MB por imagen</p>
          </div>
        </button>

        {previews.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">Imágenes seleccionadas ({previews.length})</p>
            <div className="grid grid-cols-3 gap-3">
              {previews.map((preview, i) => (
                <div
                  key={i}
                  className={`relative group rounded-lg overflow-hidden border-2 ${
                    data.thumbnail === preview ? "border-nexo-primary" : "border-transparent"
                  }`}
                >
                  <img src={preview} alt={`Preview ${i + 1}`} className="w-full h-32 object-cover" />
                  {data.thumbnail === preview && (
                    <span className="absolute top-1 left-1 px-2 py-0.5 bg-nexo-primary text-white text-xs rounded font-medium">
                      Principal
                    </span>
                  )}
                  <button
                    onClick={() => handleRemoveImage(i)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    type="button"
                  >×</button>
                  {data.thumbnail !== preview && (
                    <button
                      onClick={() => handleSetThumbnail(i)}
                      className="absolute bottom-1 left-1 right-1 py-1 bg-black/50 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      type="button"
                    >Hacer principal</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* PDF */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Documento PDF del proyecto
          <span className="text-xs text-gray-400 font-normal ml-1">(opcional)</span>
        </label>

        <input
          ref={pdfInputRef}
          type="file"
          accept="application/pdf"
          onChange={handlePdfSelect}
          className="hidden"
        />

        {pdfFile ? (
          <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl bg-red-50">
            <svg className="w-8 h-8 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z"/>
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{pdfFile.name}</p>
              <p className="text-xs text-gray-500">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button
              onClick={() => { setPdfFile(null); onPdfChange?.(null); }}
              className="text-red-500 hover:text-red-700 text-sm font-medium"
              type="button"
            >Quitar</button>
          </div>
        ) : (
          <button
            onClick={() => pdfInputRef.current?.click()}
            className="w-full p-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-nexo-primary hover:bg-blue-50 transition-all cursor-pointer"
            type="button"
          >
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
              <div className="text-left">
                <p className="text-sm text-gray-600">Adjuntar PDF del proyecto</p>
                <p className="text-xs text-gray-400">Memoria, informe, sustentación. Máx 20MB</p>
              </div>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
