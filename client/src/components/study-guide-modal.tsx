import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Download, FileText, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { AIModel } from "@shared/schema";

interface StudyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceText: string;
  chunkIndex?: number | null;
  selectedModel: AIModel;
}

interface StudyGuideResult {
  id: number;
  guideContent: string;
  timestamp: Date;
}

export default function StudyGuideModal({ isOpen, onClose, sourceText, chunkIndex, selectedModel }: StudyGuideModalProps) {
  const [instructions, setInstructions] = useState("Create a comprehensive study guide with key concepts, definitions, important arguments, main themes, and essential points to understand from the philosophical content. Include clear explanations and organize the material for effective learning.");
  const [currentStudyGuide, setCurrentStudyGuide] = useState<StudyGuideResult | null>(null);
  const [showFullText, setShowFullText] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateStudyGuideMutation = useMutation({
    mutationFn: async (data: {
      sourceText: string;
      instructions: string;
      model: AIModel;
      chunkIndex?: number | null;
    }) => {
      const requestData: any = {
        sourceText: data.sourceText,
        instructions: data.instructions,
        model: data.model,
      };
      
      // Only include chunkIndex if it's not null
      if (data.chunkIndex !== null && data.chunkIndex !== undefined) {
        requestData.chunkIndex = data.chunkIndex;
      }
      
      const response = await apiRequest("/api/generate-study-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate study guide");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Handle the API response structure
      const studyGuide = data.studyGuide || data;
      setCurrentStudyGuide(studyGuide);
      queryClient.invalidateQueries({ queryKey: ["/api/study-guides"] });
      toast({
        title: "Study Guide Created",
        description: "Your custom study guide has been generated successfully!",
      });
    },
    onError: (error) => {
      console.error("Study guide generation error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate study guide",
        variant: "destructive",
      });
    }
  });

  const handleGenerate = () => {
    generateStudyGuideMutation.mutate({
      sourceText,
      instructions,
      model: selectedModel,
      chunkIndex
    });
  };

  const handleDownloadTxt = () => {
    if (!currentStudyGuide) return;
    
    let content = `Study Guide - Generated on ${new Date(currentStudyGuide.timestamp).toLocaleString()}\n\n`;
    content += `Instructions: ${instructions}\n\n`;
    content += `${currentStudyGuide.guideContent}\n\n`;
    
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `study_guide_${currentStudyGuide.id}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrintPdf = () => {
    if (!currentStudyGuide) return;
    
    let content = `
      <html>
        <head>
          <title>Study Guide - ${new Date(currentStudyGuide.timestamp).toLocaleDateString()}</title>
          <style>
            body { font-family: Georgia, serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px; }
            h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .meta { background: #f5f5f5; padding: 15px; margin: 20px 0; border-left: 4px solid #333; }
            .section { margin: 30px 0; }
            .content { white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <h1>Study Guide</h1>
          <div class="meta">
            <strong>Generated:</strong> ${new Date(currentStudyGuide.timestamp).toLocaleString()}<br>
            <strong>Instructions:</strong> ${instructions}
          </div>
          <div class="section">
            <div class="content">${currentStudyGuide.guideContent}</div>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    }
  };

  const handleClose = () => {
    setCurrentStudyGuide(null);
    setShowFullText(false);
    onClose();
  };

  const handleEnterKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!generateStudyGuideMutation.isPending && !currentStudyGuide) {
        handleGenerate();
      }
    }
  };

  const textPreview = currentStudyGuide?.guideContent.substring(0, 300) + (currentStudyGuide?.guideContent.length > 300 ? "..." : "");

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Create Study Guide</span>
              {chunkIndex !== null && chunkIndex !== undefined && (
                <span className="text-sm text-muted-foreground">(Chunk {chunkIndex + 1})</span>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {!currentStudyGuide && (
              <>
                <div>
                  <Label htmlFor="instructions">Study Guide Instructions</Label>
                  <Textarea
                    id="instructions"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    onKeyDown={handleEnterKeyPress}
                    placeholder="Specify how you want the study guide structured and what it should include..."
                    className="min-h-[120px] mt-2"
                  />
                </div>
                
                <div className="bg-muted p-4 rounded-lg">
                  <Label className="text-sm font-medium">Source Text Preview</Label>
                  <ScrollArea className="h-32 mt-2">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {sourceText.substring(0, 500)}...
                    </p>
                  </ScrollArea>
                </div>
              </>
            )}

            {currentStudyGuide && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Study Guide Generated</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Created on {new Date(currentStudyGuide.timestamp).toLocaleString()}
                  </p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Study Guide Content</Label>
                  <ScrollArea className="h-64 mt-2 border rounded-lg p-4 bg-muted/50">
                    <div className="text-sm whitespace-pre-wrap">{textPreview}</div>
                  </ScrollArea>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFullText(true)}
                    className="flex items-center space-x-1"
                  >
                    <FileText className="w-4 h-4" />
                    <span>View Full Guide</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadTxt}
                    className="flex items-center space-x-1"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download TXT</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrintPdf}
                    className="flex items-center space-x-1"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print/PDF</span>
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            {!currentStudyGuide ? (
              <>
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleGenerate}
                  disabled={generateStudyGuideMutation.isPending || !instructions.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {generateStudyGuideMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Study Guide
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button onClick={handleClose}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Full Text Viewer Modal */}
      <Dialog open={showFullText} onOpenChange={setShowFullText}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Complete Study Guide</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[70vh] pr-4">
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium mb-2">Instructions</h3>
                <p className="text-sm text-muted-foreground">{instructions}</p>
              </div>
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap">{currentStudyGuide?.guideContent}</div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={handleDownloadTxt}>
              <Download className="w-4 h-4 mr-2" />
              Download TXT
            </Button>
            <Button variant="outline" onClick={handlePrintPdf}>
              <Printer className="w-4 h-4 mr-2" />
              Print/PDF
            </Button>
            <Button onClick={() => setShowFullText(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}