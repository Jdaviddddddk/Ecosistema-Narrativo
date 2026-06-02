import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import type { Project } from "@/config/projects";

interface UploadData {
  title: string;
  area: string;
  semester: string;
  subject: string;
  originStory: string;
  tools: string[];
  format: string;
  fullLink: string;
  learnings: string;
  thumbnail: string;
  images: string[];
  process: string[];
  collections: string[];
  visibility: "Público" | "Privado" | "Solo comunidad";
  status: "Publicado" | "En revisión" | "Borrador";
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
  learnings: "",
  thumbnail: "",
  images: [] as string[],
  process: [],
  collections: [],
  visibility: "Público",
  status: "En revisión",
};

interface UploadContextType {
  data: UploadData;
  updateField: <K extends keyof UploadData>(field: K, value: UploadData[K]) => void;
  updateFields: (fields: Partial<UploadData>) => void;
  reset: () => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export function UploadProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<UploadData>(initialData);

  const updateField = useCallback(<K extends keyof UploadData>(field: K, value: UploadData[K]) => {
    setData(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateFields = useCallback((fields: Partial<UploadData>) => {
    setData(prev => ({ ...prev, ...fields }));
  }, []);

  const reset = useCallback(() => {
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