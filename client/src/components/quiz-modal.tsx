import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Download, Eye, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { AIModel } from "@shared/schema";

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceText: string;
  chunkIndex?: number | null;
  selectedModel: AIModel;
}

interface QuizResult {
  id: number;
  testContent: string;
  answerKey?: string;
  timestamp: Date;
}

export default function QuizModal({ isOpen, onClose, sourceText, chunkIndex, selectedModel }: QuizModalProps) {
  const [instructions, setInstructions] = useState("Create a comprehensive test with multiple choice questions, short answer questions, and essay questions based on the philosophical concepts and definitions in the selected text.");
  const [includeAnswerKey, setIncludeAnswerKey] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<QuizResult | null>(null);
  const [showFullText, setShowFullText] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateQuizMutation = useMutation({
    mutationFn: async (data: {
      sourceText: string;
      instructions: string;
      model: AIModel;
      includeAnswerKey: boolean;
      chunkIndex?: number | null;
    }) => {
      const response = await apiRequest("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate quiz");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Handle the API response structure
      const quiz = data.quiz || data;
      setCurrentQuiz(quiz);
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
      toast({
        title: "Test Created",
        description: "Your custom test has been generated successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate test",
        variant: "destructive",
      });
    }
  });

  const handleGenerate = () => {
    const data: any = {
      sourceText,
      instructions,
      model: selectedModel,
      includeAnswerKey,
    };
    
    // Only include chunkIndex if it's not null
    if (chunkIndex !== null && chunkIndex !== undefined) {
      data.chunkIndex = chunkIndex;
    }
    
    generateQuizMutation.mutate(data);
  };

  const handleDownloadTxt = () => {
    if (!currentQuiz || !currentQuiz.testContent) return;
    
    let content = `Test - Generated on ${new Date(currentQuiz.timestamp).toLocaleString()}\n\n`;
    content += `Instructions: ${instructions}\n\n`;
    content += `${currentQuiz.testContent}\n\n`;
    
    if (currentQuiz.answerKey) {
      content += `ANSWER KEY:\n${currentQuiz.answerKey}`;
    }
    
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `test_${currentQuiz.id}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrintPdf = () => {
    if (!currentQuiz || !currentQuiz.testContent) return;
    
    let content = `
      <html>
        <head>
          <title>Test - ${new Date(currentQuiz.timestamp).toLocaleDateString()}</title>
          <style>
            body { font-family: Georgia, serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px; }
            h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .meta { background: #f5f5f5; padding: 15px; margin: 20px 0; border-left: 4px solid #333; }
            .section { margin: 30px 0; }
            .content { white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <h1>Custom Test</h1>
          <div class="meta">
            <strong>Generated:</strong> ${new Date(currentQuiz.timestamp).toLocaleString()}<br>
            <strong>Instructions:</strong> ${instructions}
          </div>
          <div class="section">
            <div class="content">${currentQuiz.testContent}</div>
          </div>
          ${currentQuiz.answerKey ? `
          <div class="section">
            <h2>Answer Key</h2>
            <div class="content">${currentQuiz.answerKey}</div>
          </div>
          ` : ''}
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const resetForm = () => {
    setCurrentQuiz(null);
    setInstructions("Create a comprehensive test with multiple choice questions, short answer questions, and essay questions based on the philosophical concepts and definitions in the selected text.");
    setIncludeAnswerKey(false);
    setShowFullText(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Create Custom Test
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 flex gap-6 overflow-hidden">
            {/* Left side - Form */}
            <div className="w-1/2 flex flex-col gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-sm font-medium text-blue-900 mb-2">Selected Text Preview</div>
                <div className="text-xs text-blue-700 max-h-20 overflow-y-auto">
                  {sourceText.substring(0, 200)}...
                </div>
                {chunkIndex !== null && chunkIndex !== undefined && (
                  <div className="text-xs text-blue-600 mt-1">
                    Chunk {chunkIndex + 1}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Test Instructions</Label>
                <Textarea
                  id="instructions"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Describe what kind of test you want to create..."
                  className="min-h-[120px] resize-none"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="answer-key"
                  checked={includeAnswerKey}
                  onCheckedChange={setIncludeAnswerKey}
                />
                <Label htmlFor="answer-key">Include Answer Key</Label>
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={handleGenerate}
                  disabled={generateQuizMutation.isPending || !instructions.trim()}
                  className="w-full"
                >
                  {generateQuizMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Test...
                    </>
                  ) : (
                    "Generate Test"
                  )}
                </Button>

                {currentQuiz && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadTxt}
                        className="flex-1"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download TXT
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrintPdf}
                        className="flex-1"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Print/PDF
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFullText(true)}
                      className="w-full"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Full Test
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetForm}
                      className="w-full"
                    >
                      Create Another Test
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Right side - Preview */}
            <div className="w-1/2 border-l pl-6">
              <div className="font-medium mb-3">Test Preview</div>
              <ScrollArea className="h-full">
                {currentQuiz && currentQuiz.testContent ? (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      <div className="font-medium">Generated on:</div>
                      <div>{new Date(currentQuiz.timestamp).toLocaleString()}</div>
                    </div>
                    
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {currentQuiz.testContent.substring(0, 1000)}
                      {currentQuiz.testContent.length > 1000 && "..."}
                    </div>
                    
                    {currentQuiz.answerKey && (
                      <div className="border-t pt-4">
                        <div className="font-medium mb-2">Answer Key Preview:</div>
                        <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
                          {currentQuiz.answerKey.substring(0, 500)}
                          {currentQuiz.answerKey.length > 500 && "..."}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500 text-center py-8">
                    Configure your test settings and click "Generate Test" to see a preview
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Full Text Viewer Modal */}
      {showFullText && currentQuiz && currentQuiz.testContent && (
        <Dialog open={showFullText} onOpenChange={() => setShowFullText(false)}>
          <DialogContent className="max-w-5xl h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                Complete Test
                <Button variant="ghost" size="sm" onClick={() => setShowFullText(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </DialogTitle>
            </DialogHeader>
            
            <div className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto">
                <div className="bg-gray-50 p-4 rounded mb-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Generated:</span> {new Date(currentQuiz.timestamp).toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Instructions:</span> {instructions}
                    </div>
                  </div>
                </div>
                
                <div className="whitespace-pre-wrap leading-relaxed">
                  {currentQuiz.testContent}
                </div>
                
                {currentQuiz.answerKey && (
                  <div className="mt-8 pt-8 border-t">
                    <h2 className="text-xl font-bold mb-4">Answer Key</h2>
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {currentQuiz.answerKey}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button onClick={handleDownloadTxt} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download TXT
              </Button>
              <Button onClick={handlePrintPdf} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Print/PDF
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}