import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

// Ensure audio directory exists
const audioDir = path.join(process.cwd(), 'audio');
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

// Function to detect if script is a dialogue format
function isDialogueScript(script: string): boolean {
  return script.includes('ALEX:') && script.includes('JAMIE:');
}

// Function to split dialogue script into parts by speaker
function parseDialogueScript(script: string): Array<{ speaker: 'ALEX' | 'JAMIE', text: string }> {
  const parts = [];
  const lines = script.split('\n');
  let currentSpeaker: 'ALEX' | 'JAMIE' | null = null;
  let currentText = '';

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine.startsWith('ALEX:')) {
      if (currentSpeaker && currentText.trim()) {
        parts.push({ speaker: currentSpeaker, text: currentText.trim() });
      }
      currentSpeaker = 'ALEX';
      currentText = trimmedLine.replace('ALEX:', '').trim();
    } else if (trimmedLine.startsWith('JAMIE:')) {
      if (currentSpeaker && currentText.trim()) {
        parts.push({ speaker: currentSpeaker, text: currentText.trim() });
      }
      currentSpeaker = 'JAMIE';
      currentText = trimmedLine.replace('JAMIE:', '').trim();
    } else if (trimmedLine && currentSpeaker) {
      currentText += ' ' + trimmedLine;
    }
  }

  // Add the last part
  if (currentSpeaker && currentText.trim()) {
    parts.push({ speaker: currentSpeaker, text: currentText.trim() });
  }

  return parts;
}

export async function synthesizeSpeech(text: string, podcastId: number): Promise<{ audioPath: string | null; hasAudio: boolean }> {
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!openaiApiKey) {
    console.log("OpenAI API key not configured");
    return { audioPath: null, hasAudio: false };
  }

  try {
    const openai = new OpenAI({
      apiKey: openaiApiKey,
    });

    // Define output file path
    const audioFileName = `podcast_${podcastId}_${Date.now()}.mp3`;
    const audioFilePath = path.join(audioDir, audioFileName);

    // Check if this is a dialogue script
    if (isDialogueScript(text)) {
      console.log("Synthesizing dialogue with multiple voices");
      
      // Parse dialogue into parts
      const dialogueParts = parseDialogueScript(text);
      console.log(`Found ${dialogueParts.length} dialogue segments`);
      
      // Generate audio for each part with appropriate voice
      const audioSegments = [];
      for (const part of dialogueParts) {
        const voice = part.speaker === 'ALEX' ? 'alloy' : 'echo'; // Alex = alloy (deeper), Jamie = echo (higher)
        console.log(`Synthesizing ${part.speaker} segment with ${voice} voice`);
        
        try {
          const mp3 = await openai.audio.speech.create({
            model: 'tts-1-hd',
            voice: voice,
            input: part.text,
          });
          
          const buffer = Buffer.from(await mp3.arrayBuffer());
          audioSegments.push(buffer);
        } catch (error) {
          console.error(`Error synthesizing ${part.speaker} segment:`, error);
          // Fallback to single voice if individual segment fails
          break;
        }
      }
      
      if (audioSegments.length === dialogueParts.length) {
        // Combine all audio segments
        const combinedAudio = Buffer.concat(audioSegments);
        await fs.promises.writeFile(audioFilePath, combinedAudio);
        
        console.log(`Multi-voice dialogue audio completed: ${audioFilePath}`);
        return { audioPath: audioFilePath, hasAudio: true };
      }
    }
    
    // Fallback to single voice (either non-dialogue or if multi-voice failed)
    console.log(`Using single OpenAI TTS with alloy voice`);

    // Generate speech using OpenAI TTS
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1-hd', // Using high-quality model
      voice: 'alloy',
      input: text,
    });

    // Convert the response to a buffer and save to file
    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.promises.writeFile(audioFilePath, buffer);

    console.log(`Audio synthesis completed: ${audioFilePath}`);
    return { audioPath: audioFilePath, hasAudio: true };

  } catch (error) {
    console.error("OpenAI TTS synthesis error:", error);
    return { audioPath: null, hasAudio: false };
  }
}