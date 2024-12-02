import React from "react";
import { Card } from "../ui/card";
import { VoiceQuestion } from "./VoiceQuestion";
import { TextQuestion } from "./TextQuestion";

interface InputsPanelProps {
  cvData: any;
  handleBasicInfoChange: (field: any, value: string) => void;
  handleVoiceRecording: (field: any) => void;
  voiceRecording: boolean;
  isProcessing: boolean;
  browserSupportsSpeechRecognition: boolean;
}

export const InputsPanel = ({
  cvData,
  handleBasicInfoChange,
  handleVoiceRecording,
  voiceRecording,
  isProcessing,
  browserSupportsSpeechRecognition,
}: InputsPanelProps) => {
  const basicsTextInputs = [
    {
      placeholder: "Cómo te llamas?",
      value: cvData.basics.name,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        handleBasicInfoChange("name", e.target.value),
    },
    {
      placeholder: "Dónde vives?",
      value: cvData.basics.location,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        handleBasicInfoChange("location", e.target.value),
    },
    {
      placeholder: "Cuál es tu email?",
      value: cvData.basics.email,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        handleBasicInfoChange("email", e.target.value),
    },
    {
      placeholder: "Cuál es tu nacionalidad?",
      value: cvData.basics.nationalities,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        handleBasicInfoChange("nationalities", e.target.value),
    },
  ];
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-6">
        Hola! 👋 Empecemos con algunas preguntas.
      </h2>
      {/* Basic Information */}
      <TextQuestion
        title="Pregunta 1"
        description="Cuéntame sobre ti"
        textInputs={basicsTextInputs}
      />
      {/* Professional Experience */}
      <VoiceQuestion
        title="Pregunta 2"
        description="Cuéntame sobre tu experiencia profesional"
        category="experience"
        suggestedAnswers={[
          "Cual fue tu rol?",
          "Cómo se llamaba la empresa?",
          "Cuándo empezaste y terminaste?",
          "Cuáles fueron tus responsabilidades principales?",
        ]}
        voiceRecording={voiceRecording}
        handleVoiceRecording={handleVoiceRecording}
        browserSupportsSpeechRecognition={browserSupportsSpeechRecognition}
        isProcessing={isProcessing}
      />
      {/* Education */}
      <VoiceQuestion
        title="Pregunta 3"
        description="Cuéntame sobre tu educación"
        category="education"
        suggestedAnswers={[
          "Qué carrera estudiaste?",
          "En qué universidad?",
          "Cuál fue tu GPA o promedio?",
        ]}
        voiceRecording={voiceRecording}
        handleVoiceRecording={handleVoiceRecording}
        browserSupportsSpeechRecognition={browserSupportsSpeechRecognition}
        isProcessing={isProcessing}
      />
      {/* Skills, Languages, and Hobbies */}
      <VoiceQuestion
        title="Pregunta 4"
        description="Cuéntame más sobre ti"
        category="skills"
        suggestedAnswers={[
          "Qué habilidad técnicas podrías mencionar?",
          "Qué idiomas hablas?",
          "Cuáles son tus hobbies?",
        ]}
        voiceRecording={voiceRecording}
        handleVoiceRecording={handleVoiceRecording}
        browserSupportsSpeechRecognition={browserSupportsSpeechRecognition}
        isProcessing={isProcessing}
      />
    </Card>
  );
};
