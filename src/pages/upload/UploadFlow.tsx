import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { UploadProvider, useUpload } from "@/context/UploadContext";
import { useAuth } from "@/context/AuthContext";
import { projectsAPI } from '@/lib/api';
import NomadaGuia from "@/components/NomadaGuia";
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

const STEP_META = [
  { title: "Comenzar",      icon: "✦" },
  { title: "Identidad",     icon: "◎" },
  { title: "Narrativa",     icon: "❋" },
  { title: "Multimedia",    icon: "⬡" },
  { title: "Proceso",       icon: "◈" },
  { title: "Créditos",      icon: "◇" },
  { title: "Herramientas",  icon: "⊕" },
  { title: "Aprendizajes",  icon: "◉" },
  { title: "Vista previa",  icon: "→" },
];

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

  const handleNext = () => { if (step < stepComponents.length - 1) setStep(s => s + 1); };
  const handleBack = () => { if (step > 0) setStep(s => s - 1); };

  const handlePublish = async () => {
    if (!user) { setSubmitError("Debes iniciar sesión para publicar"); return; }
    if (imageFilesRef.current.length === 0) {
      setSubmitError("Debes subir al menos una imagen del proyecto");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const projectData = {
        title: data.title || "Sin título",
        author: user.name,
        authorId: user.id,
        authorEmail: user.email,
        authorAvatar: user.avatar,
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

      const formData = new FormData();
      formData.append("data", JSON.stringify(projectData));
      imageFilesRef.current.forEach((file) => { formData.append("images", file); });
      if (pdfFileRef.current) { formData.append("pdf", pdfFileRef.current); }

      const created = await projectsAPI.createWithFiles(formData);

      reset();
      imageFilesRef.current = [];
      pdfFileRef.current = null;
      navigate(`/projects/${created.id}`);
    } catch (err: any) {
      setSubmitError(err.message || "Error al guardar el proyecto");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLastStep = step === stepComponents.length - 1;
  const progress = ((step + 1) / stepComponents.length) * 100;

  return (
    <div className="min-h-screen pt-20 pb-16 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #ffffff 50%, #f5f0ff 100%)" }}>

      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #004FCD 0%, transparent 70%)", filter: "blur(60px)" }} />
      <div className="pointer-events-none absolute top-1/3 -right-24 w-72 h-72 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)", filter: "blur(50px)" }} />

      <div className="max-w-2xl mx-auto px-4 relative z-10">

        {/* Header */}
        <div className="mb-8 pt-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-xs font-medium"
            style={{ background: "rgba(0,79,205,0.08)", color: "#004FCD", fontFamily: "'Montserrat', sans-serif", backdropFilter: "blur(8px)" }}>
            <span style={{ opacity: 0.6 }}>Paso {step + 1} / {stepComponents.length}</span>
            <span className="w-1 h-1 rounded-full bg-current opacity-40" />
            <span className="font-semibold">{STEP_META[step].title}</span>
          </div>
          <h1 className="text-4xl font-bold" style={{ fontFamily: "'Sono', sans-serif", color: "#0a0a0a", letterSpacing: "-0.02em" }}>
            Subir Proyecto
          </h1>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.06)" }}>
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%`, background: "linear-gradient(90deg, #004FCD, #3b7de8)" }}
            />
          </div>
        </div>

        {/* Step dots with labels */}
        <div className="flex items-center justify-between mb-8 overflow-x-auto pb-1 gap-1">
          {STEP_META.map((s, i) => (
            <button
              key={i}
              onClick={() => i <= step && setStep(i)}
              disabled={i > step}
              title={s.title}
              className="flex flex-col items-center gap-1 flex-shrink-0 group"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-300 ${
                i === step
                  ? "shadow-lg scale-110"
                  : i < step
                  ? "opacity-70"
                  : "opacity-30"
              }`}
                style={{
                  background: i === step
                    ? "linear-gradient(135deg, #004FCD, #3b7de8)"
                    : i < step
                    ? "#004FCD"
                    : "rgba(0,0,0,0.08)",
                  color: i <= step ? "#fff" : "#999",
                  boxShadow: i === step ? "0 4px 14px rgba(0,79,205,0.35)" : "none",
                }}
              >
                {i < step ? "✓" : s.icon}
              </div>
              <span className={`text-xs transition-all hidden sm:block ${
                i === step ? "font-semibold" : "font-normal opacity-50"
              }`}
                style={{ fontFamily: "'Montserrat', sans-serif", color: i === step ? "#004FCD" : "#666", fontSize: "9px", letterSpacing: "0.05em" }}
              >
                {s.title.toUpperCase()}
              </span>
            </button>
          ))}
        </div>

        {/* Error */}
        {submitError && (
          <div className="mb-4 p-4 rounded-2xl text-sm flex items-center gap-3"
            style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", color: "#dc2626", fontFamily: "'Montserrat', sans-serif" }}>
            <span className="text-base">⚠</span> {submitError}
          </div>
        )}

        {/* Card */}
        <div className="rounded-3xl p-8 mb-6"
          style={{
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.9)",
            boxShadow: "0 8px 32px rgba(0,79,205,0.08), 0 1px 0 rgba(255,255,255,0.9) inset",
          }}>
          {stepComponents[step]}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center px-1">
          <button
            onClick={handleBack}
            disabled={step === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-medium transition-all"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              background: step === 0 ? "transparent" : "rgba(0,0,0,0.04)",
              color: step === 0 ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.6)",
              border: step === 0 ? "1px solid transparent" : "1px solid rgba(0,0,0,0.08)",
              cursor: step === 0 ? "not-allowed" : "pointer",
              backdropFilter: "blur(8px)",
            }}
          >
            ← Atrás
          </button>

          {isLastStep ? (
            <button
              onClick={handlePublish}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 rounded-2xl text-sm font-semibold transition-all"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                background: isSubmitting
                  ? "rgba(0,79,205,0.5)"
                  : "linear-gradient(135deg, #004FCD, #3b7de8)",
                color: "#fff",
                boxShadow: isSubmitting ? "none" : "0 4px 20px rgba(0,79,205,0.35)",
                border: "none",
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
            >
              {isSubmitting ? (
                <>
                  <img src="/images/nomada-loading.gif" alt="" style={{ width: "20px", height: "20px", imageRendering: "pixelated" }} />
                  Guardando...
                </>
              ) : (
                <>
                  <img src="/images/icons/icon-publicar.png" alt="" style={{ width: "20px", height: "20px", imageRendering: "pixelated" }} />
                  Publicar Proyecto
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-8 py-3 rounded-2xl text-sm font-semibold transition-all"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                background: "linear-gradient(135deg, #004FCD, #3b7de8)",
                color: "#fff",
                boxShadow: "0 4px 20px rgba(0,79,205,0.3)",
                border: "none",
              }}
            >
              Siguiente →
            </button>
          )}
        </div>

      </div>
      <NomadaGuia escena="primer-proyecto" onAccion={() => setStep(3)} />
    </div>
  );
}
