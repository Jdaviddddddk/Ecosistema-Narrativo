import { useState } from "react";

import StepStart from "./steps/StepStart";
import StepIdentity from "./steps/StepIdentity";
import StepNarrative from "./steps/StepNarrative";
import StepMedia from "./steps/StepMedia";
import StepProcess from "./steps/StepProcess";
import StepCredits from "./steps/StepCredits";
import StepTools from "./steps/StepTools";
import StepLearnings from "./steps/StepLearnings";
import StepPreview from "./steps/StepPreview";

export default function UploadFlow() {
  const [step, setStep] = useState(0);

  const steps = [
    <StepStart />,
    <StepIdentity />,
    <StepNarrative />,
    <StepMedia />,
    <StepProcess />,
    <StepCredits />,
    <StepTools />,
    <StepLearnings />,
    <StepPreview />,
  ];

  return (
    <div style={{ padding: 40 }}>
      <h1>Upload Flow</h1>

      <div style={{ marginBottom: 20 }}>
        Paso actual: {step}
      </div>

      {steps[step]}

      <div style={{ marginTop: 20 }}>
        <button onClick={() => setStep((s) => Math.max(s - 1, 0))}>
          ← Atrás
        </button>

        <button onClick={() => setStep((s) => Math.min(s + 1, steps.length - 1))}>
          Siguiente →
        </button>
      </div>
    </div>
  );
}