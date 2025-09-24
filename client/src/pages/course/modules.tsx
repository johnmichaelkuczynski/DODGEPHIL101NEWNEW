import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, FileText, MessageSquare, BookOpen, ExternalLink, RefreshCw, Play, Download, Save, User, CheckCircle2, AlertCircle, HelpCircle, Loader2, Volume2, StopCircle, Users, Eye, EyeOff } from 'lucide-react';
import { InteractivePractice } from '@/components/interactive-practice';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { presetLectures, presetPracticeQuizzes, presetPracticeTests, presetPracticeExams } from "@shared/preset-content";
// PDF generation functionality temporarily disabled
// import { generatePDF } from '@/lib/pdf-utils';
import { format } from 'date-fns';

// Symbolic logic symbols for buttons
const logicSymbols = [
  { symbol: '¬', name: 'Negation (NOT)' },
  { symbol: '∧', name: 'Conjunction (AND)' },
  { symbol: '∨', name: 'Disjunction (OR)' },
  { symbol: '→', name: 'Implication (IF-THEN)' },
  { symbol: '↔', name: 'Biconditional (IF AND ONLY IF)' },
  { symbol: '∀', name: 'Universal Quantifier (FOR ALL)' },
  { symbol: '∃', name: 'Existential Quantifier (THERE EXISTS)' },
  { symbol: '≡', name: 'Logical Equivalence' },
  { symbol: '⊥', name: 'Contradiction (FALSE)' },
  { symbol: '⊤', name: 'Tautology (TRUE)' },
  { symbol: '∴', name: 'Therefore' },
  { symbol: '∵', name: 'Because' },
];

interface User {
  id: number;
  username: string;
  credits: number;
}

interface Module {
  week: number;
  title: string;
  livingBookSection: string;
  status: string;
}

interface ModulesPageProps {
  onNavigateToLivingBook: (section: string) => void;
  selectedWeek?: number;
  onWeekChange?: (week: number) => void;
  selectedAssignmentTab?: string | null;
}

interface Question {
  id: string;
  type: 'multiple_choice' | 'short_answer' | 'text_input' | 'essay';
  question: string;
  choices?: string[];
  correct?: number;
  explanation?: string;
  points?: number;
}

interface AssignmentContent {
  instructions: string;
  context?: string;
  questions: Question[];
}

interface PracticeContent {
  instructions: string;
  context?: string;
  questions: Question[];
}

export default function ModulesPage({ onNavigateToLivingBook, selectedWeek, onWeekChange, selectedAssignmentTab }: ModulesPageProps) {
  const [selectedModule, setSelectedModule] = useState(selectedWeek || 0);
  const [activeTab, setActiveTab] = useState(selectedAssignmentTab || 'lecture');
  const queryClient = useQueryClient();
  
  // Get user from auth hook
  const { user } = useAuth();
  
  // Update selected module when selectedWeek changes
  useEffect(() => {
    if (selectedWeek && selectedWeek !== selectedModule) {
      setSelectedModule(selectedWeek);
    }
  }, [selectedWeek, selectedModule]);
  
  // Update active tab when selectedAssignmentTab changes
  useEffect(() => {
    if (selectedAssignmentTab && selectedAssignmentTab !== activeTab) {
      console.log('Setting active tab to:', selectedAssignmentTab);
      setActiveTab(selectedAssignmentTab);
    }
  }, [selectedAssignmentTab, activeTab]);
  
  // Debug logging
  useEffect(() => {
    console.log('ModulesPage state:', { selectedModule, activeTab, selectedAssignmentTab });
  }, [selectedModule, activeTab, selectedAssignmentTab]);

  // Module data - MUST match syllabus exactly
  const modules: Module[] = [
    { week: 1, title: "Introduction to Philosophy and Epistemology", livingBookSection: "section-1", status: "completed" },
    { week: 2, title: "Truth, Lying, and Skepticism", livingBookSection: "section-2", status: "completed" },
    { week: 3, title: "Knowledge and Gettier Problems", livingBookSection: "section-3", status: "completed" },
    { week: 4, title: "Mind-Body Dualism and Divine Command Theory", livingBookSection: "section-4", status: "current" },
    { week: 5, title: "Ethics and Moral Philosophy", livingBookSection: "section-5", status: "upcoming" },
    { week: 6, title: "Final Projects and Moral Responsibility", livingBookSection: "section-6", status: "upcoming" }
  ];

  const selectedModuleData = selectedModule ? modules.find(m => m.week === selectedModule) : null;

  // State for various functionalities
  const [selectedAIModel, setSelectedAIModel] = useState<'deepseek' | 'openai' | 'anthropic' | 'perplexity'>('deepseek');

  // Generated content states
  const [generatedLectures, setGeneratedLectures] = useState<{[key: number]: string}>({});
  const [generatingLecture, setGeneratingLecture] = useState(false);
  
  // Regular homework generation state
  const [generatedHomework, setGeneratedHomework] = useState<{[key: number]: any}>({});
  const [generatingHomework, setGeneratingHomework] = useState(false);

  // Essay states
  const [essayAnswers, setEssayAnswers] = useState<{[key: number]: string}>({});
  const [submittingEssay, setSubmittingEssay] = useState(false);
  const [essayResults, setEssayResults] = useState<{[key: number]: any}>({});

  // Quiz states
  const [quizStarted, setQuizStarted] = useState<{[key: number]: boolean}>({});
  const [generatedQuiz, setGeneratedQuiz] = useState<{[key: number]: any}>({});
  const [generatingQuiz, setGeneratingQuiz] = useState(false);

  // Test states  
  const [testStarted, setTestStarted] = useState<{[key: number]: boolean}>({});
  const [generatedTest, setGeneratedTest] = useState<{[key: number]: any}>({});
  const [generatingTest, setGeneratingTest] = useState(false);

  // Practice states
  const [practiceAnswers, setPracticeAnswers] = useState<{[key: string]: string}>({});
  const [isConverting, setIsConverting] = useState(false);

  // Study guide states
  const [generatedStudyGuides, setGeneratedStudyGuides] = useState<{[key: number]: string}>({});
  const [generatingStudyGuide, setGeneratingStudyGuide] = useState(false);

  // Discussion states
  const [discussionAnswers, setDiscussionAnswers] = useState<{[key: number]: string}>({});
  const [submittingDiscussion, setSubmittingDiscussion] = useState(false);
  const [discussionResults, setDiscussionResults] = useState<{[key: number]: any}>({});

  // Diagnostic states
  const [showingDiagnostic, setShowingDiagnostic] = useState(false);
  const [diagnosticAnswers, setDiagnosticAnswers] = useState<{[key: string]: string}>({});
  const [submittingDiagnostic, setSubmittingDiagnostic] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);

  // Simple exam generation states
  const [generatedSimpleExam, setGeneratedSimpleExam] = useState<any>(null);
  const [generatingSimpleExam, setGeneratingSimpleExam] = useState(false);

  // Audio states
  const [playingAudio, setPlayingAudio] = useState<{[key: number]: boolean}>({});
  const [generatingAudio, setGeneratingAudio] = useState<{[key: number]: boolean}>({});

  // Helper functions
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'current':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Current</Badge>;
      case 'upcoming':
        return <Badge variant="secondary">Upcoming</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatLogicNotation = (text: string): string => {
    return text
      .replace(/NOT/g, '¬')
      .replace(/AND/g, '∧')
      .replace(/OR/g, '∨')
      .replace(/IMPLIES/g, '→')
      .replace(/IFF/g, '↔')
      .replace(/FORALL/g, '∀')
      .replace(/EXISTS/g, '∃');
  };

  const convertLogicText = async (textareaId: string) => {
    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
    if (!textarea) return;

    const selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
    if (!selectedText) {
      alert('Please select some text to convert');
      return;
    }

    setIsConverting(true);
    try {
      const response = await fetch('/api/chat/convert-logic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: selectedText,
          aiModel: selectedAIModel
        })
      });

      const data = await response.json();
      if (data.success) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = textarea.value.substring(0, start) + data.converted + textarea.value.substring(end);
        
        // Update the appropriate state
        if (textareaId.includes('practice')) {
          setPracticeAnswers(prev => ({
            ...prev,
            [textareaId]: newValue
          }));
        } else if (textareaId.includes('essay')) {
          setEssayAnswers(prev => ({
            ...prev,
            [parseInt(textareaId.split('_')[1])]: newValue
          }));
        } else if (textareaId.includes('discussion')) {
          setDiscussionAnswers(prev => ({
            ...prev,
            [parseInt(textareaId.split('_')[1])]: newValue
          }));
        }
        
        // Update textarea value
        textarea.value = newValue;
        
        // Position cursor after converted text
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + data.converted.length, start + data.converted.length);
        }, 0);
      } else {
        alert('Conversion failed: ' + data.error);
      }
    } catch (error) {
      console.error('Logic conversion error:', error);
      alert('Error converting text. Please try again.');
    } finally {
      setIsConverting(false);
    }
  };

  // REMOVED DUPLICATE FUNCTION

  const showPresetPracticeQuiz = (weekNumber: number) => {
    // FORCE AI GENERATION - NO PRESET CONTENT ALLOWED
    // Start generation immediately instead of using any preset content
    generatePracticeQuiz(weekNumber);
  };

  const insertLogicSymbol = (symbol: string, textareaId: string) => {
    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = practiceAnswers[textareaId] || '';
    
    const newValue = currentValue.substring(0, start) + symbol + currentValue.substring(end);
    setPracticeAnswers(prev => ({
      ...prev,
      [textareaId]: newValue
    }));
    
    // Update textarea and focus
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + symbol.length, start + symbol.length);
    }, 0);
  };

  // Generate homework function
  const generateHomework = async (weekNumber: number) => {
    if (!user) return;
    
    setGeneratingHomework(true);
    
    const weekTopic = modules.find(m => m.week === weekNumber)?.title || '';
    
    try {
      const response = await fetch('/api/homework/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weekNumber,
          topic: weekTopic,
          courseMaterial: `Week ${weekNumber} covers ${weekTopic}. This is part of a 6-week introduction to philosophy course.`,
          aiModel: selectedAIModel
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('Homework generated successfully:', data.homework);
        console.log('Type of homework data:', typeof data.homework);
        console.log('Homework data keys:', Object.keys(data.homework || {}));
        setGeneratedHomework(prev => ({
          ...prev,
          [weekNumber]: data.homework
        }));
      } else {
        throw new Error(data.error || 'Failed to generate homework');
      }
      
    } catch (error) {
      console.error('Error generating homework:', error);
      console.error('Full error details:', JSON.stringify(error));
      alert(`Failed to generate homework: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setGeneratingHomework(false);
    }
  };

  // Regular homework generation (similar to practice homework but for grades)
  const generateHomeworkForWeek = async (weekNumber: number) => {
    if (!user) return;
    
    setGeneratingHomework(true);
    
    const weekTopic = modules.find(m => m.week === weekNumber)?.title || '';
    
    try {
      const response = await fetch('/api/homework/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weekNumber,
          topic: weekTopic,
          courseMaterial: `Week ${weekNumber} covers ${weekTopic}. This is part of a 6-week introduction to philosophy course.`,
          aiModel: selectedAIModel,
          isPractice: false, // This is graded homework, not practice
          timestamp: new Date().toISOString()
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('Graded homework generated successfully:', data.homework);
        setGeneratedHomework(prev => ({
          ...prev,
          [weekNumber]: data.homework
        }));
      } else {
        throw new Error(data.error || 'Failed to generate graded homework');
      }
      
    } catch (error) {
      console.error('Error generating graded homework:', error);
      alert(`Failed to generate graded homework: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setGeneratingHomework(false);
    }
  };

  const generateLecture = async (weekNumber: number) => {
    if (!user) return;
    
    setGeneratingLecture(true);
    
    const weekTopic = modules.find(m => m.week === weekNumber)?.title || '';
    
    try {
      const response = await fetch('/api/lectures/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weekNumber,
          topic: weekTopic,
          aiModel: selectedAIModel
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setGeneratedLectures(prev => ({
          ...prev,
          [weekNumber]: data.lecture
        }));
      } else {
        throw new Error(data.error || 'Failed to generate lecture');
      }
      
    } catch (error) {
      console.error('Error generating lecture:', error);
      alert(`Failed to generate lecture: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setGeneratingLecture(false);
    }
  };

  const generateQuiz = async (weekNumber: number) => {
    if (!user) return;
    
    setGeneratingQuiz(true);
    
    const weekTopic = modules.find(m => m.week === weekNumber)?.title || '';
    
    try {
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weekNumber,
          topic: weekTopic,
          courseMaterial: `Week ${weekNumber} covers ${weekTopic}. This is part of a 6-week introduction to philosophy course.`,
          aiModel: selectedAIModel
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setGeneratedQuiz(prev => ({
          ...prev,
          [weekNumber]: data.quiz
        }));
        setQuizStarted(prev => ({ ...prev, [weekNumber]: true }));
      } else {
        throw new Error(data.error || 'Failed to generate quiz');
      }
      
    } catch (error) {
      console.error('Error generating quiz:', error);
      alert(`Failed to generate quiz: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const generateTest = async (weekNumber: number) => {
    if (!user) return;
    
    setGeneratingTest(true);
    
    const weekTopic = modules.find(m => m.week === weekNumber)?.title || '';
    
    try {
      const response = await fetch('/api/test/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weekNumber,
          topic: weekTopic,
          courseMaterial: `Week ${weekNumber} covers ${weekTopic}. This is part of a 6-week introduction to philosophy course.`,
          aiModel: selectedAIModel
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setGeneratedTest(prev => ({
          ...prev,
          [weekNumber]: data.test
        }));
        setTestStarted(prev => ({ ...prev, [weekNumber]: true }));
      } else {
        throw new Error(data.error || 'Failed to generate test');
      }
      
    } catch (error) {
      console.error('Error generating test:', error);
      alert(`Failed to generate test: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setGeneratingTest(false);
    }
  };

  const generatePracticeQuiz = async (weekNumber: number) => {
    if (!user) return;
    
    setGeneratingTest(true);
    
    const weekTopic = modules.find(m => m.week === weekNumber)?.title || '';
    
    try {
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weekNumber,
          topic: weekTopic,
          courseMaterial: `Week ${weekNumber} covers ${weekTopic}. This is part of a 6-week introduction to philosophy course.`,
          aiModel: selectedAIModel,
          isPractice: true
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setGeneratedTest(prev => ({
          ...prev,
          [weekNumber]: data.quiz
        }));
        setTestStarted(prev => ({ ...prev, [weekNumber]: true }));
      } else {
        throw new Error(data.error || 'Failed to generate practice quiz');
      }
      
    } catch (error) {
      console.error('Error generating practice quiz:', error);
      alert(`Failed to generate practice quiz: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setGeneratingTest(false);
    }
  };

  const handleSubmit = async (assignmentType: 'essay' | 'discussion', weekNumber: number, answer: string) => {
    if (!user || !answer.trim()) return;

    // Prepare submission data
    const submissionData = {
      weekNumber,
      answer,
      timestamp: new Date().toISOString()
    };

    try {
      // Use the structured submission logic we created
      const response = await fetch('/api/assignments/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignmentType,
          content: answer,
          weekNumber
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Store detailed grading results similar to practice homework
        if (assignmentType === 'essay') {
          setEssayResults(prev => ({
            ...prev,
            [weekNumber]: result
          }));
        } else if (assignmentType === 'discussion') {
          setDiscussionResults(prev => ({
            ...prev,
            [weekNumber]: result
          }));
        }
        
        let submissionMessage = `${assignmentType === 'essay' ? 'Essay' : 'Discussion'} submitted successfully! Grade: ${result.grade || 'Processing'}`;
        
        // Add AI detection warning if flagged
        if (result.aiDetection && result.aiDetection.flagged) {
          submissionMessage += `\n\n⚠️ AI Detection Alert: This submission was flagged with ${result.aiDetection.aiProbability}% AI probability (${result.aiDetection.confidence} confidence). Please review for academic integrity.`;
        } else if (result.aiDetection) {
          submissionMessage += `\n\n✓ AI Detection: ${result.aiDetection.aiProbability}% AI probability detected.`;
        }
        
        alert(submissionMessage);
      } else {
        throw new Error(result.error || 'Submission failed');
      }
    } catch (error) {
      console.error(`${assignmentType} submission error:`, error);
      alert(`Failed to submit ${assignmentType}. Please try again.`);
    }
  };

  // Practice assignment completion handler
  const handlePracticeComplete = async (
    practiceType: 'homework' | 'quiz' | 'test',
    weekNumber: number,
    score: number,
    answers: Record<string, any>,
    timeSpent: number
  ) => {
    console.log(`Practice ${practiceType} completed:`, {
      weekNumber,
      score,
      timeSpent,
      totalAnswers: Object.keys(answers).length
    });
    
    // Log completion for tracking purposes - no popup, let InteractivePractice show results inline
    try {
      // Here you could optionally store practice completion data for analytics
      // Results are now shown inline with each question instead of in a popup
    } catch (error) {
      console.error('Error logging practice completion:', error);
    }
  };

  const submitEssay = async (weekNumber: number) => {
    const answer = essayAnswers[weekNumber];
    if (!answer?.trim()) return;

    setSubmittingEssay(true);
    try {
      await handleSubmit('essay', weekNumber, answer);
    } finally {
      setSubmittingEssay(false);
    }
  };

  const submitDiscussion = async (weekNumber: number) => {
    const answer = discussionAnswers[weekNumber];
    if (!answer?.trim()) return;

    setSubmittingDiscussion(true);
    try {
      await handleSubmit('discussion', weekNumber, answer);
    } finally {
      setSubmittingDiscussion(false);
    }
  };

  const generateStudyGuide = async (weekNumber: number) => {
    if (!user) return;
    
    setGeneratingStudyGuide(true);
    
    const weekTopic = modules.find(m => m.week === weekNumber)?.title || '';
    
    try {
      const response = await fetch('/api/study-guide/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weekNumber,
          topic: weekTopic,
          courseMaterial: `Week ${weekNumber} covers ${weekTopic}. This is part of a 6-week introduction to philosophy course.`,
          aiModel: selectedAIModel
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setGeneratedStudyGuides(prev => ({
          ...prev,
          [weekNumber]: data.studyGuide
        }));
      } else {
        throw new Error(data.error || 'Failed to generate study guide');
      }
      
    } catch (error) {
      console.error('Error generating study guide:', error);
      alert(`Failed to generate study guide: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setGeneratingStudyGuide(false);
    }
  };

  const generateSimpleExam = async (weekNumber: number) => {
    if (!user) return;
    
    setGeneratingSimpleExam(true);
    
    try {
      const examType = weekNumber === 4 ? 'midterm' : weekNumber === 6 ? 'final' : 'quiz';
      const response = await fetch('/api/exam/generate-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weekNumber,
          examType,
          aiModel: selectedAIModel
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        console.log('Exam generated successfully:', data.exam);
        setGeneratedSimpleExam(data.exam);
        setTestStarted(prev => ({ ...prev, [weekNumber]: true }));
        setGeneratedTest(prev => ({ ...prev, [weekNumber]: data.exam }));
      } else {
        throw new Error(data.error || 'Failed to generate exam');
      }
      
    } catch (error) {
      console.error('Error generating exam:', error);
      alert(`Failed to generate exam: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setGeneratingSimpleExam(false);
    }
  };

  const toggleAudio = async (weekNumber: number) => {
    if (playingAudio[weekNumber]) {
      // Stop audio
      setPlayingAudio(prev => ({ ...prev, [weekNumber]: false }));
      return;
    }

    setGeneratingAudio(prev => ({ ...prev, [weekNumber]: true }));
    
    try {
      const response = await fetch('/api/audio/generate-lecture-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weekNumber,
          text: generatedLectures[weekNumber] || presetLectures[weekNumber as keyof typeof presetLectures]
        }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          setPlayingAudio(prev => ({ ...prev, [weekNumber]: false }));
          URL.revokeObjectURL(audioUrl);
        };
        
        setPlayingAudio(prev => ({ ...prev, [weekNumber]: true }));
        audio.play();
      } else {
        throw new Error('Failed to generate audio');
      }
    } catch (error) {
      console.error('Error generating audio:', error);
      alert('Failed to generate audio. Please try again.');
    } finally {
      setGeneratingAudio(prev => ({ ...prev, [weekNumber]: false }));
    }
  };

  const downloadPDF = async (weekNumber: number) => {
    const content = generatedLectures[weekNumber] || presetLectures[weekNumber as keyof typeof presetLectures];
    if (content) {
      const weekTopic = modules.find(m => m.week === weekNumber)?.title || `Week ${weekNumber}`;
      // PDF generation temporarily disabled
      // await generatePDF(content, `Week ${weekNumber} - ${weekTopic} Lecture`);
      console.log('PDF download would be triggered here');
    }
  };

  const copyToClipboard = async (weekNumber: number) => {
    const content = generatedLectures[weekNumber] || presetLectures[weekNumber as keyof typeof presetLectures];
    if (content) {
      try {
        await navigator.clipboard.writeText(content);
        alert('Lecture content copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        alert('Failed to copy content to clipboard.');
      }
    }
  };

  if (selectedModule === 0 || selectedModule === null || selectedModule === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Course Modules</h1>
            <p className="text-gray-600">Select a module to access lectures, assignments, discussions, essays, and assessments.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module) => (
              <Card 
                key={module.week} 
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                  module.status === 'current' ? 'ring-2 ring-blue-500 bg-blue-50' :
                  module.status === 'completed' ? 'bg-green-50' : 'bg-gray-50'
                }`}
                onClick={() => setSelectedModule(module.week)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Week {module.week}</CardTitle>
                    {getStatusBadge(module.status)}
                  </div>
                  <h3 className="text-sm font-semibold text-gray-700">{module.title}</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <BookOpen className="w-4 h-4" />
                      <span>Living Book: {module.livingBookSection}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>Discussion</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FileText className="w-3 h-3" />
                        <span>Essay</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FileText className="w-3 h-3" />
                        <span>Homework</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <HelpCircle className="w-3 h-3" />
                        <span>{module.week === 4 ? 'Midterm' : module.week === 6 ? 'Final' : 'Quiz'}</span>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full mt-4"
                      variant={module.status === 'current' ? 'default' : 'outline'}
                    >
                      {module.status === 'upcoming' ? 'Preview Module' : 'Enter Module'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Quick Access Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Access</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => window.location.href = '/final-exam'}>
                <CardContent className="p-4 text-center">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                  <h3 className="font-semibold">Final Exam</h3>
                  <p className="text-sm text-gray-600">Comprehensive Exam</p>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedModule(4)}>
                <CardContent className="p-4 text-center">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
                  <h3 className="font-semibold">Midterm Exam</h3>
                  <p className="text-sm text-gray-600">Week 4</p>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedModule(6)}>
                <CardContent className="p-4 text-center">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <h3 className="font-semibold">Final Exam</h3>
                  <p className="text-sm text-gray-600">Week 6</p>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <h3 className="font-semibold">All Practice</h3>
                  <p className="text-sm text-gray-600">Unlimited Attempts</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If selectedModuleData exists, render the module content
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {selectedModuleData && (
          <div className="max-w-4xl">
            <div className="mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedModule(0);
                    if (onWeekChange) onWeekChange(0);
                  }}
                  className="flex items-center space-x-2"
                >
                  ← Back to Modules
                </Button>
              </div>
              <h1 className="text-2xl font-bold mb-2">
                Week {selectedModuleData.week}: {selectedModuleData.title}
              </h1>
              <div className="flex items-center space-x-4">
                {getStatusBadge(selectedModuleData.status)}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigateToLivingBook(selectedModuleData.livingBookSection)}
                  className="flex items-center space-x-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>View in Living Book</span>
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className={`grid w-full ${(selectedModuleData.week === 6 || selectedModuleData.week === 3) ? 'grid-cols-7' : 'grid-cols-6'}`}>
                <TabsTrigger value="lecture">Lecture Summary</TabsTrigger>
                <TabsTrigger value="discussion">Discussion</TabsTrigger>
                <TabsTrigger value="essay">Essay</TabsTrigger>
                <TabsTrigger value="homework">Homework</TabsTrigger>
                <TabsTrigger value="practice-quiz">{selectedModuleData.week === 4 ? 'Practice Midterm' : selectedModuleData.week === 6 ? 'Practice Final' : 'Practice Quiz/Test'}</TabsTrigger>
                <TabsTrigger value="quiz">Quiz/Test</TabsTrigger>
                {(selectedModuleData.week === 6 || selectedModuleData.week === 3) && (
                  <TabsTrigger value="study-guide">Living Study Guide</TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="lecture" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="w-5 h-5" />
                      <span>Lecture Summary</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {generatedLectures[selectedModuleData.week] ? (
                      <div className="space-y-4">
                        <div className="prose max-w-none dark:prose-invert">
                          <div 
                            className="text-sm leading-relaxed text-gray-700 dark:text-gray-300"
                            dangerouslySetInnerHTML={{
                              __html: (() => {
                                const content = generatedLectures[selectedModuleData.week] || '';
                                
                                // If content is already HTML (from preset), return as-is
                                if (content.includes('<h') || content.includes('<p') || content.includes('<ul')) {
                                  return content;
                                }
                                
                                // If content is markdown/plain text (from AI generation), convert it
                                return content
                                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                  .replace(/\n\n/g, '</p><p>')
                                  .replace(/\n/g, '<br/>')
                                  .replace(/^(.*)/, '<p>$1')
                                  .replace(/(.*$)/, '$1</p>');
                              })()
                            }}
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2 pt-4 border-t">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleAudio(selectedModuleData.week)}
                            disabled={generatingAudio[selectedModuleData.week]}
                            className="flex items-center space-x-2"
                          >
                            {generatingAudio[selectedModuleData.week] ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : playingAudio[selectedModuleData.week] ? (
                              <StopCircle className="w-4 h-4" />
                            ) : (
                              <Volume2 className="w-4 h-4" />
                            )}
                            <span>
                              {generatingAudio[selectedModuleData.week] 
                                ? 'Generating...' 
                                : playingAudio[selectedModuleData.week] 
                                  ? 'Stop Audio' 
                                  : 'Listen to Audio'
                              }
                            </span>
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadPDF(selectedModuleData.week)}
                            className="flex items-center space-x-2"
                          >
                            <Download className="w-4 h-4" />
                            <span>Download PDF</span>
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(selectedModuleData.week)}
                            className="flex items-center space-x-2"
                          >
                            <Save className="w-4 h-4" />
                            <span>Copy Text</span>
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generateLecture(selectedModuleData.week)}
                            disabled={generatingLecture}
                            className="flex items-center space-x-2"
                          >
                            <RefreshCw className={`w-4 h-4 ${generatingLecture ? 'animate-spin' : ''}`} />
                            <span>Regenerate</span>
                          </Button>
                        </div>
                      </div>
                    ) : presetLectures[selectedModuleData.week as keyof typeof presetLectures] ? (
                      <div className="space-y-4">
                        <div className="prose max-w-none dark:prose-invert">
                          <div 
                            className="text-sm leading-relaxed text-gray-700 dark:text-gray-300"
                            dangerouslySetInnerHTML={{
                              __html: presetLectures[selectedModuleData.week as keyof typeof presetLectures] || ''
                            }}
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2 pt-4 border-t">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleAudio(selectedModuleData.week)}
                            disabled={generatingAudio[selectedModuleData.week]}
                            className="flex items-center space-x-2"
                          >
                            {generatingAudio[selectedModuleData.week] ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : playingAudio[selectedModuleData.week] ? (
                              <StopCircle className="w-4 h-4" />
                            ) : (
                              <Volume2 className="w-4 h-4" />
                            )}
                            <span>
                              {generatingAudio[selectedModuleData.week] 
                                ? 'Generating...' 
                                : playingAudio[selectedModuleData.week] 
                                  ? 'Stop Audio' 
                                  : 'Listen to Audio'
                              }
                            </span>
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadPDF(selectedModuleData.week)}
                            className="flex items-center space-x-2"
                          >
                            <Download className="w-4 h-4" />
                            <span>Download PDF</span>
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(selectedModuleData.week)}
                            className="flex items-center space-x-2"
                          >
                            <Save className="w-4 h-4" />
                            <span>Copy Text</span>
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generateLecture(selectedModuleData.week)}
                            disabled={generatingLecture}
                            className="flex items-center space-x-2"
                          >
                            <RefreshCw className={`w-4 h-4 ${generatingLecture ? 'animate-spin' : ''}`} />
                            <span>Generate AI Version</span>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Lecture Content</h3>
                        <p className="text-gray-500 mb-4">Generate a comprehensive lecture summary for this week's topic.</p>
                        <Button 
                          onClick={() => generateLecture(selectedModuleData.week)}
                          disabled={generatingLecture}
                          className="flex items-center space-x-2"
                        >
                          {generatingLecture ? (
                            <>
                              <Clock className="w-4 h-4 animate-spin" />
                              <span>Generating Lecture...</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4" />
                              <span>Generate Lecture</span>
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="discussion" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="w-5 h-5" />
                        <span>Discussion Assignment</span>
                      </div>
                      <Badge variant="outline">20 points</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-800 mb-2">Discussion Prompt for Week {selectedModuleData.week}</h4>
                        <p className="text-blue-700">
                          Reflect on the key concepts from this week's reading on {selectedModuleData.title}. 
                          What questions does this material raise for you? How do these ideas connect to your 
                          personal experience or other philosophical concepts we've discussed?
                        </p>
                      </div>
                      
                      {discussionResults[selectedModuleData.week] ? (
                        <div className="space-y-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h5 className="font-semibold mb-2">Your Response:</h5>
                            <p className="text-sm text-gray-700">{discussionAnswers[selectedModuleData.week]}</p>
                          </div>
                          
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div className="space-y-1">
                                <h4 className="font-bold text-green-800">Discussion Grade: {discussionResults[selectedModuleData.week].grade}</h4>
                                {discussionResults[selectedModuleData.week].aiDetection && (
                                  <div className="flex items-center space-x-2">
                                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                                      discussionResults[selectedModuleData.week].aiDetection.flagged 
                                        ? 'bg-red-100 text-red-700 border border-red-200' 
                                        : 'bg-blue-100 text-blue-700 border border-blue-200'
                                    }`}>
                                      {discussionResults[selectedModuleData.week].aiDetection.flagged ? '⚠️' : '✓'} AI Detection: {discussionResults[selectedModuleData.week].aiDetection.aiProbability}%
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      ({discussionResults[selectedModuleData.week].aiDetection.confidence} confidence)
                                    </span>
                                  </div>
                                )}
                              </div>
                              <Badge variant="default" className="bg-green-100 text-green-800">Submitted</Badge>
                            </div>
                            <p className="text-green-700 text-sm">
                              {discussionResults[selectedModuleData.week].feedback}
                            </p>
                            {discussionResults[selectedModuleData.week].aiDetection?.flagged && (
                              <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                                <strong>Academic Integrity Alert:</strong> This submission was flagged for potential AI usage. Please review the content for originality.
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Your Discussion Response:</label>
                            <textarea
                              id={`discussion_${selectedModuleData.week}`}
                              className="w-full p-4 border border-gray-300 rounded-lg resize-none"
                              rows={8}
                              placeholder="Share your thoughts and reflections on this week's material..."
                              value={discussionAnswers[selectedModuleData.week] || ''}
                              onChange={(e) => setDiscussionAnswers(prev => ({
                                ...prev,
                                [selectedModuleData.week]: e.target.value
                              }))}
                            />
                          </div>
                          
                          <div className="mb-4">
                            <h4 className="text-sm font-medium mb-2">Symbolic Logic Tools:</h4>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {logicSymbols.map((item) => (
                                <button
                                  key={item.symbol}
                                  onClick={() => insertLogicSymbol(item.symbol, `discussion_${selectedModuleData.week}`)}
                                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm font-mono border"
                                  title={item.name}
                                >
                                  {item.symbol}
                                </button>
                              ))}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => convertLogicText(`discussion_${selectedModuleData.week}`)}
                              disabled={isConverting}
                              className="text-xs"
                            >
                              {isConverting ? 'Converting...' : 'Convert Selected Text to Logic'}
                            </Button>
                          </div>

                          <div className="flex justify-end">
                            <Button
                              onClick={() => submitDiscussion(selectedModuleData.week)}
                              disabled={submittingDiscussion || !discussionAnswers[selectedModuleData.week]?.trim()}
                              className="flex items-center space-x-2"
                            >
                              {submittingDiscussion ? (
                                <>
                                  <Clock className="w-4 h-4 animate-spin" />
                                  <span>Submitting...</span>
                                </>
                              ) : (
                                <>
                                  <MessageSquare className="w-4 h-4" />
                                  <span>Submit Discussion</span>
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="essay" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5" />
                        <span>Essay Assignment</span>
                      </div>
                      <Badge variant="outline">100 points</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-800 mb-2">Essay Topic for Week {selectedModuleData.week}</h4>
                        <p className="text-blue-700">
                          Write a 500-750 word essay analyzing the main themes in {selectedModuleData.title}. 
                          Your essay should demonstrate critical thinking, use specific examples from the readings, 
                          and present a clear argument supported by evidence.
                        </p>
                      </div>
                      
                      {essayResults[selectedModuleData.week] ? (
                        <div className="space-y-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h5 className="font-semibold mb-2">Your Essay:</h5>
                            <div className="text-sm text-gray-700 whitespace-pre-wrap">{essayAnswers[selectedModuleData.week]}</div>
                          </div>
                          
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div className="space-y-1">
                                <h4 className="font-bold text-green-800">Essay Grade: {essayResults[selectedModuleData.week].grade}</h4>
                                {essayResults[selectedModuleData.week].aiDetection && (
                                  <div className="flex items-center space-x-2">
                                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                                      essayResults[selectedModuleData.week].aiDetection.flagged 
                                        ? 'bg-red-100 text-red-700 border border-red-200' 
                                        : 'bg-blue-100 text-blue-700 border border-blue-200'
                                    }`}>
                                      {essayResults[selectedModuleData.week].aiDetection.flagged ? '⚠️' : '✓'} AI Detection: {essayResults[selectedModuleData.week].aiDetection.aiProbability}%
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      ({essayResults[selectedModuleData.week].aiDetection.confidence} confidence)
                                    </span>
                                  </div>
                                )}
                              </div>
                              <Badge variant="default" className="bg-green-100 text-green-800">Submitted</Badge>
                            </div>
                            <p className="text-green-700 text-sm">
                              {essayResults[selectedModuleData.week].feedback}
                            </p>
                            {essayResults[selectedModuleData.week].aiDetection?.flagged && (
                              <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                                <strong>Academic Integrity Alert:</strong> This submission was flagged for potential AI usage. Please review the content for originality.
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Your Essay:</label>
                            <textarea
                              id={`essay_${selectedModuleData.week}`}
                              className="w-full p-4 border border-gray-300 rounded-lg resize-none"
                              rows={12}
                              placeholder="Write your essay here..."
                              value={essayAnswers[selectedModuleData.week] || ''}
                              onChange={(e) => setEssayAnswers(prev => ({
                                ...prev,
                                [selectedModuleData.week]: e.target.value
                              }))}
                            />
                          </div>
                          
                          <div className="mb-4">
                            <h4 className="text-sm font-medium mb-2">Symbolic Logic Tools:</h4>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {logicSymbols.map((item) => (
                                <button
                                  key={item.symbol}
                                  onClick={() => insertLogicSymbol(item.symbol, `essay_${selectedModuleData.week}`)}
                                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm font-mono border"
                                  title={item.name}
                                >
                                  {item.symbol}
                                </button>
                              ))}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => convertLogicText(`essay_${selectedModuleData.week}`)}
                              disabled={isConverting}
                              className="text-xs"
                            >
                              {isConverting ? 'Converting...' : 'Convert Selected Text to Logic'}
                            </Button>
                          </div>

                          <div className="flex justify-end">
                            <Button
                              onClick={() => submitEssay(selectedModuleData.week)}
                              disabled={submittingEssay || !essayAnswers[selectedModuleData.week]?.trim()}
                              className="flex items-center space-x-2"
                            >
                              {submittingEssay ? (
                                <>
                                  <Clock className="w-4 h-4 animate-spin" />
                                  <span>Submitting...</span>
                                </>
                              ) : (
                                <>
                                  <FileText className="w-4 h-4" />
                                  <span>Submit Essay</span>
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="homework" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5" />
                        <span>Graded Homework</span>
                      </div>
                      <Badge variant="outline">50 points</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Generate homework button for AI-generated content */}
                      <div className="text-center py-8">
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                          <h4 className="font-semibold text-gray-800 mb-2">Graded Homework Assignment</h4>
                          <p className="text-gray-700 mb-4">
                            Generate an interactive homework assignment for Week {selectedModuleData.week}.
                          </p>
                          <Button 
                            onClick={() => generateHomeworkForWeek(selectedModuleData.week)}
                            disabled={generatingHomework}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {generatingHomework ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Generating Homework...
                              </>
                            ) : generatedHomework[selectedModuleData.week] ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Regenerate Homework
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4 mr-2" />
                                Generate Homework
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Display generated homework */}
                      {generatedHomework[selectedModuleData.week] && (
                        <InteractivePractice
                          title={`Week ${selectedModuleData.week} Homework`}
                          content={generatedHomework[selectedModuleData.week]}
                          practiceType="homework"
                          weekNumber={selectedModuleData.week}
                          onComplete={(score: number, answers: Record<string, any>, timeSpent: number) => 
                            handlePracticeComplete('homework', selectedModuleData.week, score, answers, timeSpent)
                          }
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="quiz" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5" />
                        <span>Quiz/Test</span>
                      </div>
                      <Badge variant="outline">
                        {selectedModuleData.week === 4 ? "Midterm - 100 points" : selectedModuleData.week === 6 ? "Final - 150 points" : "Quiz - 25 points"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {quizStarted[selectedModuleData.week] && generatedQuiz[selectedModuleData.week] ? (
                      // Show the generated quiz
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold">
                            {generatedQuiz[selectedModuleData.week].title || `Week ${selectedModuleData.week} Quiz`}
                          </h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generateQuiz(selectedModuleData.week)}
                            disabled={generatingQuiz}
                            className="flex items-center space-x-2"
                          >
                            <RefreshCw className={`w-4 h-4 ${generatingQuiz ? 'animate-spin' : ''}`} />
                            <span>Regenerate</span>
                          </Button>
                        </div>
                        
                        <InteractivePractice
                          title={generatedQuiz[selectedModuleData.week].title || `Week ${selectedModuleData.week} Quiz`}
                          content={generatedQuiz[selectedModuleData.week]}
                          practiceType="quiz"
                          weekNumber={selectedModuleData.week}
                          onComplete={(score: number, answers: Record<string, any>, timeSpent: number) => 
                            handlePracticeComplete('quiz', selectedModuleData.week, score, answers, timeSpent)
                          }
                        />
                      </div>
                    ) : (
                      // Show the generate quiz button
                      <div className="text-center py-8">
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                          <h4 className="font-semibold text-gray-800 mb-2">
                            {selectedModuleData.week === 4 ? "Midterm Exam" : selectedModuleData.week === 6 ? "Final Exam" : "Quiz"}
                          </h4>
                          <p className="text-gray-700 mb-4">
                            Generate an interactive {selectedModuleData.week === 4 ? "midterm exam" : selectedModuleData.week === 6 ? "final exam" : "quiz"} for Week {selectedModuleData.week}.
                          </p>
                          <Button 
                            onClick={() => generateQuiz(selectedModuleData.week)}
                            disabled={generatingQuiz}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {generatingQuiz ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Generating {selectedModuleData.week === 4 ? "Midterm" : selectedModuleData.week === 6 ? "Final" : "Quiz"}...
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4 mr-2" />
                                Generate {selectedModuleData.week === 4 ? "Midterm" : selectedModuleData.week === 6 ? "Final" : "Quiz"}
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="practice-quiz" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5" />
                        <span>{selectedModuleData.week === 4 ? 'Practice Midterm Exam' : selectedModuleData.week === 6 ? 'Practice Final Exam' : 'Practice Quiz/Test'}</span>
                      </div>
                      <Badge variant="default" className="bg-green-100 text-green-800">🎯 Practice Mode</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-muted-foreground">
                          Practice problems for Week {selectedModuleData.week} with unlimited attempts. No grades recorded.
                        </p>
                        <div className="flex items-center space-x-2">
                          <label className="text-sm font-medium">AI Model:</label>
                          <select
                            value={selectedAIModel}
                            onChange={(e) => setSelectedAIModel(e.target.value as any)}
                            className="text-sm border rounded px-2 py-1"
                          >
                            <option value="deepseek">ZHI 1</option>
                            <option value="openai">ZHI 2</option>
                            <option value="anthropic">ZHI 3</option>
                            <option value="perplexity">ZHI 4</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-semibold text-green-800 mb-2">✅ Practice Benefits</h4>
                        <ul className="text-sm text-green-700 space-y-1">
                          <li>• Take as many practice quizzes as you want</li>
                          <li>• Learn without grade pressure</li>
                          <li>• Get immediate feedback on answers</li>
                          <li>• Similar format to graded quiz</li>
                          <li>• Master concepts before taking graded version</li>
                        </ul>
                      </div>

                      {(testStarted[selectedModuleData.week] && generatedTest[selectedModuleData.week]) || (generatedSimpleExam) ? (
                        // Show the generated practice quiz/exam
                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">
                              {generatedSimpleExam?.title || generatedTest[selectedModuleData.week]?.title || `Week ${selectedModuleData.week} Practice Quiz`}
                            </h3>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => generateSimpleExam(selectedModuleData.week)}
                              disabled={generatingSimpleExam}
                              className="flex items-center space-x-2"
                            >
                              <RefreshCw className={`w-4 h-4 ${generatingSimpleExam ? 'animate-spin' : ''}`} />
                              <span>Generate New</span>
                            </Button>
                          </div>
                          
                          <InteractivePractice
                            title={generatedSimpleExam?.title || generatedTest[selectedModuleData.week]?.title || `Week ${selectedModuleData.week} Practice Quiz`}
                            content={generatedSimpleExam || generatedTest[selectedModuleData.week]}
                            practiceType="quiz"
                            weekNumber={selectedModuleData.week}
                            onComplete={(score: number, answers: Record<string, any>, timeSpent: number) => 
                              handlePracticeComplete('quiz', selectedModuleData.week, score, answers, timeSpent)
                            }
                          />
                        </div>
                      ) : (
                        // Show preset content or generate button
                        (() => {
                          const presetContent = presetPracticeQuizzes[selectedModuleData.week as keyof typeof presetPracticeQuizzes] as any;
                          if (presetContent && typeof presetContent === 'object' && presetContent.content) {
                            return (
                              <div className="space-y-4">
                                <InteractivePractice
                                  title={presetContent.title || `Week ${selectedModuleData.week} Practice Quiz`}
                                  content={presetContent.content as any}
                                  practiceType="quiz"
                                  weekNumber={selectedModuleData.week}
                                  onComplete={(score: number, answers: Record<string, any>, timeSpent: number) => 
                                    handlePracticeComplete('quiz', selectedModuleData.week, score, answers, timeSpent)
                                  }
                                />
                                
                                {/* Add generate new practice button after preset content */}
                                <div className="mt-6 pt-4 border-t border-gray-200">
                                  <div className="flex justify-center">
                                    <Button 
                                      variant="outline"
                                      className="flex items-center space-x-2"
                                      onClick={() => generatePracticeQuiz(selectedModuleData.week)}
                                      disabled={generatingTest}
                                    >
                                      {generatingTest ? (
                                        <>
                                          <Clock className="w-4 h-4 animate-spin" />
                                          <span>Generating New Practice...</span>
                                        </>
                                      ) : (
                                        <>
                                          <RefreshCw className="w-4 h-4" />
                                          <span>Generate New Practice Quiz</span>
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          
                          // No preset content, show generate button
                          return (
                            <div className="text-center py-8">
                              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                                <h4 className="font-semibold text-gray-800 mb-2">
                                  {selectedModuleData.week === 4 ? 'Practice Midterm Exam' : selectedModuleData.week === 6 ? 'Practice Final Exam' : 'Practice Quiz/Test'}
                                </h4>
                                <p className="text-gray-700 mb-4">
                                  {selectedModuleData.week === 6 
                                    ? 'Generate practice questions for the final exam covering all course content.' 
                                    : `Generate practice questions for Week ${selectedModuleData.week}.`
                                  }
                                </p>
                                <Button 
                                  onClick={() => {
                                    if (selectedModuleData.week === 6) {
                                      // Navigate to actual final exam page instead of generating practice exam
                                      window.location.href = '/final-exam';
                                    } else {
                                      generateSimpleExam(selectedModuleData.week);
                                    }
                                  }}
                                  disabled={generatingSimpleExam}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  {generatingSimpleExam ? (
                                    <>
                                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                      Generating Exam...
                                    </>
                                  ) : (
                                    <>
                                      <Play className="w-4 h-4 mr-2" />
                                      {selectedModuleData.week === 6 ? 'Go to Final Exam' : `Generate ${selectedModuleData.week === 4 ? 'Midterm' : 'Quiz'}`}
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          );
                        })()
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {(selectedModuleData.week === 6 || selectedModuleData.week === 3) && (
                <TabsContent value="study-guide" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <BookOpen className="w-5 h-5" />
                        <span>Living Study Guide</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {generatedStudyGuides[selectedModuleData.week] ? (
                        <div className="space-y-4">
                          <div className="prose max-w-none dark:prose-invert">
                            <div 
                              className="text-sm leading-relaxed text-gray-700 dark:text-gray-300"
                              dangerouslySetInnerHTML={{
                                __html: generatedStudyGuides[selectedModuleData.week]
                                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                  .replace(/\n\n/g, '</p><p>')
                                  .replace(/\n/g, '<br/>')
                                  .replace(/^(.*)/, '<p>$1')
                                  .replace(/(.*$)/, '$1</p>')
                              }}
                            />
                          </div>
                          
                          <div className="flex items-center space-x-2 pt-4 border-t">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => generateStudyGuide(selectedModuleData.week)}
                              disabled={generatingStudyGuide}
                              className="flex items-center space-x-2"
                            >
                              <RefreshCw className={`w-4 h-4 ${generatingStudyGuide ? 'animate-spin' : ''}`} />
                              <span>Regenerate</span>
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Interactive Study Guide</h3>
                          <p className="text-gray-500 mb-4">
                            Generate a comprehensive study guide for {selectedModuleData.week === 6 ? "final exam preparation" : "midterm preparation"}.
                          </p>
                          <Button 
                            onClick={() => generateStudyGuide(selectedModuleData.week)}
                            disabled={generatingStudyGuide}
                            className="flex items-center space-x-2"
                          >
                            {generatingStudyGuide ? (
                              <>
                                <Clock className="w-4 h-4 animate-spin" />
                                <span>Generating Study Guide...</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4" />
                                <span>Generate Study Guide</span>
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}