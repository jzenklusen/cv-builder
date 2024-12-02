import React from "react";
import { Button } from "../ui/button";
import { Mic, Square } from "lucide-react";

interface VoiceQuestionProps {
  title: string;
  description: string;
  suggestedAnswers: string[];
  category: string;
  voiceRecording: boolean;
  handleVoiceRecording: (type: string) => void;
  browserSupportsSpeechRecognition: boolean;
  isProcessing: boolean;
}

export const VoiceQuestion = ({
  title,
  description,
  suggestedAnswers,
  category,
  voiceRecording,
  handleVoiceRecording,
  browserSupportsSpeechRecognition,
  isProcessing,
}: VoiceQuestionProps) => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-4">
        <div className="bg-gray-100 rounded-lg p-3 w-full">
          <p className="text-sm text-gray-600">{title}</p>
          <h3 className="font-bold">{description}</h3>
        </div>
      </div>
      <div className="border rounded-lg p-4">
        <div className="text-sm text-black/50 mb-4 italic">
          {suggestedAnswers.map((answer, index) => (
            <div className="flex flex-col">
              <span key={index}>{answer}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={voiceRecording ? "destructive" : "secondary"}
            size="sm"
            onClick={() => handleVoiceRecording(category)}
            disabled={!browserSupportsSpeechRecognition || isProcessing}
          >
            {isProcessing ? (
              <div className="flex items-center">
                <span className="animate-spin mr-2">⌛</span>
                Procesando...
              </div>
            ) : voiceRecording ? (
              <>
                <Square className="w-4 h-4 mr-2" />
                Detener grabación
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 mr-2" />
                Iniciar grabación
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
