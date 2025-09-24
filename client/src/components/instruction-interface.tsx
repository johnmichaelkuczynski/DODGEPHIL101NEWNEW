import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import VoiceRecorder from "@/components/voice-recorder";
import type { AIModel } from "@shared/schema";

interface InstructionInterfaceProps {
  selectedModel: AIModel;
  mathMode?: boolean;
  initialQuestion?: string;
  onQuestionProcessed?: () => void;
}

export default function InstructionInterface({ selectedModel, mathMode = true, initialQuestion, onQuestionProcessed }: InstructionInterfaceProps) {
  const [instruction, setInstruction] = useState("");
  const [response, setResponse] = useState("");
  const [showResponse, setShowResponse] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Auto-fill with highlighted text question
  useEffect(() => {
    if (initialQuestion) {
      setInstruction(initialQuestion);
      if (onQuestionProcessed) {
        onQuestionProcessed();
      }
    }
  }, [initialQuestion, onQuestionProcessed]);

  const instructionMutation = useMutation({
    mutationFn: async (data: { instruction: string; model: AIModel }) => {
      const response = await apiRequest("/api/instruction", {
        method: "POST",
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: async (data) => {
      // Show the response directly in the instruction interface
      setResponse(data.response);
      setShowResponse(true);
      setInstruction("");
      
      toast({
        title: "Response Ready",
        description: "Your AI response is displayed below",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!instruction.trim()) return;
    
    instructionMutation.mutate({
      instruction: instruction.trim(),
      model: selectedModel,
    });
  };

  return (
    <div className="bg-card border-t border-border p-6 fixed bottom-0 left-0 right-0 z-40">
      <div className="max-w-4xl">
        <h2 className="font-inter font-semibold text-lg text-foreground mb-3">
          AI Instruction Interface
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (instruction.trim() && !instructionMutation.isPending) {
                  handleSubmit(e);
                }
              }
            }}
            className="w-full h-24 resize-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ask a question, give a command, or modify the content... (Press Enter to send, Shift+Enter for new line)"
            autoFocus
          />
          <div className="flex justify-between items-center">
            <VoiceRecorder 
              onTranscription={(text) => setInstruction(prev => prev + (prev ? ' ' : '') + text)}
              disabled={instructionMutation.isPending}
            />
            <Button
              type="submit"
              disabled={!instruction.trim() || instructionMutation.isPending}
              className="flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>
                {instructionMutation.isPending ? "Processing..." : "Send Instruction"}
              </span>
            </Button>
          </div>
        </form>
        
        {/* AI Response Display */}
        {showResponse && (
          <div className="mt-6 p-4 bg-muted rounded-lg border">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-foreground">AI Response:</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowResponse(false)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
            <div className="text-sm text-muted-foreground whitespace-pre-wrap">
              {response}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
