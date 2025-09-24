import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2, Square } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { useToast } from "@/hooks/use-toast";

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
}

export default function VoiceRecorder({ onTranscription, disabled }: VoiceRecorderProps) {
  const { 
    isRecording, 
    isTranscribing, 
    error, 
    isSupported, 
    startRecording, 
    stopRecording, 
    cancelRecording 
  } = useSpeechRecognition();
  
  const { toast } = useToast();
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Recording timer
  useState(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }
    return () => clearInterval(interval);
  });

  const handleStartRecording = async () => {
    try {
      await startRecording();
      toast({
        title: "Recording started",
        description: "Speak your question or instruction"
      });
    } catch (error) {
      toast({
        title: "Recording failed",
        description: "Please check microphone permissions",
        variant: "destructive"
      });
    }
  };

  const handleStopRecording = async () => {
    try {
      const result = await stopRecording();
      if (result.text.trim()) {
        onTranscription(result.text.trim());
        toast({
          title: "Speech recognized",
          description: `Transcribed: "${result.text.substring(0, 50)}${result.text.length > 50 ? '...' : ''}"`
        });
      } else {
        toast({
          title: "No speech detected",
          description: "Please try speaking more clearly",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Transcription failed",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isSupported) {
    return null; // Hide button if not supported
  }

  return (
    <div className="flex items-center space-x-2">
      {!isRecording && !isTranscribing && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleStartRecording}
          disabled={disabled}
          className="flex items-center space-x-1 text-blue-600 border-blue-200 hover:bg-blue-50"
        >
          <Mic className="w-4 h-4" />
          <span className="hidden sm:inline">Voice</span>
        </Button>
      )}

      {isRecording && (
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleStopRecording}
            className="flex items-center space-x-1"
          >
            <Square className="w-4 h-4" />
            <span>Stop</span>
          </Button>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span>{formatDuration(recordingDuration)}</span>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={cancelRecording}
            className="text-xs"
          >
            Cancel
          </Button>
        </div>
      )}

      {isTranscribing && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Transcribing...</span>
        </div>
      )}

      {error && (
        <div className="text-xs text-destructive max-w-xs">
          {error}
        </div>
      )}
    </div>
  );
}