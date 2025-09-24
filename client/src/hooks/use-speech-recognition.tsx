import { useState, useRef, useCallback } from "react";
import { apiRequest } from "@/lib/queryClient";

interface SpeechRecognitionResult {
  text: string;
  confidence?: number;
}

export function useSpeechRecognition() {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        } 
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (error) {
      setError("Microphone access denied. Please enable microphone permissions.");
      console.error("Recording error:", error);
    }
  }, []);

  const stopRecording = useCallback((): Promise<SpeechRecognitionResult> => {
    return new Promise((resolve, reject) => {
      if (!mediaRecorderRef.current || !isRecording) {
        reject(new Error("No active recording"));
        return;
      }

      mediaRecorderRef.current.onstop = async () => {
        try {
          setIsRecording(false);
          setIsTranscribing(true);

          const audioBlob = new Blob(audioChunksRef.current, { 
            type: 'audio/webm;codecs=opus' 
          });

          // Stop all tracks to release microphone
          const tracks = mediaRecorderRef.current?.stream?.getTracks() || [];
          tracks.forEach(track => track.stop());

          // Send to backend for transcription
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.webm');

          const response = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData
          });

          if (!response.ok) {
            throw new Error(`Transcription failed: ${response.statusText}`);
          }

          const result = await response.json();
          setIsTranscribing(false);
          resolve(result);
        } catch (error) {
          setIsTranscribing(false);
          setError("Speech recognition failed. Please try again.");
          reject(error);
        }
      };

      mediaRecorderRef.current.stop();
    });
  }, [isRecording]);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      
      // Stop all tracks to release microphone
      const tracks = mediaRecorderRef.current.stream?.getTracks() || [];
      tracks.forEach(track => track.stop());
      
      setIsRecording(false);
      setError(null);
    }
  }, [isRecording]);

  // Check if browser supports speech recognition
  const isSupported = typeof navigator !== 'undefined' && 
    !!navigator.mediaDevices && 
    !!navigator.mediaDevices.getUserMedia;

  return {
    isRecording,
    isTranscribing,
    error,
    isSupported,
    startRecording,
    stopRecording,
    cancelRecording
  };
}