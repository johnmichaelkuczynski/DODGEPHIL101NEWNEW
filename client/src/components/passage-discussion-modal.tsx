import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, Download, Mail, Printer } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { renderMathInElement } from "@/lib/math-renderer";
import { useToast } from "@/hooks/use-toast";
import { downloadPDF, emailContent, copyToClipboard } from "@/lib/export-utils";
import type { AIModel } from "@shared/schema";

interface PassageDiscussionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  selectedModel: AIModel;
  mathMode: boolean;
}

interface DiscussionMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export default function PassageDiscussionModal({
  isOpen,
  onClose,
  selectedText,
  selectedModel,
  mathMode
}: PassageDiscussionModalProps) {
  const [messages, setMessages] = useState<DiscussionMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isInitializing, setIsInitializing] = useState(false);
  const { toast } = useToast();

  // Download functions
  const handleDownloadPDF = async (content: string) => {
    try {
      await downloadPDF(content);
      toast({ title: "PDF generation initiated - check print dialog" });
    } catch (error) {
      toast({ title: "Failed to generate PDF", variant: "destructive" });
    }
  };

  const handlePrintResponse = (content: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({ title: "Popup blocked. Please allow popups for printing.", variant: "destructive" });
      return;
    }

    const timestamp = new Date().toLocaleString();
    
    let processedContent = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Passage Discussion - Living Book</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
        <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js"></script>
        <style>
          @page { margin: 1in; size: letter; }
          body { font-family: Georgia, serif; font-size: 12pt; line-height: 1.6; color: #333; }
          .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
          .title { font-size: 18pt; font-weight: bold; margin: 0; }
          .timestamp { font-size: 10pt; color: #666; margin: 5px 0 0 0; }
          .content { text-align: justify; }
          .passage { background: #f0f8ff; padding: 15px; border-left: 4px solid #0066cc; margin-bottom: 20px; }
          .katex { font-size: 1em !important; }
          .katex-display { margin: 1em 0 !important; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">Passage Discussion - Dictionary of Analytic Philosophy</h1>
          <p class="timestamp">Generated: ${timestamp}</p>
        </div>
        <div class="passage">
          <strong>Selected Passage:</strong><br>
          ${selectedText}
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

  // Generate initial explanation when modal opens
  const initialExplanationMutation = useMutation({
    mutationFn: async (data: { passage: string; model: AIModel }) => {
      const response = await fetch("/api/passage-explanation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result;
    },
    onSuccess: (data) => {
      const initialMessage: DiscussionMessage = {
        id: Date.now().toString(),
        content: data.explanation,
        isUser: false,
        timestamp: new Date()
      };
      setMessages([initialMessage]);
      setIsInitializing(false);
    },
    onError: (error) => {
      setIsInitializing(false);
      toast({
        title: "Error",
        description: "Failed to generate initial explanation",
        variant: "destructive"
      });
    }
  });

  // Send user message and get AI response
  const discussionMutation = useMutation({
    mutationFn: async (data: { message: string; passage: string; model: AIModel; conversationHistory: DiscussionMessage[] }) => {
      const response = await fetch("/api/passage-discussion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result;
    },
    onSuccess: (data) => {
      const aiMessage: DiscussionMessage = {
        id: Date.now().toString(),
        content: data.response,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Generate initial explanation when modal opens with new text
  useEffect(() => {
    if (isOpen && selectedText && messages.length === 0 && !isInitializing) {
      setIsInitializing(true);
      initialExplanationMutation.mutate({ passage: selectedText, model: selectedModel });
    }
  }, [isOpen, selectedText, selectedModel, messages.length, isInitializing]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setMessages([]);
      setUserInput("");
      setIsInitializing(false);
    }
  }, [isOpen]);

  // Render math after messages update
  useEffect(() => {
    if (mathMode && messages.length > 0) {
      setTimeout(() => {
        renderMathInElement();
      }, 100);
    }
  }, [messages, mathMode]);

  const handleSendMessage = () => {
    if (!userInput.trim() || discussionMutation.isPending) return;

    // Add user message
    const userMessage: DiscussionMessage = {
      id: Date.now().toString(),
      content: userInput,
      isUser: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    // Send to AI
    discussionMutation.mutate({
      message: userInput,
      passage: selectedText,
      model: selectedModel,
      conversationHistory: [...messages, userMessage]
    });

    setUserInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const processContentForMathMode = (content: string) => {
    if (!content) return "";
    
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] w-[95vw] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">Discuss This Passage</DialogTitle>
        </DialogHeader>

        {/* Selected Passage */}
        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 mb-4 flex-shrink-0">
          <div className="font-semibold text-sm text-blue-700 mb-2">Selected Passage:</div>
          <div className="border border-blue-200 rounded bg-white max-h-48 overflow-y-auto">
            <div className="p-3 text-sm leading-relaxed">{selectedText}</div>
          </div>
        </div>

        {/* Discussion Area */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 border rounded-lg overflow-y-auto bg-white">
            <div className="p-4 space-y-4 min-h-full">
            {isInitializing || initialExplanationMutation.isPending ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating explanation...
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-3 rounded-lg ${
                      message.isUser
                        ? "bg-blue-100 ml-8"
                        : "bg-gray-100 mr-8"
                    }`}
                  >
                    <div className="font-semibold text-xs text-gray-600 mb-1">
                      {message.isUser ? "YOU" : "AI"}
                    </div>
                    <div className="text-sm whitespace-pre-wrap">
                      {processContentForMathMode(message.content)}
                    </div>
                    {/* Export buttons for AI responses */}
                    {!message.isUser && (
                      <div className="flex items-center space-x-2 mt-3 pt-2 border-t border-gray-300">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePrintResponse(message.content)}
                          className="text-xs text-gray-600 hover:text-gray-800 p-1 h-auto"
                        >
                          <Printer className="w-3 h-3 mr-1" />
                          Print/PDF
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadPDF(message.content)}
                          className="text-xs text-gray-600 hover:text-gray-800 p-1 h-auto"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Save PDF
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                {discussionMutation.isPending && (
                  <div className="flex items-center gap-2 text-gray-500 bg-gray-100 p-3 rounded-lg mr-8">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    AI is thinking...
                  </div>
                )}
              </>
            )}
            </div>
          </div>

          {/* Input Area */}
          <div className="mt-4 space-y-3 flex-shrink-0">
            <Textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask a question about this passage... (Enter to send, Shift+Enter for new line)"
              className="min-h-[80px] resize-none"
              disabled={discussionMutation.isPending || isInitializing}
            />
            
            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-500">
                Press Enter to send • Shift+Enter for new line
              </div>
              
              <Button
                onClick={handleSendMessage}
                disabled={!userInput.trim() || discussionMutation.isPending || isInitializing}
                className="gap-2"
              >
                {discussionMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Send
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}