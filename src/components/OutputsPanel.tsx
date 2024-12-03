import React, { useState } from "react";
import { Card } from "./ui/card";
import { EditDialog } from "./EditDialog";
import { Button } from "./ui/button";
import { FileText, Sparkles, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

const Droppable = dynamic(
  () => import("react-beautiful-dnd").then((mod) => mod.Droppable),
  { ssr: true }
);

const Draggable = dynamic(
  () => import("react-beautiful-dnd").then((mod) => mod.Draggable),
  { ssr: true }
);

interface OutputsPanelProps {
  cvData: any;
  setCvData: (data: any) => void;
  handleGenerateSummary: () => void;
  isGeneratingSummary: boolean;
  handleEditExperience: (index: number, newContent: string) => void;
  handleDeleteExperience: (index: number) => void;
  handleEditEducation: (index: number, newContent: string) => void;
  handleDeleteEducation: (index: number) => void;
  handleEditSkills: (newContent: string) => void;
  showJobSuggestions: boolean;
  handleTextSelection: () => void;
}

export const OutputsPanel = ({
  cvData,
  setCvData,
  handleGenerateSummary,
  isGeneratingSummary,
  handleEditExperience,
  handleDeleteExperience,
  handleEditEducation,
  handleDeleteEducation,
  handleEditSkills,
}: OutputsPanelProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState<{
    type: "experience" | "education" | null;
    index: number | null;
  }>({ type: null, index: null });

  const hasName = Boolean(cvData.basics.name);
  const hasEmail = Boolean(cvData.basics.email);
  const hasLocation = Boolean(cvData.basics.location);
  const hasNationality = Boolean(cvData.basics.nationalities);
  const hasPhone = Boolean(cvData.basics.phone);

  const hasExperience = cvData.experience.length > 0;
  const hasEducation = cvData.education.length > 0;
  const hasSkills =
    cvData.skills.technical.length > 0 ||
    cvData.skills.languages.length > 0 ||
    cvData.skills.hobbies.length > 0;

  const canShowSummary = hasExperience && hasEducation && hasSkills;
  const hasSummary = Boolean(cvData.summary);

  const handleDelete = () => {
    if (
      showDeleteDialog.type === "experience" &&
      showDeleteDialog.index !== null
    ) {
      handleDeleteExperience(showDeleteDialog.index);
    } else if (
      showDeleteDialog.type === "education" &&
      showDeleteDialog.index !== null
    ) {
      handleDeleteEducation(showDeleteDialog.index);
    }
    setShowDeleteDialog({ type: null, index: null });
  };

  const hasAnyData =
    hasName ||
    hasEmail ||
    hasLocation ||
    hasExperience ||
    hasEducation ||
    hasSkills;

  if (!hasAnyData) {
    return (
      <Card
        className="p-6 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[400px] space-y-2 w-full"
        id="cv-output"
      >
        <FileText className="w-16 h-16 text-gray-400" />
        <h2 className="text-xl font-semibold text-gray-600">
          Tu CV está vacío
        </h2>
        <p className="text-gray-500 text-center max-w-md">
          Comienza respondiendo las preguntas para comenzar a crear tu
          currículo.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 max-w-4xl mx-auto w-full" id="cv-output">
      {/* Header/Basic Info Section */}
      <div className="mb-4 text-center">
        {hasName && (
          <h1 className="text-4xl font-bold text-black mb-2">
            {cvData.basics.name}
          </h1>
        )}
        <div className="flex items-center justify-center gap-4 text-gray-600 flex-wrap">
          {hasLocation && <span>{cvData.basics.location}</span>}
          {hasEmail && (
            <>
              {hasLocation && <span>|</span>}
              <span>{cvData.basics.email}</span>
            </>
          )}
          {hasPhone && (
            <>
              {(hasLocation || hasEmail) && <span>|</span>}
              <span>{cvData.basics.phone}</span>
            </>
          )}
          {hasNationality && (
            <>
              {(hasLocation || hasEmail || hasPhone) && <span>|</span>}
              <span>{cvData.basics.nationalities}</span>
            </>
          )}
        </div>
      </div>

      {/* About Me Section */}
      {canShowSummary && (
        <div className="mb-4 group relative">
          <h2 className="text-2xl font-bold text-black border-b border-gray-600 pb-2">
            Sobre mí
          </h2>
          <div className="relative mt-4">
            <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              {hasSummary && (
                <EditDialog
                  title="About Me"
                  content={cvData.summary}
                  onSave={(newContent) =>
                    setCvData((prev: any) => ({ ...prev, summary: newContent }))
                  }
                />
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateSummary}
                disabled={isGeneratingSummary}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isGeneratingSummary
                  ? "Generando..."
                  : hasSummary
                  ? "Regenerar"
                  : "Generar con IA"}
              </Button>
            </div>
            {hasSummary ? (
              <p className="text-gray-700 w-full">{cvData.summary}</p>
            ) : (
              <p className="text-gray-500 italic">
                Haz click en "Generar con IA" para crear tu resumen profesional
              </p>
            )}
          </div>
        </div>
      )}

      {/* Work Experience Section */}
      {hasExperience && (
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-black border-b border-gray-600 pb-2">
            Experiencia Profesional
          </h2>
          <Droppable droppableId="experience-output" type="experience">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {cvData.experience.map((exp: any, index: number) => (
                  <Draggable
                    key={index}
                    draggableId={`exp-output-${index}`}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="relative group hover:bg-gray-50 p-4 rounded-lg transition-colors"
                      >
                        <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                          <EditDialog
                            title="Experience"
                            content={exp}
                            onSave={(newContent) =>
                              handleEditExperience(index, newContent)
                            }
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              setShowDeleteDialog({
                                type: "experience",
                                index: index,
                              })
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div>
                          <div className="flex justify-between items-baseline">
                            <h3 className="text-lg font-bold">
                              {exp.jobTitle}
                            </h3>
                            <span className="text-gray-600 italic">
                              {exp.startDate} — {exp.endDate}
                            </span>
                          </div>
                          <div className="flex justify-between items-baseline">
                            <span className="text-gray-700">{exp.company}</span>
                            <span className="text-gray-600 italic">
                              {exp.location}
                            </span>
                          </div>
                          <ul className="list-disc ml-5 mt-2 text-gray-700">
                            {exp.responsibilities?.map(
                              (resp: string, idx: number) => (
                                <li key={idx}>{resp}</li>
                              )
                            )}
                          </ul>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      )}

      {/* Education Section */}
      {hasEducation && (
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-black border-b border-gray-600 pb-2">
            Educación
          </h2>
          <Droppable droppableId="education-output" type="education">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {cvData.education.map((edu: any, index: number) => (
                  <Draggable
                    key={index}
                    draggableId={`edu-output-${index}`}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="relative group hover:bg-gray-50 p-4 rounded-lg transition-colors"
                      >
                        <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                          <EditDialog
                            title="Education"
                            content={edu}
                            onSave={(newContent) =>
                              handleEditEducation(index, newContent)
                            }
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              setShowDeleteDialog({
                                type: "education",
                                index: index,
                              })
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div>
                          <div className="flex justify-between items-baseline">
                            <h3 className="text-lg font-bold">{edu.degree}</h3>
                            <span className="text-gray-600 italic">
                              {edu.graduationYear}
                            </span>
                          </div>
                          <p className="text-gray-700">{edu.university}</p>
                          {edu.gpa && (
                            <p className="text-gray-600">GPA: {edu.gpa}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      )}

      {/* Skills Section */}
      {hasSkills && (
        <div className="mb-4 group relative">
          <h2 className="text-2xl font-bold text-black border-b border-gray-600 pb-2">
            Habilidades, Idiomas y Hobbies
          </h2>
          <div className="relative">
            <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <EditDialog
                title="Skills"
                content={cvData.skills}
                onSave={handleEditSkills}
              />
            </div>
            <div className="space-y-2 p-4">
              <ul>
                <li className="font-bold mb-1">Habilidades:</li>
                <li className="text-gray-700 list-disc ml-4">
                  {cvData.skills.technical.join(", ")}
                </li>
              </ul>
              <ul>
                <li className="font-bold mb-1">Idiomas:</li>
                <li className="text-gray-700 list-disc ml-4">
                  {cvData.skills.languages
                    .map((lang: any) =>
                      typeof lang === "string"
                        ? lang
                        : `${lang.language} (${lang.proficiency})`
                    )
                    .join(", ")}
                </li>
              </ul>
              <ul>
                <li className="font-bold mb-1">Hobbies:</li>
                <li className="text-gray-700 list-disc ml-4">
                  {cvData.skills.hobbies.join(", ")}
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <AlertDialog
        open={showDeleteDialog.type !== null}
        onOpenChange={() => setShowDeleteDialog({ type: null, index: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente
              esta entrada de tu CV.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
