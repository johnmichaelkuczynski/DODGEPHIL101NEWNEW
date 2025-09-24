import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, X, CheckCircle, FileText } from "lucide-react";
// Removed LogicKeyboard import - using inline logic buttons
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { AIModel } from "@shared/schema";

interface TestModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  selectedModel: AIModel;
}

interface TestQuestion {
  id: number;
  type: 'multiple_choice' | 'short_answer';
  question: string;
  options?: string[];
  correct_answer?: string;
}

interface TestData {
  questions: TestQuestion[];
}

export default function TestModal({ 
  isOpen, 
  onClose, 
  selectedText, 
  selectedModel
}: TestModalProps) {
  const [currentTest, setCurrentTest] = useState<TestData | null>(null);
  const [viewMode, setViewMode] = useState<"take" | "results">("take");
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [evaluation, setEvaluation] = useState<string>("");
  const { toast } = useToast();

  const generateTestMutation = useMutation({
    mutationFn: async (data: { 
      sourceText: string; 
      model: AIModel; 
    }) => {
      const response = await fetch("/api/generate-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate test");
      }
      
      const result = await response.json();
      return result as TestData;
    },
    onSuccess: (data) => {
      console.log("Test data received:", data);
      setCurrentTest(data);
      toast({
        title: "Test Generated",
        description: "Your test is ready to take!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate test",
        variant: "destructive"
      });
    }
  });

  const evaluateTestMutation = useMutation({
    mutationFn: async (data: { 
      test: TestData;
      answers: Record<string, string>;
      model: AIModel; 
    }) => {
      const response = await fetch("/api/evaluate-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Failed to evaluate test");
      }
      
      const result = await response.json();
      return result as { evaluation: string };
    },
    onSuccess: (data) => {
      setEvaluation(data.evaluation);
      setViewMode("results");
      toast({
        title: "Test Evaluated",
        description: "Your results are ready!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to evaluate test",
        variant: "destructive"
      });
    }
  });

  const handleGenerateTest = () => {
    generateTestMutation.mutate({
      sourceText: selectedText,
      model: selectedModel
    });
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmitTest = () => {
    if (!currentTest?.questions) return;
    
    evaluateTestMutation.mutate({
      test: currentTest,
      answers: userAnswers,
      model: selectedModel
    });
  };

  const handleClose = () => {
    setCurrentTest(null);
    setUserAnswers({});
    setEvaluation("");
    onClose();
  };

  // Auto-generate test when modal opens
  useEffect(() => {
    if (isOpen && !currentTest && !generateTestMutation.isPending) {
      handleGenerateTest();
    }
  }, [isOpen]);

  const isTestComplete = currentTest?.questions ? 
    currentTest.questions.every(q => userAnswers[q.id.toString()]) : false;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Test Me</span>
            </span>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1">
          {generateTestMutation.isPending && (
            <div className="space-y-6 p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Generating Test</h3>
                <p className="text-muted-foreground mb-6">
                  Creating a 5-question test (3 multiple choice, 2 short answer) based on your selected text...
                </p>
                <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-500" />
              </div>
            </div>
          )}

          {!generateTestMutation.isPending && currentTest?.questions && (
            <div className="space-y-6 p-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold">Take Your Test</h3>
                <p className="text-muted-foreground">Answer all 5 questions to get your evaluation</p>
              </div>

              {currentTest.questions?.map((question, index) => (
                <div key={question.id} className="border rounded-lg p-4 space-y-4">
                  <div className="font-medium">
                    Question {index + 1} of 5 ({question.type === 'multiple_choice' ? 'Multiple Choice' : 'Short Answer'})
                  </div>
                  <div className="text-sm text-muted-foreground mb-3">
                    {question.question}
                  </div>

                  {question.type === 'multiple_choice' && question.options ? (
                    <RadioGroup
                      value={userAnswers[question.id.toString()] || ""}
                      onValueChange={(value) => handleAnswerChange(question.id.toString(), value)}
                    >
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`q${question.id}-${optionIndex}`} />
                          <Label htmlFor={`q${question.id}-${optionIndex}`} className="text-sm">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Enter your answer here..."
                        value={userAnswers[question.id.toString()] || ""}
                        onChange={(e) => handleAnswerChange(question.id.toString(), e.target.value)}
                        className="min-h-[100px]"
                      />
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <div className="text-xs text-muted-foreground mb-2">Logic Symbols:</div>
                        <div className="flex flex-wrap gap-1">
                          {[
                            { symbol: "¬", name: "not" },
                            { symbol: "∧", name: "and" },
                            { symbol: "∨", name: "or" },
                            { symbol: "→", name: "if...then" },
                            { symbol: "↔", name: "if and only if" },
                            { symbol: "∀", name: "for all" },
                            { symbol: "∃", name: "there exists" },
                            { symbol: "⊤", name: "true" },
                            { symbol: "⊥", name: "false" }
                          ].map((item) => (
                            <Button
                              key={item.symbol}
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-sm"
                              onClick={() => {
                                const currentAnswer = userAnswers[question.id.toString()] || "";
                                handleAnswerChange(question.id.toString(), currentAnswer + item.symbol);
                              }}
                              title={item.name}
                            >
                              {item.symbol}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <div className="flex justify-center pt-6">
                <Button 
                  onClick={handleSubmitTest}
                  disabled={!isTestComplete || evaluateTestMutation.isPending}
                  className="w-full max-w-md"
                >
                  {evaluateTestMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Evaluating...
                    </>
                  ) : (
                    "Submit Test"
                  )}
                </Button>
              </div>
            </div>
          )}

          {viewMode === "results" && (
            <div className="space-y-6 p-6">
              <div className="text-center mb-6">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Test Results</h3>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <h4 className="font-medium mb-4">Evaluation</h4>
                <div className="prose prose-sm max-w-none text-slate-700 dark:text-slate-300">
                  {evaluation.split('\n').map((line, index) => {
                    // Extract score if it contains "Score:"
                    if (line.toLowerCase().includes('score:')) {
                      const scoreMatch = line.match(/score:\s*(\d+(?:\.\d+)?)\s*(?:out of|\/)\s*(\d+(?:\.\d+)?)/i);
                      if (scoreMatch) {
                        return (
                          <div key={index} className="text-center mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              YOUR SCORE: {scoreMatch[1]} out of {scoreMatch[2]} points
                            </div>
                          </div>
                        );
                      }
                    }
                    // Remove markdown formatting and replace "student" with "you"
                    const cleanLine = line.replace(/\*\*/g, '').replace(/[Ss]tudent/g, 'You');
                    return cleanLine.trim() ? (
                      <p key={index} className="mb-2">{cleanLine}</p>
                    ) : null;
                  })}
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <Button 
                  onClick={() => {
                    setCurrentTest(null);
                    setUserAnswers({});
                    setEvaluation("");
                    handleGenerateTest();
                  }}
                  variant="outline"
                >
                  Generate New Test
                </Button>
                <Button onClick={handleClose}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}