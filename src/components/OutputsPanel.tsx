import React from "react";
import { Card } from "./ui/card";
import { EditDialog } from "./EditDialog";
import { Button } from "./ui/button";
import { BarChart, Trash2, TrendingUp, Zap } from "lucide-react";
import dynamic from "next/dynamic";

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
  showJobSuggestions,
  handleTextSelection,
}: OutputsPanelProps) => {
  return (
    <Card className="p-6" id="cv-output">
      <h2 className="text-xl font-semibold mb-6">Así va quedando tu CV</h2>
      <div className="space-y-6" onMouseUp={handleTextSelection}>
        <div className="bg-yellow-50 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2">Información básica</h3>
          <div className="space-y-2">
            <p>
              <strong>Nombre:</strong>{" "}
              {cvData.basics.name || "Nombre sin completar"}
            </p>
            <p>
              <strong>Ubicación:</strong>{" "}
              {cvData.basics.location || "Ubicación sin completar"}
            </p>
            <p>
              <strong>Email:</strong>{" "}
              {cvData.basics.email || "Email sin completar"}
            </p>
            <p>
              <strong>Nacionalidad:</strong>{" "}
              {cvData.basics.nationalities || "Nacionalidad sin completar"}
            </p>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4 relative">
          <EditDialog
            title="Resumen"
            content={cvData.summary || ""}
            onSave={(newContent) =>
              setCvData((prev: any) => ({ ...prev, summary: newContent }))
            }
          />
          <h3 className="text-lg font-medium mb-2">Resumen</h3>
          <p className="text-sm text-gray-600">Generado con IA</p>
          {cvData.summary ? (
            <p className="mt-2">{cvData.summary}</p>
          ) : (
            <p className="mt-2 text-gray-500">
              Este es un resumen generado con IA. Haz click en el botón de abajo
              para crearlo o actualizarlo.
            </p>
          )}
          <Button
            className="mt-4"
            onClick={handleGenerateSummary}
            disabled={isGeneratingSummary}
          >
            {isGeneratingSummary ? "Generando..." : "Actualizar resumen"}
          </Button>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2">Experiencia profesional</h3>
          <Droppable droppableId="experience-output" type="experience">
            {(provided) => (
              <div
                className="space-y-4"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {cvData.experience.map((exp: any, index: number) => (
                  <Draggable
                    key={index}
                    draggableId={`exp-output-${index}`}
                    index={index}
                  >
                    {(provided) => (
                      <Card
                        className="p-4 relative"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <div className="absolute top-2 right-2 flex gap-2">
                          <EditDialog
                            title="Experiencia"
                            content={exp}
                            onSave={(newContent) =>
                              handleEditExperience(index, newContent)
                            }
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteExperience(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        {typeof exp === "string" ? (
                          <div className="text-sm">{exp}</div>
                        ) : (
                          <>
                            <h4 className="font-medium">
                              {exp.jobTitle || "Cargo"}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {exp.company || "Nombre de la empresa"}
                            </p>
                            <p className="text-sm text-gray-600">
                              {exp.startDate || "Fecha de inicio"} -{" "}
                              {exp.endDate || "Fecha de finalización"} |{" "}
                              {exp.location || "Ubicación"}
                            </p>
                            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                              {exp.responsibilities?.map(
                                (resp: string, idx: number) => (
                                  <li key={idx}>{resp}</li>
                                )
                              )}
                            </ul>
                          </>
                        )}
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2">Educación</h3>
          <Droppable droppableId="education-output" type="education">
            {(provided) => (
              <div
                className="space-y-4"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {cvData.education.map((edu: any, index: number) => (
                  <Draggable
                    key={index}
                    draggableId={`edu-output-${index}`}
                    index={index}
                  >
                    {(provided) => (
                      <Card
                        className="p-4 relative"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <div className="absolute top-2 right-2 flex gap-2">
                          <EditDialog
                            title="Educación"
                            content={edu}
                            onSave={(newContent) =>
                              handleEditEducation(index, newContent)
                            }
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteEducation(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        {typeof edu === "string" ? (
                          <div className="text-sm">{edu}</div>
                        ) : (
                          <>
                            <h4 className="font-medium">{edu.degree}</h4>
                            <p className="text-sm text-gray-600">
                              {edu.university}
                            </p>
                            <p className="text-sm text-gray-600">
                              Año de graduación: {edu.graduationYear}
                              {edu.gpa && ` | GPA: ${edu.gpa}`}
                            </p>
                          </>
                        )}
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4 relative">
          <EditDialog
            title="Habilidades, Idiomas y Hobbies"
            content={cvData.skills}
            onSave={handleEditSkills}
          />
          <h3 className="text-lg font-medium mb-2">
            Habilidades, Idiomas y Hobbies
          </h3>
          <div className="space-y-2">
            <p>
              <strong>Habilidades:</strong>{" "}
              {cvData.skills.technical.join(", ") ||
                "Habilidades sin completar"}
            </p>
            <p>
              <strong>Idiomas:</strong>{" "}
              {cvData.skills.languages
                .map((lang: any) =>
                  typeof lang === "string"
                    ? lang
                    : `${lang.language} (${lang.proficiency})`
                )
                .join(", ") || "Idiomas sin completar"}
            </p>
            <p>
              <strong>Hobbies:</strong>{" "}
              {cvData.skills.hobbies.join(", ") || "Hobbies sin completar"}
            </p>
          </div>
        </div>

        {showJobSuggestions && (
          <div className="bg-blue-50 rounded-lg p-4 relative">
            <h3 className="text-lg font-medium mb-2">Job Suggestions</h3>
            <p className="text-sm text-gray-600 mb-4">
              Based on your current CV, you might be suitable for jobs like:
            </p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                <span className="font-medium">
                  Marketing Paid Media Manager
                </span>
                <span className="ml-2 text-sm text-gray-600">
                  (matching score 80%)
                </span>
              </li>
              <li className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                <span className="font-medium">Trade Marketing Manager</span>
                <span className="ml-2 text-sm text-gray-600">
                  (matching score 75%)
                </span>
              </li>
              <li className="flex items-center">
                <BarChart className="w-5 h-5 mr-2 text-blue-500" />
                <span className="font-medium">
                  Manager Marketing Operations
                </span>
                <span className="ml-2 text-sm text-gray-600">
                  (matching score 70%)
                </span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
};
