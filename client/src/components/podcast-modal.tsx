import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Volume2, Download, Play, Pause } from "lucide-react";
import ModelSelector from "@/components/model-selector";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import type { AIModel } from "@shared/schema";

interface PodcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceText: string;
  chunkIndex?: number | null;
}

interface PodcastResponse {
  id: number;
  script: string;
  hasAudio: boolean;
  isPreview: boolean;
}

export default function PodcastModal({ isOpen, onClose, sourceText, chunkIndex }: PodcastModalProps) {
  const { user } = useAuth();
  const [instructions, setInstructions] = useState("");
  const [selectedModel, setSelectedModel] = useState<AIModel>("openai");
  const [podcastFormat, setPodcastFormat] = useState<"normal_single" | "normal_dialogue" | "custom_single" | "custom_dialogue">("normal_single");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPodcast, setCurrentPodcast] = useState<PodcastResponse | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const handleGenerate = async () => {
    if (!sourceText.trim()) return;

    setIsGenerating(true);
    try {
      const response = await apiRequest("/api/generate-podcast", {
        method: "POST",
        body: JSON.stringify({
          sourceText: sourceText.trim(),
          instructions: instructions.trim() || undefined,
          model: selectedModel,
          format: podcastFormat,
          chunkIndex,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate podcast");
      }

      const data: PodcastResponse = await response.json();
      setCurrentPodcast(data);
    } catch (error) {
      console.error("Error generating podcast:", error);
      alert(`Failed to generate podcast: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayPause = () => {
    if (!currentPodcast?.hasAudio) return;

    if (isPlaying && audioElement) {
      audioElement.pause();
      setIsPlaying(false);
    } else {
      // For now, we'll just show a placeholder since we don't have actual audio file storage
      alert("Audio playback functionality coming soon!");
    }
  };

  const handleDownload = () => {
    if (!currentPodcast) return;

    const element = document.createElement("a");
    const file = new Blob([currentPodcast.script], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `podcast_script_${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleClose = () => {
    if (audioElement) {
      audioElement.pause();
      setAudioElement(null);
    }
    setIsPlaying(false);
    setCurrentPodcast(null);
    setInstructions("");
    setPodcastFormat("normal_single");
    onClose();
  };

  const hasCredits = user && user.credits > 100;
  const isAdmin = user?.username === 'jmkuczynski';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Volume2 className="w-5 h-5" />
            <span>Generate Podcast Summary</span>
          </DialogTitle>
          <DialogDescription>
            Generate an AI-powered podcast-style summary of your selected text with optional audio synthesis.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Source Text Preview */}
          <div>
            <Label className="text-sm font-medium">Source Text Preview</Label>
            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md max-h-32 overflow-y-auto">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {sourceText.substring(0, 300)}
                {sourceText.length > 300 && "..."}
              </p>
            </div>
          </div>

          {/* Podcast Format Selection */}
          <div>
            <Label className="text-sm font-medium">Podcast Format</Label>
            <div className="mt-2 space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="normal_single"
                  name="format"
                  value="normal_single"
                  checked={podcastFormat === "normal_single"}
                  onChange={(e) => setPodcastFormat("normal_single")}
                  className="w-4 h-4"
                />
                <Label htmlFor="normal_single" className="text-sm">
                  <strong>Normal Mode</strong> - Single host explaining the topic conversationally
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="normal_dialogue"
                  name="format"
                  value="normal_dialogue"
                  checked={podcastFormat === "normal_dialogue"}
                  onChange={(e) => setPodcastFormat("normal_dialogue")}
                  className="w-4 h-4"
                />
                <Label htmlFor="normal_dialogue" className="text-sm">
                  <strong>Normal Mode (Two Hosts)</strong> - Natural dialogue between Alex and Jamie
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="custom_single"
                  name="format"
                  value="custom_single"
                  checked={podcastFormat === "custom_single"}
                  onChange={(e) => setPodcastFormat("custom_single")}
                  className="w-4 h-4"
                />
                <Label htmlFor="custom_single" className="text-sm">
                  <strong>Custom (One Host)</strong> - Single host with your custom instructions
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="custom_dialogue"
                  name="format"
                  value="custom_dialogue"
                  checked={podcastFormat === "custom_dialogue"}
                  onChange={(e) => setPodcastFormat("custom_dialogue")}
                  className="w-4 h-4"
                />
                <Label htmlFor="custom_dialogue" className="text-sm">
                  <strong>Custom (Two Hosts)</strong> - Dialogue format with your custom instructions
                </Label>
              </div>
            </div>
          </div>

          {/* Custom Instructions - only show when Custom format is selected */}
          {(podcastFormat === "custom_single" || podcastFormat === "custom_dialogue") && (
            <div>
              <Label htmlFor="instructions" className="text-sm font-medium">
                Custom Instructions
              </Label>
              <Textarea
                id="instructions"
                placeholder="e.g., Make it a debate between two experts, focus on practical applications, include examples, create a game show format..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="mt-2"
                rows={4}
              />
            </div>
          )}

          {/* Model Selection */}
          <div>
            <Label className="text-sm font-medium">AI Model</Label>
            <div className="mt-2">
              <ModelSelector
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
              />
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-between items-center">
            <div>
              {!isAdmin && (
                <p className="text-sm text-muted-foreground">
                  Cost: 100 credits {hasCredits ? "" : "(Insufficient credits)"}
                </p>
              )}
            </div>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || (!isAdmin && !hasCredits)}
              className="flex items-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>Generate Podcast</span>
                </>
              )}
            </Button>
          </div>

          {/* Podcast Script Result */}
          {currentPodcast && (
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Podcast Script</h3>
                <div className="flex items-center space-x-2">
                  {currentPodcast.hasAudio && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePlayPause}
                      className="flex items-center space-x-1"
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      <span>{isPlaying ? "Pause" : "Play"}</span>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    className="flex items-center space-x-1"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Script</span>
                  </Button>
                </div>
              </div>
              
              {/* Audio Player */}
              {currentPodcast.hasAudio && (
                <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Volume2 className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800 dark:text-green-200">Audio Available</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = `/api/podcasts/${currentPodcast.id}/audio`;
                        link.download = `podcast_${currentPodcast.id}.mp3`;
                        link.click();
                      }}
                      className="flex items-center space-x-1"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download MP3</span>
                    </Button>
                  </div>
                  <audio 
                    controls 
                    className="w-full"
                    src={`/api/podcasts/${currentPodcast.id}/audio`}
                    preload="metadata"
                  >
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}

              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg max-h-96 overflow-y-auto">
                <div className="whitespace-pre-wrap text-sm font-mono">
                  {currentPodcast.script}
                </div>
              </div>

              {currentPodcast.isPreview && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    This is a preview. Register and purchase credits to generate the complete podcast script with audio.
                  </p>
                </div>
              )}

              {!currentPodcast.hasAudio && !currentPodcast.isPreview && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                  <div className="flex items-center space-x-2">
                    <Volume2 className="w-4 h-4 text-yellow-600" />
                    <span className="font-medium text-yellow-800 dark:text-yellow-200">Audio synthesis requires Azure Speech Service</span>
                  </div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    Configure AZURE_SPEECH_KEY and AZURE_SPEECH_ENDPOINT to enable audio generation.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}