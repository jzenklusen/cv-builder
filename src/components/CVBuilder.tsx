"use client";

import "@/lib/regenerator";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { useState, useEffect } from "react";
import { CVData } from "@/types/cv";
import { enhanceText } from "@/services/openai";
import dynamic from "next/dynamic";
import { generateCVSummary } from "@/services/openai";
import { InputsPanel } from "./InputsSection/InputsPanel";
import { OutputsPanel } from "./OutputsPanel";

const DragDropContext = dynamic(
  () => import("react-beautiful-dnd").then((mod) => mod.DragDropContext),
  { ssr: true }
);

export default function CVBuilder() {
  const [selectedText, setSelectedText] = useState("");
  const [enhancementOption, setEnhancementOption] = useState("professional");
  const [customPrompt, setCustomPrompt] = useState("");
  const [showJobSuggestions, setShowJobSuggestions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const {
    isRecording: voiceRecording,
    transcript,
    browserSupportsSpeechRecognition,
    startRecording,
    stopRecording,
    resetRecording,
  } = useVoiceRecording();

  const [cvData, setCvData] = useState<CVData>({
    basics: {
      name: "",
      location: "",
      email: "",
      nationalities: "",
    },
    summary: "",
    experience: [],
    education: [],
    skills: {
      technical: [],
      languages: [],
      hobbies: [],
    },
  });

  const [currentSection, setCurrentSection] = useState<
    "experience" | "education" | "skills" | null
  >(null);

  useEffect(() => {
    if (!isProcessing && currentSection && transcript.trim()) {
      const processTranscript = async () => {
        setIsProcessing(true);
        try {
          console.log("Current transcript:", transcript);
          const enhancedText = await enhanceText(transcript, currentSection);
          console.log("Enhanced text:", enhancedText);

          if (currentSection === "experience") {
            setCvData((prev) => ({
              ...prev,
              experience: [...prev.experience, enhancedText],
            }));
          } else if (currentSection === "education") {
            setCvData((prev) => ({
              ...prev,
              education: [...prev.education, enhancedText],
            }));
          } else if (currentSection === "skills") {
            console.log("Enhanced skills data:", enhancedText);
            setCvData((prev) => ({
              ...prev,
              skills: {
                technical: Array.isArray(enhancedText.technical)
                  ? enhancedText.technical
                  : [],
                languages: Array.isArray(enhancedText.languages)
                  ? enhancedText.languages
                  : [],
                hobbies: Array.isArray(enhancedText.hobbies)
                  ? enhancedText.hobbies
                  : [],
              },
            }));
          }
        } catch (error) {
          console.error("Error processing voice input:", error);
        } finally {
          setIsProcessing(false);
          resetRecording();
          setCurrentSection(null);
        }
      };

      processTranscript();
    }
  }, [transcript, currentSection, isProcessing, enhanceText, resetRecording]);

  const handleBasicInfoChange = (
    field: keyof CVData["basics"],
    value: string
  ) => {
    setCvData((prev) => ({
      ...prev,
      basics: {
        ...prev.basics,
        [field]: value,
      },
    }));
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection) {
      setSelectedText(selection.toString());
    }
  };

  const handleEnhance = () => {
    setShowFeedback(true);
  };

  const handleVoiceRecording = (
    section: "experience" | "education" | "skills"
  ) => {
    if (voiceRecording) {
      stopRecording();
      setCurrentSection(section);
    } else {
      startRecording();
    }
  };

  const handleEditBasics = (newContent: any) => {
    setCvData((prev) => ({
      ...prev,
      basics: newContent,
    }));
  };

  const handleEditExperience = (index: number, newContent: any) => {
    setCvData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp, i) =>
        i === index ? newContent : exp
      ),
    }));
  };

  const handleEditEducation = (index: number, newContent: any) => {
    setCvData((prev) => ({
      ...prev,
      education: prev.education.map((edu, i) =>
        i === index ? newContent : edu
      ),
    }));
  };

  const handleEditSkills = (newContent: any) => {
    setCvData((prev) => ({
      ...prev,
      skills: newContent,
    }));
  };

  const handleDeleteExperience = (index: number) => {
    setCvData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  const handleDeleteEducation = (index: number) => {
    setCvData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const section = result.type;

    if (section === "experience") {
      const items = Array.from(cvData.experience);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);

      setCvData((prev) => ({
        ...prev,
        experience: items,
      }));
    } else if (section === "education") {
      const items = Array.from(cvData.education);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);

      setCvData((prev) => ({
        ...prev,
        education: items,
      }));
    }
  };

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const summary = await generateCVSummary(cvData);
      setCvData((prev) => ({
        ...prev,
        summary,
      }));
      console.log("Summary:", summary);
    } catch (error) {
      console.error("Error generating summary:", error);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // Rest of your render code remains the same as in the original file
  // Reference to original render code:

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="min-h-screen bg-gray-50 pt-20">
        {/* Main Content */}
        <div className="container mx-auto p-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Input Section */}
            <InputsPanel
              cvData={cvData}
              handleBasicInfoChange={handleBasicInfoChange}
              handleVoiceRecording={handleVoiceRecording}
              voiceRecording={voiceRecording}
              isProcessing={isProcessing}
              browserSupportsSpeechRecognition={
                browserSupportsSpeechRecognition
              }
            />

            {/* Output Section */}
            <OutputsPanel
              cvData={cvData}
              setCvData={setCvData}
              handleGenerateSummary={handleGenerateSummary}
              isGeneratingSummary={isGeneratingSummary}
              handleEditExperience={handleEditExperience}
              handleDeleteExperience={handleDeleteExperience}
              handleEditEducation={handleEditEducation}
              handleDeleteEducation={handleDeleteEducation}
              handleEditSkills={handleEditSkills}
              showJobSuggestions={showJobSuggestions}
              handleTextSelection={handleTextSelection}
            />
          </div>
        </div>
      </div>
    </DragDropContext>
  );
}
