import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText, Printer, X, Loader2, BookOpen, Trophy, CheckCircle, RotateCcw } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { copyToClipboard, downloadPDF } from "@/lib/export-utils";
import { renderMathInElement } from "@/lib/math-renderer";
import LogicKeyboard from "./logic-keyboard";
import type { AIModel, StudentTest } from "@shared/schema";

interface StudentTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  selectedModel: AIModel;
  mathMode?: boolean;
  chunkIndex?: number;
}

export default function StudentTestModal({ 
  isOpen, 
  onClose, 
  selectedText, 
  selectedModel,
  mathMode = true,
  chunkIndex 
}: StudentTestModalProps) {
  const [customInstructions, setCustomInstructions] = useState("");
  const [currentStudentTest, setCurrentStudentTest] = useState<StudentTest | null>(null);
  const [showFullText, setShowFullText] = useState(false);
  const [viewMode, setViewMode] = useState<"generate" | "take" | "results">("generate");
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [testAnswers, setTestAnswers] = useState<Record<string, string>>({});
  const [testResult, setTestResult] = useState<any>(null);
  const [parsedQuestions, setParsedQuestions] = useState<any[]>([]);
  const [questionTypes, setQuestionTypes] = useState<string[]>(["multiple_choice"]);
  const [questionCount, setQuestionCount] = useState<number>(15);
  const [showLogicKeyboard, setShowLogicKeyboard] = useState(false);
  const [activeTextAreaId, setActiveTextAreaId] = useState<string>("");
  const { toast } = useToast();

  const studentTestMutation = useMutation({
    mutationFn: async (data: { 
      sourceText: string; 
      instructions?: string; 
      model: AIModel; 
      chunkIndex?: number;
      questionTypes?: string[];
      questionCount?: number;
    }) => {
      const response = await apiRequest("/api/generate-student-test", {
        method: "POST",
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentStudentTest(data.studentTest);
      const testContent = (data.studentTest as any).testContent || data.studentTest.test;
      const questions = parseTestContent(testContent);
      setParsedQuestions(questions);
      toast({ title: "Student test generated successfully!" });
    },
    onError: (error) => {
      toast({
        title: "Error generating student test",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const submitTestMutation = useMutation({
    mutationFn: async (data: { 
      studentTestId: number; 
      userAnswers: Record<string, string>;
      questionTypes?: Record<string, string>;
    }) => {
      const response = await apiRequest("/api/submit-test", {
        method: "POST",
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: (data) => {
      setTestResult(data.testResult);
      setViewMode("results");
      toast({ title: "Test submitted and graded successfully!" });
    },
    onError: (error) => {
      toast({
        title: "Error submitting test",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Parse test content into structured questions with type detection
  const parseTestContent = (content: string) => {
    console.log("Parsing test content:", content);
    
    try {
      // First try to parse as JSON (new format)
      const parsed = JSON.parse(content);
      if (parsed && parsed.questions && Array.isArray(parsed.questions)) {
        console.log("Parsed JSON format test with", parsed.questions.length, "questions");
        
        // Convert JSON format to internal format
        const questions = parsed.questions.map((q: any, index: number) => ({
          number: (index + 1).toString(),
          text: q.question,
          type: q.type === "text_input" ? "short_answer" : q.type,
          options: q.options || [],
          correctAnswer: q.correctAnswer,
          points: q.points || 1
        }));
        
        console.log("Final parsed questions:", questions.length, questions.map((q: any) => ({ 
          number: q.number, 
          type: q.type,
          text: q.text.substring(0, 50) + "...",
          optionCount: q.options ? q.options.length : 0 
        })));
        
        return questions;
      }
    } catch (e) {
      console.log("Not JSON format, falling back to text parsing");
    }
    
    // Fallback to old text parsing for legacy format
    const questions: any[] = [];
    
    // Remove answer key before parsing
    const cleanContent = removeAnswerKey(content);
    
    // Split content into lines and clean up
    const lines = cleanContent.split('\n').map(l => l.trim()).filter(l => l);
    let i = 0;
    let questionCounter = 1;
    
    while (i < lines.length) {
      const line = lines[i];
      
      // Check for [SHORT_ANSWER] or [LONG_ANSWER] tags first
      if (line.includes('[SHORT_ANSWER]') || line.includes('[LONG_ANSWER]')) {
        const questionType = line.includes('[SHORT_ANSWER]') ? "short_answer" : "long_answer";
        let cleanText = line.replace(/\[SHORT_ANSWER\]|\[LONG_ANSWER\]/g, '').trim();
        
        // If the tag was on a line by itself, the question is on the next line
        if (!cleanText && i + 1 < lines.length) {
          i++;
          cleanText = lines[i];
        }
        
        if (cleanText) {
          const questionObj = {
            number: questionCounter.toString(),
            text: cleanText,
            type: questionType,
            options: []
          };
          
          questions.push(questionObj);
          console.log("Found question:", { 
            number: questionCounter.toString(), 
            type: questionType,
            text: cleanText.substring(0, 50) + "...", 
            optionCount: 0 
          });
          
          questionCounter++;
        }
        i++;
        continue;
      }
      
      // Look for traditional numbered questions (1. 2. etc.) OR questions ending with ?
      const numberedMatch = line.match(/^(\d+)\.\s*(.+)/);
      const questionMatch = line.match(/^(.+\?)\s*$/);
      
      if (numberedMatch || questionMatch) {
        const questionNumber = numberedMatch ? numberedMatch[1] : questionCounter.toString();
        const questionText = numberedMatch ? numberedMatch[2] : (questionMatch ? questionMatch[1] : '');
        
        // Determine question type - check if next lines have A) B) C) D) options
        let questionType = "multiple_choice";
        let hasOptions = false;
        for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
          if (lines[j] && lines[j].trim().match(/^[A-D]\)/)) {
            hasOptions = true;
            break;
          }
        }
        if (!hasOptions) {
          questionType = "short_answer"; // assume short answer if no multiple choice options
        }
        
        const options: any[] = [];
        i++; // Move to next line to look for options
        
        if (questionType === "multiple_choice") {
          // Collect consecutive option lines (A) B) C) D))
          while (i < lines.length) {
            const optionLine = lines[i];
            if (!optionLine) {
              i++;
              continue;
            }
            
            const optionMatch = optionLine.match(/^([A-D])\)\s*(.+)/);
            
            if (optionMatch) {
              options.push({
                letter: optionMatch[1],
                text: optionMatch[2]
              });
              i++;
            } else {
              // No more options for this question, stop collecting
              break;
            }
          }
        }
        
        // Add question with type information
        const questionObj = {
          number: questionNumber,
          text: questionText,
          type: questionType,
          options: options
        };
        
        questions.push(questionObj);
        console.log("Found question:", { 
          number: questionNumber, 
          type: questionType,
          text: questionText.substring(0, 50) + "...", 
          optionCount: options.length 
        });
        
        questionCounter++;
      } else {
        i++; // Move to next line if current line is not a question
      }
    }
    
    console.log("Final parsed questions:", questions.length, questions.map(q => ({ 
      number: q.number, 
      type: q.type,
      text: q.text.substring(0, 50) + "...",
      optionCount: q.options ? q.options.length : 0 
    })));
    
    return questions;
  };

  const handleGenerateTest = () => {
    // Reset state for fresh test generation
    setViewMode("generate");
    setUserAnswers({});
    setTestResult(null);
    setParsedQuestions([]);
    
    const requestData: any = {
      sourceText: selectedText,
      instructions: customInstructions.trim() || undefined,
      model: selectedModel,
      questionTypes,
      questionCount
    };
    
    // Only include chunkIndex if it's a valid number
    if (typeof chunkIndex === 'number') {
      requestData.chunkIndex = chunkIndex;
    }
    
    studentTestMutation.mutate(requestData);
  };

  const handleDownloadTxt = () => {
    if (!currentStudentTest) return;
    
    const timestamp = new Date().toLocaleString();
    const content = `STUDENT PRACTICE TEST
Generated: ${timestamp}
Model: ${selectedModel}
Instructions: ${customInstructions || "Default instructions"}

${currentStudentTest.testContent}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student-test-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({ title: "Student test downloaded as TXT" });
  };

  const handlePrintPDF = () => {
    if (!currentStudentTest) return;
    
    const timestamp = new Date().toLocaleString();
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({ title: "Popup blocked. Please allow popups for printing.", variant: "destructive" });
      return;
    }

    let processedContent = (currentStudentTest as any).testContent || currentStudentTest.test
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Student Practice Test</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
        <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js"></script>
        <style>
          @page { margin: 1in; size: letter; }
          body { font-family: Georgia, serif; font-size: 12pt; line-height: 1.6; color: #333; }
          .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
          .title { font-size: 18pt; font-weight: bold; margin: 0; }
          .subtitle { font-size: 14pt; margin: 5px 0; }
          .meta { font-size: 10pt; color: #666; margin: 5px 0; }
          .content { text-align: justify; }
          .katex { font-size: 1em !important; }
          .katex-display { margin: 1em 0 !important; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">Student Practice Test</h1>
          <p class="subtitle">Cardinality of Proof Spaces</p>
          <p class="meta">Generated: ${timestamp}</p>
          <p class="meta">Model: ${selectedModel}</p>
          <p class="meta">Instructions: ${customInstructions || "Default instructions"}</p>
        </div>
        <div class="content" id="math-content">${processedContent}</div>
        <script>
          document.addEventListener("DOMContentLoaded", function() {
            renderMathInElement(document.getElementById('math-content'), {
              delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '$', right: '$', display: false}
              ],
              throwOnError: false
            });
            setTimeout(() => window.print(), 500);
          });
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleCopy = async () => {
    if (!currentStudentTest) return;
    
    const success = await copyToClipboard(currentStudentTest.testContent);
    if (success) {
      toast({ title: "Student test copied to clipboard" });
    } else {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  // Process content for math mode
  const processContentForMathMode = (content: string) => {
    if (!mathMode) {
      return content
        .replace(/\$\$([^$]+)\$\$/g, '$1')
        .replace(/\$([^$]+)\$/g, '$1')
        .replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)')
        .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
        .replace(/\\text\{([^}]+)\}/g, '$1')
        .replace(/\\mathbb\{([^}]+)\}/g, '$1')
        .replace(/\\forall/g, 'for all')
        .replace(/\\Rightarrow/g, 'implies')
        .replace(/\\ldots/g, '...')
        .replace(/\\times/g, '×');
    }
    return content;
  };

  // Remove answer key from test content to prevent cheating
  const removeAnswerKey = (content: string) => {
    // Remove everything after "ANSWER KEY:" or similar patterns
    const answerKeyPatterns = [
      /ANSWER\s*KEY\s*:[\s\S]*$/i,
      /ANSWERS?\s*:[\s\S]*$/i,
      /CORRECT\s*ANSWERS?\s*:[\s\S]*$/i,
      /SOLUTION\s*:[\s\S]*$/i
    ];
    
    let cleanContent = content;
    for (const pattern of answerKeyPatterns) {
      cleanContent = cleanContent.replace(pattern, '');
    }
    
    return cleanContent.trim();
  };

  const renderContent = (content: string) => {
    const processedContent = processContentForMathMode(content);
    
    if (mathMode) {
      // Process LaTeX math notation
      let mathProcessedContent = processedContent;
      mathProcessedContent = mathProcessedContent.replace(/\$\$([^$]+)\$\$/g, (match, latex) => {
        // Note: renderMathInElement is for DOM processing, not HTML generation
        const katexHtml = `$$${latex}$$`;
        return `<div class="katex-display">${katexHtml}</div>`;
      });
      mathProcessedContent = mathProcessedContent.replace(/\$([^$]+)\$/g, (match, latex) => {
        // Note: renderMathInElement is for DOM processing, not HTML generation  
        const katexHtml = `$${latex}$`;
        return `<span class="katex-inline">${katexHtml}</span>`;
      });
      
      return {
        __html: mathProcessedContent
          .replace(/\n\n/g, '<br/><br/>')
          .replace(/\n/g, '<br/>')
      };
    }
    
    return {
      __html: processedContent
        .replace(/\n\n/g, '<br/><br/>')
        .replace(/\n/g, '<br/>')
    };
  };

  const handleTakeTest = () => {
    setViewMode("take");
    setUserAnswers({});
  };

  const handleSubmitTest = () => {
    if (!currentStudentTest) return;
    
    // Extract question types from parsed questions for grading
    const questionTypeMap: Record<string, string> = {};
    parsedQuestions.forEach((q, index) => {
      const questionNumber = (index + 1).toString();
      if (q.type) {
        questionTypeMap[questionNumber] = q.type;
      }
    });
    
    submitTestMutation.mutate({
      studentTestId: currentStudentTest.id,
      userAnswers: userAnswers,
      questionTypes: questionTypeMap
    });
  };

  const handleAnswerSelect = (questionNumber: string, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionNumber]: answer
    }));
  };

  const handleSymbolInsert = (symbol: string) => {
    if (!activeTextAreaId) return;
    
    const textArea = document.getElementById(activeTextAreaId) as HTMLTextAreaElement;
    if (!textArea) return;
    
    const start = textArea.selectionStart;
    const end = textArea.selectionEnd;
    const currentValue = textArea.value;
    const newValue = currentValue.substring(0, start) + symbol + currentValue.substring(end);
    
    // Update the answer value
    const questionNumber = activeTextAreaId.replace('textarea-', '').replace('long-', '');
    setUserAnswers(prev => ({
      ...prev,
      [questionNumber]: newValue
    }));
    
    // Focus and set cursor position after the inserted symbol
    setTimeout(() => {
      textArea.focus();
      textArea.setSelectionRange(start + symbol.length, start + symbol.length);
    }, 0);
  };

  const openLogicKeyboard = (textAreaId: string) => {
    setActiveTextAreaId(textAreaId);
    setShowLogicKeyboard(true);
  };

  const resetTest = () => {
    // Reset state only - do NOT auto-generate
    setViewMode("generate");
    setCurrentStudentTest(null);
    setUserAnswers({});
    setTestResult(null);
    setParsedQuestions([]);
    setShowLogicKeyboard(false);
    setActiveTextAreaId("");
  };

  // Reset state when modal opens but don't auto-generate
  useEffect(() => {
    if (isOpen) {
      setViewMode("generate");
      setCurrentStudentTest(null);
      setUserAnswers({});
      setTestResult(null);
      setParsedQuestions([]);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl font-bold">
            <FileText className="mr-2 h-5 w-5 text-purple-600" />
            Test Me - Student Practice Test
          </DialogTitle>
        </DialogHeader>
        
        {/* View Mode: Generate Test */}
        {viewMode === "generate" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Left Column - Instructions */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Question Types</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="multiple_choice"
                      checked={questionTypes.includes("multiple_choice")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setQuestionTypes([...questionTypes, "multiple_choice"]);
                        } else {
                          setQuestionTypes(questionTypes.filter(t => t !== "multiple_choice"));
                        }
                      }}
                    />
                    <Label htmlFor="multiple_choice">Multiple Choice</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="short_answer"
                      checked={questionTypes.includes("short_answer")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setQuestionTypes([...questionTypes, "short_answer"]);
                        } else {
                          setQuestionTypes(questionTypes.filter(t => t !== "short_answer"));
                        }
                      }}
                    />
                    <Label htmlFor="short_answer">Short Answer (1-3 sentences)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="long_answer"
                      checked={questionTypes.includes("long_answer")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setQuestionTypes([...questionTypes, "long_answer"]);
                        } else {
                          setQuestionTypes(questionTypes.filter(t => t !== "long_answer"));
                        }
                      }}
                    />
                    <Label htmlFor="long_answer">Long Answer (paragraph)</Label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Number of Questions</h3>
                <Select value={questionCount.toString()} onValueChange={(value) => setQuestionCount(parseInt(value))}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 Questions</SelectItem>
                    <SelectItem value="10">10 Questions</SelectItem>
                    <SelectItem value="15">15 Questions</SelectItem>
                    <SelectItem value="20">20 Questions</SelectItem>
                    <SelectItem value="25">25 Questions</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Custom Instructions (Optional)</h3>
                <Textarea
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="e.g., 'Focus on logical reasoning, moderate difficulty, include practical examples'"
                  className="min-h-[100px]"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Specify difficulty level, topics to focus on, or other requirements.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Selected Text Preview</h3>
                <ScrollArea className="h-[200px] w-full border rounded-md p-3">
                  <p className="text-sm whitespace-pre-wrap">{selectedText.substring(0, 500)}...</p>
                </ScrollArea>
              </div>
              
              <Button 
                onClick={handleGenerateTest}
                disabled={studentTestMutation.isPending}
                className="w-full"
              >
                {studentTestMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Test...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Practice Test
                  </>
                )}
              </Button>
            </div>
            
            {/* Right Column - Generated Test */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Generated Practice Test</h3>
                {currentStudentTest && (
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleGenerateTest}
                      disabled={studentTestMutation.isPending}
                    >
                      {studentTestMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Generate New Test
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleTakeTest}>
                      <BookOpen className="h-4 w-4 mr-1" />
                      Take Test
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownloadTxt}>
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                )}
              </div>
              
              <ScrollArea className="h-[400px] w-full border rounded-md p-4">
                {currentStudentTest ? (
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg">Practice Final Exam</h3>
                    <p className="text-sm text-muted-foreground">Complete all questions covering comprehensive symbolic logic material. Show your work clearly.</p>
                    
                    <div className="space-y-6 mt-4">
                      {parsedQuestions.map((question, index) => (
                        <div key={index} className="space-y-2">
                          <h4 className="font-semibold">
                            {question.number}. {question.text}
                            <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                              {question.type === "multiple_choice" ? "Multiple Choice" : 
                               question.type === "short_answer" ? "Text Input" : "Long Answer"}
                              {question.points && ` (${question.points} pts)`}
                            </span>
                          </h4>
                          
                          {/* Show multiple choice options */}
                          {question.type === "multiple_choice" && question.options && question.options.length > 0 && (
                            <div className="ml-4 space-y-1">
                              {question.options.map((option: string, optIndex: number) => (
                                <div key={optIndex} className="text-sm">
                                  {String.fromCharCode(65 + optIndex)}) {option}
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Show answer field for text inputs */}
                          {(question.type === "short_answer" || question.type === "text_input") && (
                            <div className="ml-4 space-y-2">
                              <label className="text-sm font-medium text-gray-700">Your Answer:</label>
                              <Textarea
                                placeholder="Type your answer here..."
                                className="min-h-[100px] w-full"
                                value={testAnswers[`q${index + 1}`] || ''}
                                onChange={(e) => setTestAnswers(prev => ({ ...prev, [`q${index + 1}`]: e.target.value }))}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* Submit button for Practice Final */}
                    <div className="mt-6 pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">
                          {Object.keys(testAnswers).length} of {parsedQuestions.filter(q => q.type === "short_answer" || q.type === "text_input").length} text questions answered
                        </p>
                        <Button 
                          onClick={() => {
                            // Switch to take mode to use existing submit functionality
                            setUserAnswers(testAnswers);
                            setViewMode("take");
                          }}
                          disabled={Object.keys(testAnswers).length === 0}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Trophy className="mr-2 h-4 w-4" />
                          Submit Practice Final
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Generate a practice test to see it here</p>
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        )}

        {/* View Mode: Take Test */}
        {viewMode === "take" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Take Your Practice Test</h3>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleGenerateTest}
                  disabled={studentTestMutation.isPending}
                >
                  {studentTestMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Generate New Test
                    </>
                  )}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setViewMode("generate")}>
                  Back to Test
                </Button>
              </div>
            </div>
            
            <ScrollArea className="h-[500px] w-full border rounded-md p-4">
              <div className="space-y-6">
                {parsedQuestions.map((question, index) => (
                  <div key={index} className="space-y-3">
                    <h4 className="font-semibold text-lg">
                      {question.number}. {question.text}
                      <span className="ml-2 px-2 py-1 text-xs bg-gray-100 rounded">
                        {question.type === "multiple_choice" ? "Multiple Choice" : 
                         question.type === "short_answer" ? "Short Answer" : "Long Answer"}
                      </span>
                    </h4>
                    
                    {/* Multiple Choice Questions */}
                    {question.type === "multiple_choice" && question.options && question.options.length > 0 && (
                      <RadioGroup
                        value={userAnswers[question.number] || ""}
                        onValueChange={(value) => handleAnswerSelect(question.number, value)}
                      >
                        {question.options.map((option: string, optIndex: number) => {
                          const optionLetter = String.fromCharCode(65 + optIndex); // A, B, C, D
                          return (
                            <div key={optIndex} className="flex items-center space-x-2">
                              <RadioGroupItem value={optionLetter} id={`q${question.number}-${optionLetter}`} />
                              <Label htmlFor={`q${question.number}-${optionLetter}`} className="cursor-pointer">
                                {optionLetter}) {option}
                              </Label>
                            </div>
                          );
                        })}
                      </RadioGroup>
                    )}
                    
                    {/* Short Answer / Text Input Questions */}
                    {(question.type === "short_answer" || question.type === "text_input") && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Your answer:</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => openLogicKeyboard(`textarea-${question.number}`)}
                            className="text-xs"
                          >
                            🔣 Logic Symbols
                          </Button>
                        </div>
                        <Textarea
                          id={`textarea-${question.number}`}
                          value={userAnswers[question.number] || ""}
                          onChange={(e) => handleAnswerSelect(question.number, e.target.value)}
                          placeholder="Enter your answer (use the Logic Symbols button for ¬ ∧ ∨ → ↔ symbols)..."
                          className="min-h-[80px]"
                          onFocus={() => setActiveTextAreaId(`textarea-${question.number}`)}
                        />
                      </div>
                    )}
                    
                    {/* Long Answer Questions */}
                    {question.type === "long_answer" && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Your detailed answer:</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => openLogicKeyboard(`textarea-long-${question.number}`)}
                            className="text-xs"
                          >
                            🔣 Logic Symbols
                          </Button>
                        </div>
                        <Textarea
                          id={`textarea-long-${question.number}`}
                          value={userAnswers[question.number] || ""}
                          onChange={(e) => handleAnswerSelect(question.number, e.target.value)}
                          placeholder="Enter your detailed answer (use Logic Symbols button for ¬ ∧ ∨ → ↔ symbols)..."
                          className="min-h-[150px]"
                          onFocus={() => setActiveTextAreaId(`textarea-long-${question.number}`)}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {Object.keys(userAnswers).length} of {parsedQuestions.length} questions answered
              </p>
              <Button 
                onClick={handleSubmitTest}
                disabled={submitTestMutation.isPending || Object.keys(userAnswers).length === 0}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {submitTestMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Grading...
                  </>
                ) : (
                  <>
                    <Trophy className="mr-2 h-4 w-4" />
                    Submit & Grade Test
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* View Mode: Results */}
        {viewMode === "results" && testResult && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Test Results</h3>
              <Button variant="outline" size="sm" onClick={resetTest} disabled={studentTestMutation.isPending}>
                {studentTestMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Take New Test
                  </>
                )}
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <Trophy className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="text-2xl font-bold text-blue-600">{testResult.score}%</p>
                <p className="text-sm text-blue-600">Final Score</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p className="text-2xl font-bold text-green-600">{testResult.correctCount}</p>
                <p className="text-sm text-green-600">Correct Answers</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <FileText className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                <p className="text-2xl font-bold text-gray-600">{testResult.totalQuestions}</p>
                <p className="text-sm text-gray-600">Total Questions</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Question Review</h4>
              <ScrollArea className="h-[400px] w-full border rounded-md p-4">
                <div className="space-y-4">
                  {parsedQuestions.map((question, index) => {
                    const userAnswer = testResult.userAnswers[question.number];
                    const correctAnswer = testResult.correctAnswers[question.number];
                    const isCorrect = userAnswer === correctAnswer;
                    
                    return (
                      <div key={index} className={`p-4 rounded-lg border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex items-start justify-between">
                          <h5 className="font-semibold">{question.number}. {question.text}</h5>
                          {isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                          ) : (
                            <X className="h-5 w-5 text-red-600 mt-1" />
                          )}
                        </div>
                        
                        <div className="mt-2 space-y-1">
                          <p className="text-sm">
                            <span className="font-medium">Your answer:</span> {
                              userAnswer ? (
                                (() => {
                                  const option = question.options.find((opt: any) => opt.letter === userAnswer);
                                  return option ? `${userAnswer}) ${option.text}` : userAnswer;
                                })()
                              ) : "Not answered"
                            }
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Correct answer:</span> {
                              correctAnswer ? (
                                (() => {
                                  if (question.type === "multiple_choice" && question.options && question.options.length > 0) {
                                    // For multiple choice, find the option by letter
                                    const option = question.options.find((opt: any, idx: number) => String.fromCharCode(65 + idx) === correctAnswer);
                                    return option ? `${correctAnswer}) ${option}` : correctAnswer;
                                  } else {
                                    // For text input, show the answer directly
                                    return correctAnswer;
                                  }
                                })()
                              ) : "Answer not provided"
                            }
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}
      </DialogContent>
      
      {/* Logic Keyboard */}
      <LogicKeyboard
        isOpen={showLogicKeyboard}
        onClose={() => setShowLogicKeyboard(false)}
        onSymbolInsert={handleSymbolInsert}
      />
    </Dialog>
  );
}