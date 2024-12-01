"use client"

import '@/lib/regenerator'
import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Mic, Square, RotateCcw, Plus, FileDown, Wand2, Briefcase, Edit, Zap, TrendingUp, BarChart, Trash2, MapPin, Phone, Mail, Github, Linkedin, Globe, Flag } from "lucide-react"
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
            if (!enhancedText || typeof enhancedText !== 'object') {
              throw new Error('Invalid response format for experience');
            }
            
            const defaultExp = {
              jobTitle: 'Cargo por especificar',
              company: 'Empresa por especificar',
              startDate: 'Fecha inicio por especificar',
              endDate: 'Fecha fin por especificar',
              location: 'Ubicación por especificar',
              responsibilities: ['Responsabilidades por especificar']
            };

            const newExp = {
              ...defaultExp,
              ...enhancedText
            };

            setCvData(prev => ({
              ...prev,
              experience: [...prev.experience, newExp],
            }));
          } else if (currentSection === 'education') {
            if (!enhancedText || typeof enhancedText !== 'object') {
              throw new Error('Invalid response format for education');
            }

            const defaultEdu = {
              degree: 'Título por especificar',
              university: 'Universidad por especificar',
              graduationYear: 'Año por especificar',
              gpa: ''
            };

            const newEdu = {
              ...defaultEdu,
              ...enhancedText
            };

            setCvData(prev => ({
              ...prev,
              education: [...prev.education, newEdu],
            }));
          } else if (currentSection === 'skills') {
            if (!enhancedText || typeof enhancedText !== 'object') {
              throw new Error('Invalid response format for skills');
            }

            const defaultSkills = {
              technical: [],
              languages: [],
              hobbies: []
            };

            const newSkills = {
              ...defaultSkills,
              technical: Array.isArray(enhancedText.technical) ? enhancedText.technical : [],
              languages: Array.isArray(enhancedText.languages) ? enhancedText.languages : [],
              hobbies: Array.isArray(enhancedText.hobbies) ? enhancedText.hobbies : [],
            };

            setCvData(prev => ({
              ...prev,
              skills: newSkills
            }));
          }
        } catch (error) {
          console.error('Error processing voice input:', error);
          alert('No se pudo procesar correctamente el audio. Por favor, intenta de nuevo hablando más claro o usando palabras más específicas.');
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
    if (voiceRecording && currentSection === section) {
      stopRecording();
      setCurrentSection(null);
    } else if (!voiceRecording) {
      startRecording();
      setCurrentSection(section);
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

  const formatEmptyField = (value: string | undefined, type: string = ''): string | null => {
    if (!value) return null;
    
    const emptyValues = [
      'sin especificar',
      'sin datos',
      'no especificado',
      'sin título',
      'título sin especificar'
    ];

    if (emptyValues.some(emptyValue => value.toLowerCase().includes(emptyValue))) {
      return `${type}, agrégalo!`;
    }

    return value;
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
                    placeholder="Your phone number [optional]" 
                    value={cvData.basics.phone || ''}
                    onChange={(e) => handleBasicInfoChange('phone', e.target.value)}
                  />
                  <Input 
                    placeholder="Your GitHub profile URL [optional]" 
                    value={cvData.basics.github || ''}
                    onChange={(e) => handleBasicInfoChange('github', e.target.value)}
                  />
                  <Input 
                    placeholder="Your LinkedIn profile URL [optional]" 
                    value={cvData.basics.linkedin || ''}
                    onChange={(e) => handleBasicInfoChange('linkedin', e.target.value)}
                  />
                  <Input 
                    placeholder="Your personal website URL [optional]" 
                    value={cvData.basics.personalSite || ''}
                    onChange={(e) => handleBasicInfoChange('personalSite', e.target.value)}
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
                      variant={voiceRecording && currentSection === 'experience' ? "destructive" : "secondary"}
                      size="sm"
                      onClick={() => handleVoiceRecording('experience')}
                      disabled={!browserSupportsSpeechRecognition || isProcessing}
                    >
                      {isProcessing ? (
                        <div className="flex items-center">
                          <span className="animate-spin mr-2">⌛</span>
                          Processing...
                        </div>
                      ) : voiceRecording && currentSection === 'experience' ? (
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
                      variant={voiceRecording && currentSection === 'education' ? "destructive" : "secondary"}
                      size="sm"
                      onClick={() => handleVoiceRecording('education')}
                      disabled={!browserSupportsSpeechRecognition || isProcessing}
                    >
                      {isProcessing ? (
                        <div className="flex items-center">
                          <span className="animate-spin mr-2">⌛</span>
                          Processing...
                        </div>
                      ) : voiceRecording && currentSection === 'education' ? (
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
                      variant={voiceRecording && currentSection === 'skills' ? "destructive" : "secondary"}
                      size="sm"
                      onClick={() => handleVoiceRecording('skills')}
                      disabled={!browserSupportsSpeechRecognition || isProcessing}
                    >
                      {isProcessing ? (
                        <div className="flex items-center">
                          <span className="animate-spin mr-2">⌛</span>
                          Processing...
                        </div>
                      ) : voiceRecording && currentSection === 'skills' ? (
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
              <div className="space-y-6" onMouseUp={handleTextSelection}>
                {/* Header Section */}
                <div className="text-center border-b pb-4">
                  <h1 className="text-3xl font-bold mb-2">{cvData.basics.name || 'No name added yet'}</h1>
                  <div className="flex flex-wrap justify-center items-center gap-2 text-gray-600 text-sm mb-2">
                    {cvData.basics.location && (
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {cvData.basics.location}
                      </span>
                    )}
                    {cvData.basics.phone && (
                      <span className="flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        {cvData.basics.phone}
                      </span>
                    )}
                    {cvData.basics.email && (
                      <span className="flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {cvData.basics.email}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap justify-center items-center gap-3">
                    {cvData.basics.github && (
                      <a 
                        href={cvData.basics.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-gray-600 hover:text-gray-900"
                      >
                        <Github className="w-4 h-4 mr-1" />
                        GitHub
                      </a>
                    )}
                    {cvData.basics.linkedin && (
                      <a 
                        href={cvData.basics.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-gray-600 hover:text-gray-900"
                      >
                        <Linkedin className="w-4 h-4 mr-1" />
                        LinkedIn
                      </a>
                    )}
                    {cvData.basics.personalSite && (
                      <a 
                        href={cvData.basics.personalSite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-gray-600 hover:text-gray-900"
                      >
                        <Globe className="w-4 h-4 mr-1" />
                        Website
                      </a>
                    )}
                    {cvData.basics.nationalities && (
                      <span className="flex items-center text-gray-600">
                        <Flag className="w-4 h-4 mr-1" />
                        {cvData.basics.nationalities}
                      </span>
                    )}
                  </div>
                </div>

                {/* About Me Section */}
                {cvData.summary && (
                  <div className="border-b pb-4">
                    <h2 className="text-xl font-bold text-blue-900 mb-2">About Me</h2>
                    <p className="text-gray-700">{cvData.summary}</p>
                  </div>
                )}

                {/* Work Experience Section */}
                <div className="border-b pb-4">
                  <h2 className="text-xl font-bold text-blue-900 mb-4">Work Experience</h2>
                  <Droppable droppableId="experience-output" type="experience">
                    {(provided) => (
                      <div 
                        className="space-y-6"
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
                              <div 
                                className="relative"
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                {typeof exp === 'string' ? (
                                  <div className="text-sm">{exp}</div>
                                ) : (
                                  <div className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-move border border-transparent hover:border-gray-200">
                                    <div className="absolute top-0 right-0 hidden group-hover:flex gap-2 z-10 bg-white shadow-sm rounded-md p-1">
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
                                    <div className="p-4">
                                      <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-gray-900">
                                          {formatEmptyField(exp.jobTitle, 'Cargo') || 'Cargo, agrégalo!'}
                                        </h3>
                                        <span className="text-gray-600 text-sm italic">
                                          {exp.startDate || 'Fecha inicio'} — {exp.endDate || 'Fecha fin'}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-700">
                                          {formatEmptyField(exp.company, 'Empresa') || 'Empresa, agrégala!'}
                                        </span>
                                        <span className="text-gray-600 text-sm">
                                          {formatEmptyField(exp.location, 'Ubicación') || 'Ubicación, agrégala!'}
                                        </span>
                                      </div>
                                      <ul className="space-y-1 text-gray-700">
                                        {exp.responsibilities?.map((resp: string, idx: number) => (
                                          <li key={idx} className="text-sm">• {resp}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                )}
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
                <div className="border-b pb-4">
                  <h2 className="text-xl font-bold text-blue-900 mb-4">Education</h2>
                  <Droppable droppableId="education-output" type="education">
                    {(provided) => (
                      <div 
                        className="space-y-6"
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
                              <div 
                                className="relative"
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                {typeof edu === 'string' ? (
                                  <div className="text-sm">{edu}</div>
                                ) : (
                                  <div className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-move border border-transparent hover:border-gray-200">
                                    <div className="absolute top-0 right-0 hidden group-hover:flex gap-2 z-10 bg-white shadow-sm rounded-md p-1">
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
                                    <div className="p-4">
                                      <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-gray-900">
                                          {formatEmptyField(edu.degree, 'Título') || 'Título, agrégalo!'}
                                        </h3>
                                        <span className="text-gray-600 text-sm italic">{edu.graduationYear}</span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-gray-700">
                                          {formatEmptyField(edu.university, 'Universidad') || 'Universidad, agrégala!'}
                                        </span>
                                        {edu.gpa && <span className="text-gray-600 text-sm">GPA: {edu.gpa}</span>}
                                      </div>
                                    </div>
                                  </div>
                                )}
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
                <div>
                  <h2 className="text-xl font-bold text-blue-900 mb-4">Skills, Languages & Hobbies</h2>
                  <div className="group relative">
                    <div className="absolute top-0 right-0 hidden group-hover:flex gap-2 z-10 bg-white shadow-sm rounded-md p-1">
                      <EditDialog
                        title="Skills, Languages, and Hobbies"
                        content={cvData.skills}
                        onSave={handleEditSkills}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h3 className="font-bold text-gray-900 mb-2">Skills</h3>
                        <ul className="space-y-1 text-sm text-gray-700">
                          {cvData.skills.technical.map((skill, index) => (
                            <li key={index}>• {skill}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-2">Languages</h3>
                        <ul className="space-y-1 text-sm text-gray-700">
                          {cvData.skills.languages.map((lang, index) => (
                            <li key={index}>• {typeof lang === 'string' 
                              ? lang 
                              : `${lang.language} (${lang.proficiency})`}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-2">Hobbies</h3>
                        <ul className="space-y-1 text-sm text-gray-700">
                          {cvData.skills.hobbies.map((hobby, index) => (
                            <li key={index}>• {hobby}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DragDropContext>
  )
}