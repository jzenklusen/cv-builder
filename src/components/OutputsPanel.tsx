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
    <Card className="p-6 max-w-4xl mx-auto" id="cv-output">
      {/* Header/Basic Info Section */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-blue-900 mb-4">
          {cvData.basics.name}
        </h1>
        <div className="flex items-center justify-center gap-4 text-gray-600 flex-wrap">
          <span>{cvData.basics.location}</span>
          <span>|</span>
          <span>{cvData.basics.email}</span>
          {cvData.basics.phone && (
            <>
              <span>|</span>
              <span>{cvData.basics.phone}</span>
            </>
          )}
        </div>
      </div>

      {/* About Me Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-blue-900 border-b-2 border-blue-900 mb-4">
          About me
        </h2>
        <div className="relative">
          <EditDialog
            title="About Me"
            content={cvData.summary || ""}
            onSave={(newContent) =>
              setCvData((prev: any) => ({ ...prev, summary: newContent }))
            }
          />
          <p className="text-gray-700">{cvData.summary}</p>
          <Button
            className="mt-2"
            variant="outline"
            size="sm"
            onClick={handleGenerateSummary}
            disabled={isGeneratingSummary}
          >
            {isGeneratingSummary ? "Generating..." : "Generate with AI"}
          </Button>
        </div>
      </div>

      {/* Work Experience Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-blue-900 border-b-2 border-blue-900 mb-4">
          Work Experience
        </h2>
        <Droppable droppableId="experience-output" type="experience">
          {(provided) => (
            <div
              className="space-y-6"
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
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="relative group"
                    >
                      <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <EditDialog
                          title="Experience"
                          content={exp}
                          onSave={(newContent) =>
                            handleEditExperience(index, newContent)
                          }
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteExperience(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="mb-4">
                        <div className="flex justify-between items-baseline">
                          <h3 className="text-lg font-bold">{exp.jobTitle}</h3>
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

      {/* Education Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-blue-900 border-b-2 border-blue-900 mb-4">
          Education
        </h2>
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
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="relative group"
                    >
                      <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <EditDialog
                          title="Education"
                          content={edu}
                          onSave={(newContent) =>
                            handleEditEducation(index, newContent)
                          }
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteEducation(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="mb-4">
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

      {/* Skills Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-blue-900 border-b-2 border-blue-900 mb-4">
          Skills, Language, Hobbies & Projects
        </h2>
        <div className="relative">
          <EditDialog
            title="Skills"
            content={cvData.skills}
            onSave={handleEditSkills}
          />
          <div className="space-y-4">
            <div>
              <h3 className="font-bold mb-1">Skills:</h3>
              <p className="text-gray-700">
                {cvData.skills.technical.join(", ")}
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-1">Language:</h3>
              <p className="text-gray-700">
                {cvData.skills.languages
                  .map((lang: any) =>
                    typeof lang === "string"
                      ? lang
                      : `${lang.language} (${lang.proficiency})`
                  )
                  .join(", ")}
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-1">Hobbies:</h3>
              <p className="text-gray-700">
                {cvData.skills.hobbies.join(", ")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
