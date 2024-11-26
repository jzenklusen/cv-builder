"use client"

import '@/lib/regenerator'
import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Mic, Square, RotateCcw, Plus, FileDown, Wand2, Briefcase, Edit, Zap, TrendingUp, BarChart, Trash2 } from "lucide-react"
import { CVData } from "@/types/cv"
import { enhanceText } from '@/services/openai';
import { EditDialog } from '@/components/EditDialog';
import { FeedbackDialog } from '@/components/FeedbackDialog';
import dynamic from 'next/dynamic'
import { generateCVSummary } from '@/services/openai';
import { exportToPDF } from '@/lib/pdfExport';

const DragDropContext = dynamic(
  () => import('react-beautiful-dnd').then(mod => mod.DragDropContext),
  { ssr: false }
)

const Droppable = dynamic(
  () => import('react-beautiful-dnd').then(mod => mod.Droppable),
  { ssr: false }
)

const Draggable = dynamic(
  () => import('react-beautiful-dnd').then(mod => mod.Draggable),
  { ssr: false }
)

export default function CVBuilder() {
  const [selectedText, setSelectedText] = useState("")
  const [enhancementOption, setEnhancementOption] = useState("professional")
  const [customPrompt, setCustomPrompt] = useState("")
  const [showJobSuggestions, setShowJobSuggestions] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  
  const {
    isRecording: voiceRecording,
    transcript,
    browserSupportsSpeechRecognition,
    startRecording,
    stopRecording,
    resetRecording
  } = useVoiceRecording();

  const [cvData, setCvData] = useState<CVData>({
    basics: {
      name: "",
      location: "",
      email: "",
      nationalities: ""
    },
    summary: "",
    experience: [],
    education: [],
    skills: {
      technical: [],
      languages: [],
      hobbies: [],
    },
  })

  const [currentSection, setCurrentSection] = useState<'experience' | 'education' | 'skills' | null>(null);

  useEffect(() => {
    if (!isProcessing && currentSection && transcript.trim()) {
      const processTranscript = async () => {
        setIsProcessing(true);
        try {
          console.log('Current transcript:', transcript);
          const enhancedText = await enhanceText(transcript, currentSection);
          console.log('Enhanced text:', enhancedText);

          if (currentSection === 'experience') {
            setCvData(prev => ({
              ...prev,
              experience: [...prev.experience, enhancedText],
            }));
          } else if (currentSection === 'education') {
            setCvData(prev => ({
              ...prev,
              education: [...prev.education, enhancedText],
            }));
          } else if (currentSection === 'skills') {
            console.log('Enhanced skills data:', enhancedText);
            setCvData(prev => ({
              ...prev,
              skills: {
                technical: Array.isArray(enhancedText.technical) ? enhancedText.technical : [],
                languages: Array.isArray(enhancedText.languages) ? enhancedText.languages : [],
                hobbies: Array.isArray(enhancedText.hobbies) ? enhancedText.hobbies : [],
              },
            }));
          }
        } catch (error) {
          console.error('Error processing voice input:', error);
        } finally {
          setIsProcessing(false);
          resetRecording();
          setCurrentSection(null);
        }
      };

      processTranscript();
    }
  }, [transcript, currentSection, isProcessing, enhanceText, resetRecording]);

  const handleBasicInfoChange = (field: keyof CVData['basics'], value: string) => {
    setCvData(prev => ({
      ...prev,
      basics: {
        ...prev.basics,
        [field]: value
      }
    }))
  }

  const handleTextSelection = () => {
    const selection = window.getSelection()
    if (selection) {
      setSelectedText(selection.toString())
    }
  }

  const handleEnhance = () => {
    setShowFeedback(true);
  };

  const handleVoiceRecording = (section: 'experience' | 'education' | 'skills') => {
    if (voiceRecording) {
      stopRecording();
      setCurrentSection(section);
    } else {
      startRecording();
    }
  };

  const handleEditBasics = (newContent: any) => {
    setCvData(prev => ({
      ...prev,
      basics: newContent
    }))
  }

  const handleEditExperience = (index: number, newContent: any) => {
    setCvData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? newContent : exp
      )
    }))
  }

  const handleEditEducation = (index: number, newContent: any) => {
    setCvData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? newContent : edu
      )
    }))
  }

  const handleEditSkills = (newContent: any) => {
    setCvData(prev => ({
      ...prev,
      skills: newContent
    }))
  }

  const handleDeleteExperience = (index: number) => {
    setCvData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const handleDeleteEducation = (index: number) => {
    setCvData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const section = result.type;

    if (section === 'experience') {
      const items = Array.from(cvData.experience);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);

      setCvData(prev => ({
        ...prev,
        experience: items
      }));
    } else if (section === 'education') {
      const items = Array.from(cvData.education);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);

      setCvData(prev => ({
        ...prev,
        education: items
      }));
    }
  };

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const summary = await generateCVSummary(cvData);
      setCvData(prev => ({
        ...prev,
        summary
      }));
      console.log('Summary:', summary);
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // Rest of your render code remains the same as in the original file
  // Reference to original render code:

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="min-h-screen bg-gray-50 pt-20">
        {/* Fixed Header */}
        <header className="fixed top-0 left-0 right-0 bg-white border-b z-50">
          <div className="container mx-auto p-4 flex items-center justify-between">
            <h1 className="text-3xl font-bold">EasyHiring CV Builder</h1>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => exportToPDF('cv-output', 'my-cv.pdf')}>
                <FileDown className="w-4 h-4 mr-2" />
                Export as PDF
              </Button>
              <Button variant="outline" onClick={() => setShowFeedback(true)}>
                <Wand2 className="w-4 h-4 mr-2" />
                Enhance with AI
              </Button>
              <FeedbackDialog 
                isOpen={showFeedback}
                onClose={() => setShowFeedback(false)}
              />
              <Button variant="outline" onClick={() => setShowJobSuggestions(!showJobSuggestions)}>
                <Briefcase className="w-4 h-4 mr-2" />
                Suggest Jobs
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto p-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Input Section */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Input - Questions you need to answer</h2>
              {/* Basic Information */}
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <h3 className="font-medium">Question 1</h3>
                    <p className="text-sm text-gray-600">Your basics</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <Input 
                    placeholder="What is your name? [input text]" 
                    value={cvData.basics.name}
                    onChange={(e) => handleBasicInfoChange('name', e.target.value)}
                  />
                  <Input 
                    placeholder="Where do you live? [input text]" 
                    value={cvData.basics.location}
                    onChange={(e) => handleBasicInfoChange('location', e.target.value)}
                  />
                  <Input 
                    placeholder="What is your email [input text]" 
                    value={cvData.basics.email}
                    onChange={(e) => handleBasicInfoChange('email', e.target.value)}
                  />
                  <Input 
                    placeholder="Your nationalities [input text]" 
                    value={cvData.basics.nationalities}
                    onChange={(e) => handleBasicInfoChange('nationalities', e.target.value)}
                  />
                </div>
              </div>
              {/* Professional Experience */}
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <h3 className="font-medium">Question set #2</h3>
                    <p className="text-sm text-gray-600">Professional experience</p>
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Tell me about your work experience
                    <br />-What was your role?
                    <br />-Where did you work?
                    <br />-When did you start and finish?
                    <br />-What were your main responsibilities?
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={voiceRecording ? "destructive" : "secondary"}
                      size="sm"
                      onClick={() => handleVoiceRecording('experience')}
                      disabled={!browserSupportsSpeechRecognition || isProcessing}
                    >
                      {isProcessing ? (
                        <div className="flex items-center">
                          <span className="animate-spin mr-2">⌛</span>
                          Processing...
                        </div>
                      ) : voiceRecording ? (
                        <>
                          <Square className="w-4 h-4 mr-2" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="w-4 h-4 mr-2" />
                          Start Recording
                        </>
                      )}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="mt-2">
                  <Plus className="w-4 h-4 mr-2" />
                  If you want to add a new experience, record a new message again
                </Button>
              </div>

               {/* <DragDropContext onDragEnd={onDragEnd}>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-2">Professional experience cards</h3>
                  <Droppable droppableId="experience" type="experience">
                    {(provided) => (
                      <div 
                        className="space-y-4" 
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                      >
                        {cvData.experience.map((exp, index) => (
                          <Draggable 
                            key={index} 
                            draggableId={`exp-${index}`} 
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
                                    title="Experience"
                                    content={exp}
                                    onSave={(newContent) => handleEditExperience(index, newContent)}
                                  />
                                  <Button 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => handleDeleteExperience(index)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                                {typeof exp === 'string' ? (
                                  <div className="text-sm">{exp}</div>
                                ) : (
                                  <>
                                    <h4 className="font-medium">{exp.jobTitle || 'Job Title (click Edit to add)'}</h4>
                                    <p className="text-sm text-gray-600">{exp.company || 'Company Name (click Edit to add)'}</p>
                                    <p className="text-sm text-gray-600">
                                      {exp.startDate || 'Start Date'} - {exp.endDate || 'End Date'} | {exp.location || 'Location'}
                                    </p>
                                    <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                                      {exp.responsibilities?.map((resp: string, idx: number) => (
                                        <li key={idx}>{resp}</li>
                                      ))}
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
              </DragDropContext>  */}
              {/* Education */}
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <h3 className="font-medium">Question set #3</h3>
                    <p className="text-sm text-gray-600">Education</p>
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Tell me about your studies
                    <br />-What did you study?
                    <br />-Where?
                    <br />-What was your GPA?
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={voiceRecording ? "destructive" : "secondary"}
                      size="sm"
                      onClick={() => handleVoiceRecording('education')}
                      disabled={!browserSupportsSpeechRecognition || isProcessing}
                    >
                      {isProcessing ? (
                        <div className="flex items-center">
                          <span className="animate-spin mr-2">⌛</span>
                          Processing...
                        </div>
                      ) : voiceRecording ? (
                        <>
                          <Square className="w-4 h-4 mr-2" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="w-4 h-4 mr-2" />
                          Start Recording
                        </>
                      )}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="mt-2">
                  <Plus className="w-4 h-4 mr-2" />
                  If you want to add a new education, record a new message again
                </Button>
              </div>
              {/* Skills, Languages, and Hobbies */}
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <h3 className="font-medium">Question set #4</h3>
                    <p className="text-sm text-gray-600">Skills, languages and hobbies</p>
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Tell me more about you
                    <br />-What are you good at? Excel? PowerPoint? Python?
                    <br />-How many languages do you speak and how good are you at each? Native? Intermediate?
                    <br />-Any hobby you want to tell me?
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={voiceRecording ? "destructive" : "secondary"}
                      size="sm"
                      onClick={() => handleVoiceRecording('skills')}
                      disabled={!browserSupportsSpeechRecognition || isProcessing}
                    >
                      {isProcessing ? (
                        <div className="flex items-center">
                          <span className="animate-spin mr-2">⌛</span>
                          Processing...
                        </div>
                      ) : voiceRecording ? (
                        <>
                          <Square className="w-4 h-4 mr-2" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="w-4 h-4 mr-2" />
                          Start Recording
                        </>
                      )}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="mt-2">
                  <Plus className="w-4 h-4 mr-2" />
                  Want to add/change your output? Please record or re-record again to update your CV
                </Button>
              </div>
            </Card>

            {/* Output Section */}
            <Card className="p-6" id="cv-output">
              <h2 className="text-xl font-semibold mb-6">
                Output - How your CV looks so far
                <br />
                <span className="text-sm font-normal text-gray-600">Edit by clicking the edit button</span>
              </h2>
              <div className="space-y-6" onMouseUp={handleTextSelection}>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-2">Basic Information</h3>
                  <div className="space-y-2">
                    <p><strong>Name:</strong> {cvData.basics.name || 'No name added yet'}</p>
                    <p><strong>Location:</strong> {cvData.basics.location || 'No location added yet'}</p>
                    <p><strong>Email:</strong> {cvData.basics.email || 'No email added yet'}</p>
                    <p><strong>Nationalities:</strong> {cvData.basics.nationalities || 'No nationalities added yet'}</p>
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4 relative">
                  <EditDialog
                    title="Summary"
                    content={cvData.summary || ''}
                    onSave={(newContent) => setCvData(prev => ({ ...prev, summary: newContent }))}
                  />
                  <h3 className="text-lg font-medium mb-2">Summary</h3>
                  <p className="text-sm text-gray-600">Built with AI</p>
                  {cvData.summary ? (
                    <p className="mt-2">{cvData.summary}</p>
                  ) : (
                    <p className="mt-2 text-gray-500">
                      This is an AI summary of your CV. Click the button below to create or update it.
                    </p>
                  )}
                  <Button 
                    className="mt-4" 
                    onClick={handleGenerateSummary}
                    disabled={isGeneratingSummary}
                  >
                    {isGeneratingSummary ? 'Generating...' : 'Create/Update AI Summary'}
                  </Button>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-2">Professional experience</h3>
                  <Droppable droppableId="experience-output" type="experience">
                    {(provided) => (
                      <div 
                        className="space-y-4"
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                      >
                        {cvData.experience.map((exp, index) => (
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
                                    title="Experience"
                                    content={exp}
                                    onSave={(newContent) => handleEditExperience(index, newContent)}
                                  />
                                  <Button 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => handleDeleteExperience(index)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                                {typeof exp === 'string' ? (
                                  <div className="text-sm">{exp}</div>
                                ) : (
                                  <>
                                    <h4 className="font-medium">{exp.jobTitle || 'Job Title (click Edit to add)'}</h4>
                                    <p className="text-sm text-gray-600">{exp.company || 'Company Name (click Edit to add)'}</p>
                                    <p className="text-sm text-gray-600">
                                      {exp.startDate || 'Start Date'} - {exp.endDate || 'End Date'} | {exp.location || 'Location'}
                                    </p>
                                    <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                                      {exp.responsibilities?.map((resp: string, idx: number) => (
                                        <li key={idx}>{resp}</li>
                                      ))}
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
                  <h3 className="text-lg font-medium mb-2">Education</h3>
                  <Droppable droppableId="education-output" type="education">
                    {(provided) => (
                      <div 
                        className="space-y-4"
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                      >
                        {cvData.education.map((edu, index) => (
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
                                    title="Education"
                                    content={edu}
                                    onSave={(newContent) => handleEditEducation(index, newContent)}
                                  />
                                  <Button 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => handleDeleteEducation(index)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                                {typeof edu === 'string' ? (
                                  <div className="text-sm">{edu}</div>
                                ) : (
                                  <>
                                    <h4 className="font-medium">{edu.degree}</h4>
                                    <p className="text-sm text-gray-600">{edu.university}</p>
                                    <p className="text-sm text-gray-600">
                                      Graduation Year: {edu.graduationYear}
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
                    title="Skills, Languages, and Hobbies"
                    content={cvData.skills}
                    onSave={handleEditSkills}
                  />
                  <h3 className="text-lg font-medium mb-2">Skills, Languages, and Hobbies</h3>
                  <div className="space-y-2">
                    <p><strong>Skills:</strong> {cvData.skills.technical.join(', ') || 'No skills added yet'}</p>
                    <p><strong>Languages:</strong> {cvData.skills.languages.map(lang => 
                      typeof lang === 'string' ? lang : `${lang.language} (${lang.proficiency})`
                    ).join(', ') || 'No languages added yet'}</p>
                    <p><strong>Hobbies:</strong> {cvData.skills.hobbies.join(', ') || 'No hobbies added yet'}</p>
                  </div>
                </div>

                {showJobSuggestions && (
                  <div className="bg-blue-50 rounded-lg p-4 relative">
                    <h3 className="text-lg font-medium mb-2">Job Suggestions</h3>
                    <p className="text-sm text-gray-600 mb-4">Based on your current CV, you might be suitable for jobs like:</p>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                        <span className="font-medium">Marketing Paid Media Manager</span>
                        <span className="ml-2 text-sm text-gray-600">(matching score 80%)</span>
                      </li>
                      <li className="flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                        <span className="font-medium">Trade Marketing Manager</span>
                        <span className="ml-2 text-sm text-gray-600">(matching score 75%)</span>
                      </li>
                      <li className="flex items-center">
                        <BarChart className="w-5 h-5 mr-2 text-blue-500" />
                        <span className="font-medium">Manager Marketing Operations</span>
                        <span className="ml-2 text-sm text-gray-600">(matching score 70%)</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DragDropContext>
  )
}