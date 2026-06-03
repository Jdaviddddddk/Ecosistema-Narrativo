import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { UploadProvider, useUpload } from "@/context/UploadContext";
import { useAuth } from "@/context/AuthContext";
import { projectsAPI } from '@/lib/api';
import StepStart from "./steps/StepStart";
import StepIdentity from "./steps/StepIdentity";
import StepNarrative from "./steps/StepNarrative";
import StepMedia from "./steps/StepMedia";
import StepProcess from "./steps/StepProcess";
import StepCredits from "./steps/StepCredits";
import StepTools from "./steps/StepTools";
import StepLearnings from "./steps/StepLearnings";
import StepPreview from "./steps/StepPreview";

export default function UploadFlowWrapper() {
  return (
    <UploadProvider>
      <UploadFlow />
    </UploadProvider>
  );
}

function UploadFlow() {
  const [step, setStep] = useState(0);
  const { data, reset } = useUpload();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const imageFilesRef = useRef<File[]>([]);
  const pdfFileRef = useRef<File | null>(null);

  const stepComponents = [
    <StepStart key="start" />,
    <StepIdentity key="identity" />,
    <StepNarrative key="narrative" />,
    <StepMedia
      key="media"
      onFilesChange={(files) => { imageFilesRef.current = files; }}
      onPdfChange={(file) => { pdfFileRef.current = file; }}
    />,
    <StepProcess key="process" />,
    <StepCredits key="credits" />,
    <StepTools key="tools" />,
    <StepLearnings key="learnings" />,
    <StepPreview key="preview" />,
  ];

  const stepTitles = [
    "Comenzar", "Identidad", "Narrativa", "Multimedia",
    "Proceso", "Créditos", "Herramientas", "Aprendizajes", "Vista previa",
  ];

  const handleNext = () => {
    if (step < stepComponents.length - 1) setStep(s => s + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(s => s - 1);
  };

  const handlePublish = async () => {
    if (!user) {
      setSubmitError("Debes iniciar sesión para publicar");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      if (imageFilesRef.current.length === 0) {
        setSubmitError("Debes subir al menos una imagen del proyecto");
        setIsSubmitting(false);
        return;
      }

      const projectData = {
        title: data.title || "Sin título",
        author: user.name,
        authorId: user.id,
        authorEmail: user.email,
        semester: data.semester || "1°",
        subject: data.subject || "Sin materia",
        area: data.area || "Diseño análogo",
        status: data.status || "En revisión",
        visibility: data.visibility || "Público",
        originStory: data.originStory || "",
        tools: data.tools || [],
        format: data.format || "Digital",
        fullLink: data.fullLink || "",
        prototypeLink: data.prototypeLink || "",
        learnings: data.learnings || "",
        recognitions: "",
        process: data.process.length > 0 ? data.process : ["Inicio", "Desarrollo", "Final"],
        collections: data.collections || [],
        relatedProjects: [],
        productionStatus: data.productionStatus || "En desarrollo",
      };

      const files = imageFilesRef.current;
      const formData = new FormData();
      formData.append("data", JSON.stringify(projectData));
      files.forEach((file) => {
        formData.append("images", file);
      });
      if (pdfFileRef.current) {
        formData.append("pdf", pdfFileRef.current);
      }

      console.log('Enviando proyecto con', files.length, 'imágenes');

      // Enviar al backend
      const created = await projectsAPI.createWithFiles(formData);

      console.log('Proyecto creado:', created);

      reset();
      imageFilesRef.current = [];
      pdfFileRef.current = null;

      // Redirigir
      navigate(`/projects/${created.id}`);
    } catch (err: any) {
      console.error('Error publicando:', err);
      setSubmitError(err.message || "Error al guardar el proyecto");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLastStep = step === stepComponents.length - 1;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-nexo-dark mb-2" style={{ fontFamily: "'Sono', sans-serif" }}>
            Subir Proyecto
          </h1>
          <p className="text-sm text-gray-500" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Paso {step + 1} de {stepComponents.length}: <span className="font-medium text-nexo-primary">{stepTitles[step]}</span>
          </p>
        </div>

        <div className="w-full h-1.5 bg-gray-200 rounded-full mb-8 overflow-hidden">
          <div 
            className="h-full bg-gradient-nexo rounded-full transition-all duration-500"
            style={{ width: `${((step + 1) / stepComponents.length) * 100}%` }}
          />
        </div>

        <div className="flex justify-center gap-2 mb-8">
          {stepTitles.map((_, i) => (
            <button
              key={i}
              onClick={() => i <= step && setStep(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                i === step ? "bg-nexo-primary w-6" : i < step ? "bg-nexo-primary/50" : "bg-gray-300"
              }`}
              disabled={i > step}
            />
          ))}
        </div>

        {submitError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {submitError}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          {stepComponents[step]}
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={handleBack}
            disabled={step === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all ${
              step === 0 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            ← Atrás
          </button>

          {isLastStep ? (
            <button
              onClick={handlePublish}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 bg-nexo-primary text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Guardando..." : "🚀 Publicar Proyecto"}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-8 py-3 bg-nexo-primary text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-all"
            >
              Siguiente →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}