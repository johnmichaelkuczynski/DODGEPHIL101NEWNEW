import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageCircle, Send, Bot, User, Download, Mail, Copy, Printer, Lock, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { copyToClipboard, downloadPDF, emailContent } from "@/lib/export-utils";
import { renderMathInElement, renderMathString } from "@/lib/math-renderer";
import type { AIModel, ChatMessage } from "@shared/schema";

interface ChatInterfaceProps {
  selectedModel: AIModel;
  mathMode?: boolean;
  selectedText?: string;
  onSelectedTextUsed?: () => void;

}

export default function ChatInterface({ selectedModel, mathMode = true, selectedText, onSelectedTextUsed }: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [contentToEmail, setContentToEmail] = useState("");
  const [logicSymbolMode, setLogicSymbolMode] = useState(false);
  const [convertedMessage, setConvertedMessage] = useState("");
  const [isConverting, setIsConverting] = useState(false);
  const { toast } = useToast();

  // Convert natural language to symbolic logic using LLM and replace input
  const convertToSymbolicLogic = async (text: string) => {
    if (!text.trim() || !logicSymbolMode) return;
    
    setIsConverting(true);
    try {
      const response = await fetch('/api/chat/convert-logic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text,
          aiModel: 'anthropic'
        })
      });
      
      const data = await response.json();
      if (data.success && data.converted) {
        // Replace the message content with converted symbolic logic
        setMessage(data.converted);
        setConvertedMessage(data.converted);
      }
    } catch (error) {
      console.error('Logic conversion error:', error);
    } finally {
      setIsConverting(false);
    }
  };

  // Check if input is ready for conversion
  const isInputReadyForConversion = (text: string): boolean => {
    if (!text.trim()) return false;
    
    // Check minimum word count (at least 5 words)
    const wordCount = text.trim().split(/\s+/).length;
    if (wordCount < 5) return false;
    
    // Check parentheses balance
    const openParens = (text.match(/\(/g) || []).length;
    const closeParens = (text.match(/\)/g) || []).length;
    if (openParens !== closeParens) return false;
    
    // Check if already symbolic logic
    if (text.includes('∀') || text.includes('∃') || text.includes('∧') || text.includes('∨') || text.includes('→')) return false;
    
    return true;
  };

  // Auto-convert after user stops typing when logic mode is on
  useEffect(() => {
    if (logicSymbolMode && message.trim() && !isConverting) {
      const timeoutId = setTimeout(() => {
        if (isInputReadyForConversion(message)) {
          convertToSymbolicLogic(message);
        }
      }, 1500); // Wait for user to finish typing
      
      return () => clearTimeout(timeoutId);
    }
  }, [message, logicSymbolMode, isConverting]);

  const { data: chatHistory = [], refetch } = useQuery({
    queryKey: ["/api/chat/history"],
    refetchInterval: 5000,
  });

  // No need for additional math rendering since we process it in renderMessageContent

  // Function to process math content based on mode
  const processContentForMathMode = (content: string) => {
    if (!mathMode) {
      // Remove LaTeX notation when math mode is off
      return content
        .replace(/\$\$([^$]+)\$\$/g, '$1') // Remove display math delimiters
        .replace(/\$([^$]+)\$/g, '$1') // Remove inline math delimiters
        .replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)') // Convert sqrt notation
        .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)') // Convert fractions
        .replace(/\\text\{([^}]+)\}/g, '$1') // Remove text commands
        .replace(/\\mathbb\{([^}]+)\}/g, '$1') // Remove mathbb
        .replace(/\\forall/g, 'for all') // Convert universal quantifier
        .replace(/\\Rightarrow/g, 'implies') // Convert implication
        .replace(/\\ldots/g, '...') // Convert ellipsis
        .replace(/\\times/g, '×'); // Convert multiplication
    }
    return content;
  };

  // Function to render markdown-style text
  const renderMessageContent = (content: string) => {
    // Process content based on math mode first
    const processedContent = processContentForMathMode(content);
    
    // If math mode is enabled, process LaTeX notation
    let mathProcessedContent = processedContent;
    if (mathMode) {
      // Replace display math blocks
      mathProcessedContent = mathProcessedContent.replace(/\$\$([^$]+)\$\$/g, (match, latex) => {
        if (!match || !latex) return match || '';
        return renderMathString(latex, true);
      });
      // Replace inline math
      mathProcessedContent = mathProcessedContent.replace(/\$([^$]+)\$/g, (match, latex) => {
        if (!match || !latex) return match || '';
        return renderMathString(latex, false);
      });
    }
    
    // Convert markdown-style formatting to HTML
    let formattedContent = mathProcessedContent
      // Bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Headers
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
      // Code blocks (multiline)
      .replace(/```[\s\S]*?```/g, (match) => {
        if (!match) return '';
        const codeContent = match.replace(/```/g, '');
        return `<pre class="bg-gray-100 p-2 rounded text-sm my-2 overflow-x-auto"><code>${codeContent}</code></pre>`;
      })
      // Inline code
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>')
      // Line breaks
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');

    return { __html: formattedContent };
  };

  const chatMutation = useMutation({
    mutationFn: async (data: { message: string; model: AIModel }) => {
      const response = await apiRequest("/api/chat", {
        method: "POST",
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: () => {
      setMessage("");
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const clearChatMutation = useMutation({
    mutationFn: () => 
      apiRequest("/api/chat/clear", {
        method: "DELETE",
      }),
    onSuccess: () => {
      refetch();
      toast({ title: "Chat history cleared" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Clear Chat Error", 
        description: error?.message || "Failed to clear chat",
        variant: "destructive" 
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    

    
    let finalMessage = message.trim();
    
    // If there's selected text, prepend it as context
    if (selectedText) {
      finalMessage = `About this highlighted passage: "${selectedText}"\n\n${finalMessage}`;
      onSelectedTextUsed?.();
    }
    
    chatMutation.mutate({
      message: finalMessage,
      model: selectedModel,
    });
  };

  const handleCopy = async (content: string) => {
    const success = await copyToClipboard(content);
    if (success) {
      toast({ title: "Copied to clipboard" });
    } else {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const handleDownloadPDF = async (content: string) => {
    try {
      await downloadPDF(content);
      toast({ title: "PDF generation initiated - check print dialog" });
    } catch (error) {
      toast({ title: "Failed to generate PDF", variant: "destructive" });
    }
  };

  const handlePrintResponse = (content: string) => {
    // Create a formatted print window for this specific response
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({ title: "Popup blocked. Please allow popups for printing.", variant: "destructive" });
      return;
    }

    const timestamp = new Date().toLocaleString();
    
    // Process content with math notation
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
        <title>AI Response - Living Book</title>
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
          .katex { font-size: 1em !important; }
          .katex-display { margin: 1em 0 !important; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">AI Response - Dictionary of Analytic Philosophy</h1>
          <p class="timestamp">Generated: ${timestamp}</p>
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

  const openEmailDialog = (content: string) => {
    setContentToEmail(content);
    setEmailDialogOpen(true);
  };

  const handleSendEmail = async () => {
    if (!emailAddress) {
      toast({ title: "Please enter an email address", variant: "destructive" });
      return;
    }

    try {
      await emailContent(contentToEmail, emailAddress, "AI Response from Living Book");
      toast({ title: "Email sent successfully" });
      setEmailAddress("");
      setEmailDialogOpen(false);
    } catch (error) {
      toast({ title: "Failed to send email", variant: "destructive" });
    }
  };

  return (
    <aside className="w-[550px] bg-card border-l border-border sticky top-16 h-[calc(100vh-100px)]">
      <div className="flex flex-col h-full overflow-hidden">
        {/* Chat Header */}
        <div className="bg-muted px-4 py-3 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-inter font-semibold text-sm text-foreground flex items-center">
                <MessageCircle className="text-primary mr-2 w-4 h-4" />
                AI Chat Interface
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Ask questions about Writing 101</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => clearChatMutation.mutate()}
              disabled={clearChatMutation.isPending}
              className="text-xs text-red-600 hover:text-red-800"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Clear Chat
            </Button>
          </div>
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 overflow-y-auto min-h-0">
          <div className="p-4 space-y-4">
            {/* Welcome Message - shown when no chat history */}
            {(!chatHistory || !Array.isArray(chatHistory) || chatHistory.length === 0) && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start space-x-3">
                  <Bot className="text-blue-600 dark:text-blue-400 mt-1 w-5 h-5" />
                  <div className="flex-1">
                    <div className="text-blue-800 dark:text-blue-200 font-medium mb-2">
                      Welcome to Writing 101!
                    </div>
                    <p className="text-blue-700 dark:text-blue-300 text-sm leading-relaxed">
                      This is a fully interactive text. Highlight any text to discuss, rewrite, or generate tests/study guides. 
                      Ask me questions about academic writing principles, essay assignments, or any content in the curriculum!
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {(chatHistory as ChatMessage[]).map((chat: ChatMessage) => (
                <div key={chat.id} className="space-y-2">
                  {/* User Message */}
                  <div className="bg-muted rounded-lg p-3 ml-8">
                    <div className="flex items-start space-x-2">
                      <User className="text-muted-foreground mt-1 w-4 h-4" />
                      <div className="flex-1">
                        <p className="text-base text-foreground">{chat.message}</p>
                      </div>
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <Bot className="text-primary mt-1 w-4 h-4" />
                      <div className="flex-1">
                        <div 
                          className={`text-lg text-foreground prose prose-lg max-w-none chat-response ${mathMode ? 'math-enabled' : 'math-disabled'}`}
                          dangerouslySetInnerHTML={renderMessageContent(chat.response)}
                        />
                        {/* Export Controls */}
                        <div className="flex items-center space-x-2 mt-3 pt-2 border-t border-blue-200">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePrintResponse(chat.response)}
                            className="text-xs text-blue-600 hover:text-blue-800 p-1 h-auto"
                          >
                            <Printer className="w-3 h-3 mr-1" />
                            Print/PDF
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadPDF(chat.response)}
                            className="text-xs text-blue-600 hover:text-blue-800 p-1 h-auto"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Save PDF
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEmailDialog(chat.response)}
                            className="text-xs text-blue-600 hover:text-blue-800 p-1 h-auto"
                          >
                            <Mail className="w-3 h-3 mr-1" />
                            Email
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(chat.response)}
                            className="text-xs text-blue-600 hover:text-blue-800 p-1 h-auto"
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copy
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
        </ScrollArea>

        {/* Chat Input Form */}
        <div className="p-4 border-t border-border bg-card">
          {selectedText && (
            <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
              <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                Selected text:
              </div>
              <div className="text-xs text-muted-foreground truncate">
                "{selectedText.substring(0, 100)}..."
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onSelectedTextUsed}
                className="text-xs text-blue-600 hover:text-blue-800 p-0 h-auto mt-1"
              >
                Clear selection
              </Button>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-700">Your Message:</label>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setLogicSymbolMode(!logicSymbolMode)}
                    className={`flex items-center space-x-1 text-xs ${logicSymbolMode ? 'bg-blue-100 text-blue-700' : ''}`}
                  >
                    {logicSymbolMode ? <ToggleRight className="w-3 h-3" /> : <ToggleLeft className="w-3 h-3" />}
                    <span>Logic Symbols</span>
                  </Button>
                </div>
              </div>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={selectedText ? "Ask about the selected text..." : logicSymbolMode ? "Type naturally: 'For all x if Px then Qx'" : "Ask a question about the document..."}
                className="min-h-[80px] resize-none text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              {logicSymbolMode && (
                <div className="p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                  <div className="text-xs text-blue-600 mb-1">
                    {isConverting ? "Converting to symbolic logic..." : "Logic Symbol Mode: ON - AI will convert your natural language"}
                  </div>
                  {isConverting && (
                    <div className="text-xs text-gray-600">
                      Please wait while AI converts your input to proper symbolic notation...
                    </div>
                  )}
                </div>
              )}
              <div className="text-xs text-gray-500">
                {logicSymbolMode ? "Logic Symbol Mode: ON - Type naturally and AI will convert to proper symbols" : "Normal Mode: Type questions normally"}
              </div>
            </div>
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={!message.trim() || chatMutation.isPending}
                size="sm"
                className="flex items-center space-x-2"
              >
                {chatMutation.isPending ? (
                  <>
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3 h-3" />
                    <span>Send</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email AI Response</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Email Address:</label>
              <Input
                type="email"
                placeholder="your-email@example.com"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Content Preview:</label>
              <div className="mt-1 p-3 bg-muted rounded text-xs max-h-32 overflow-y-auto">
                {contentToEmail.substring(0, 200)}...
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendEmail} disabled={!emailAddress}>
                Send Email
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>


    </aside>
  );
}