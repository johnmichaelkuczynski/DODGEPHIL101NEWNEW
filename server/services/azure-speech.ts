import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import * as fs from "fs";
import * as path from "path";

// Create audio directory if it doesn't exist
const audioDir = path.join(process.cwd(), 'audio');
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

export async function synthesizeSpeech(text: string, podcastId: number): Promise<{ audioPath: string | null; hasAudio: boolean }> {
  const speechKey = process.env.AZURE_SPEECH_KEY;
  const speechEndpoint = process.env.AZURE_SPEECH_ENDPOINT;

  if (!speechKey || !speechEndpoint) {
    console.log("Azure Speech credentials not configured");
    return { audioPath: null, hasAudio: false };
  }

  try {
    // Extract region from endpoint format: https://[region].api.cognitive.microsoft.com/
    let region = 'eastus'; // default fallback
    const regionMatch = speechEndpoint.match(/https:\/\/([^.]+)\.api\.cognitive\.microsoft\.com/);
    if (regionMatch) {
      region = regionMatch[1];
    }
    
    console.log(`Using Azure Speech region: ${region}`);
    const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, region);
    speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;
    speechConfig.speechSynthesisVoiceName = "en-US-JennyNeural";

    // Define output file path
    const audioFileName = `podcast_${podcastId}_${Date.now()}.mp3`;
    const audioFilePath = path.join(audioDir, audioFileName);
    
    const audioConfig = sdk.AudioConfig.fromAudioFileOutput(audioFilePath);
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

    return new Promise((resolve, reject) => {
      synthesizer.speakTextAsync(
        text,
        (result) => {
          if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            console.log(`Audio synthesis completed: ${audioFilePath}`);
            synthesizer.close();
            resolve({ audioPath: audioFilePath, hasAudio: true });
          } else {
            console.error("Speech synthesis failed:", result.errorDetails);
            synthesizer.close();
            resolve({ audioPath: null, hasAudio: false });
          }
        },
        (error) => {
          console.error("Speech synthesis error:", error);
          synthesizer.close();
          reject(error);
        }
      );
    });
  } catch (error) {
    console.error("Azure Speech synthesis error:", error);
    return { audioPath: null, hasAudio: false };
  }
}

export interface SpeechConfig {
  subscriptionKey: string;
  region: string;
}

export class AzureSpeechService {
  private speechConfig: sdk.SpeechConfig;

  constructor(config: SpeechConfig) {
    this.speechConfig = sdk.SpeechConfig.fromSubscription(config.subscriptionKey, config.region);
    this.speechConfig.speechSynthesisVoiceName = "en-US-JennyNeural";
    this.speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;
  }

  async synthesizeToFile(text: string, outputPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const audioConfig = sdk.AudioConfig.fromAudioFileOutput(outputPath);
      const synthesizer = new sdk.SpeechSynthesizer(this.speechConfig, audioConfig);

      synthesizer.speakTextAsync(
        text,
        result => {
          if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            console.log(`Audio synthesis completed. Audio saved to ${outputPath}`);
            synthesizer.close();
            resolve(outputPath);
          } else {
            console.error(`Speech synthesis canceled: ${result.errorDetails}`);
            synthesizer.close();
            reject(new Error(result.errorDetails));
          }
        },
        error => {
          console.error(`Speech synthesis error: ${error}`);
          synthesizer.close();
          reject(error);
        }
      );
    });
  }

  async synthesizeToBuffer(text: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const synthesizer = new sdk.SpeechSynthesizer(this.speechConfig);

      synthesizer.speakTextAsync(
        text,
        result => {
          if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            const audioBuffer = Buffer.from(result.audioData);
            synthesizer.close();
            resolve(audioBuffer);
          } else {
            console.error(`Speech synthesis canceled: ${result.errorDetails}`);
            synthesizer.close();
            reject(new Error(result.errorDetails));
          }
        },
        error => {
          console.error(`Speech synthesis error: ${error}`);
          synthesizer.close();
          reject(error);
        }
      );
    });
  }

  close() {
    this.speechConfig?.close();
  }
}

// Factory function to create Azure Speech Service
export function createAzureSpeechService(): AzureSpeechService | null {
  const subscriptionKey = process.env.AZURE_SPEECH_KEY;
  const endpoint = process.env.AZURE_SPEECH_ENDPOINT;

  if (!subscriptionKey || !endpoint) {
    console.warn("Azure Speech credentials not found. Speech synthesis will be disabled.");
    return null;
  }

  // Extract region from endpoint URL format: https://[region].api.cognitive.microsoft.com/
  const region = endpoint.match(/https:\/\/([^.]+)\.api\.cognitive\.microsoft\.com/)?.[1] || "eastus";

  return new AzureSpeechService({
    subscriptionKey,
    region,
  });
}