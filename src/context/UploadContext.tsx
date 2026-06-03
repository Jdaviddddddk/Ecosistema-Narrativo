import { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { ReactNode } from "react";

const DRAFT_KEY = "nexo_upload_draft";

interface UploadData {
  title: string;
  area: string;
  semester: string;
  subject: string;
  originStory: string;
  tools: string[];
  format: string;
  fullLink: string;
  prototypeLink: string;
  learnings: string;
  thumbnail: string;
  images: string[];
  process: string[];
  collections: string[];
  visibility: "Público" | "Privado" | "Solo comunidad";
  status: "Publicado" | "En revisión" | "Borrador";
  productionStatus: "Ideación" | "En desarrollo" | "Prototipo" | "En producción" | "Finalizado" | "Archivado";
}

const initialData: UploadData = {
  title: "",
  area: "",
  semester: "",
  subject: "",
  originStory: "",
  tools: [],
  format: "",
  fullLink: "",
  prototypeLink: "",
  learnings: "",
  thumbnail: "",
  images: [] as string[],
  process: [],
  collections: [],
  visibility: "Público",
  status: "En revisión",
  productionStatus: "En desarrollo",
};

interface UploadContextType {
  data: UploadData;
  updateField: <K extends keyof UploadData>(field: K, value: UploadData[K]) => void;
  updateFields: (fields: Partial<UploadData>) => void;
  reset: () => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

function loadDraft(): UploadData {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return initialData;
    return { ...initialData, ...JSON.parse(raw) };
  } catch {
    return initialData;
  }
}

function saveDraft(data: UploadData) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  } catch {
    // quota exceeded — silently ignore
  }
}

export function UploadProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<UploadData>(loadDraft);

  // Persist every change to localStorage
  useEffect(() => {
    saveDraft(data);
  }, [data]);

  const updateField = useCallback(<K extends keyof UploadData>(field: K, value: UploadData[K]) => {
    setData(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateFields = useCallback((fields: Partial<UploadData>) => {
    setData(prev => ({ ...prev, ...fields }));
  }, []);

  const reset = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY);
    setData(initialData);
  }, []);

  return (
    <UploadContext.Provider value={{ data, updateField, updateFields, reset }}>
      {children}
    </UploadContext.Provider>
  );
}

export function useUpload() {
  const ctx = useContext(UploadContext);
  if (!ctx) throw new Error("useUpload must be inside UploadProvider");
  return ctx;
}