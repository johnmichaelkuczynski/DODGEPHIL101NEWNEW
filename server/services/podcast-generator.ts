import { generateAIResponse } from "./ai-models.js";
import { synthesizeSpeech } from "./openai-tts.js";
import type { AIModel } from "@shared/schema";

interface PodcastRequest {
  sourceText: string;
  instructions?: string;
  model: AIModel;
  podcastId: number;
  format?: "normal_single" | "normal_dialogue" | "custom_single" | "custom_dialogue";
}

export async function generatePodcast(request: PodcastRequest): Promise<{
  script: string;
  hasAudio: boolean;
  audioPath: string | null;
}> {
  const { sourceText, instructions, model, podcastId, format = "normal_single" } = request;

  console.log("=== PODCAST GENERATION DEBUG ===");
  console.log("Format:", format);
  console.log("Instructions received:", JSON.stringify(instructions));
  console.log("Instructions type:", typeof instructions);
  console.log("Instructions truthy:", !!instructions);
  console.log("Instructions length:", instructions?.length || 0);

  // Create format-specific prompt
  let prompt: string;

  if (format === "normal_single") {
    prompt = `You are an expert podcast host creating an engaging, conversational summary. 

Source material:
${sourceText}

Create a single-host podcast script that:
- Uses a warm, conversational tone like you're talking to a friend
- Includes natural speech patterns and transitions
- Breaks down complex concepts into accessible language
- Tells a story rather than just listing facts
- Uses "you" to engage the listener directly
- Includes rhetorical questions and pauses for emphasis
- Keeps the energy up throughout

Format as a complete podcast script ready for text-to-speech synthesis. Do not include any formatting, headers, or technical instructions - just the spoken content.`;

  } else if (format === "normal_dialogue") {
    prompt = `You are creating a conversational dialogue between two podcast hosts discussing the topic.

Source material:
${sourceText}

Create a natural dialogue between:
- HOST ALEX: The main presenter who introduces topics and asks questions
- HOST JAMIE: The expert who provides detailed explanations and insights

Requirements:
- Make it a realistic conversation with natural interruptions, agreements, and follow-up questions
- Both hosts should feel like distinct personalities
- Include casual banter and authentic reactions ("Oh wow!", "That's fascinating!", "Wait, so you're saying...")
- Alex should ask the questions listeners would ask
- Jamie should provide clear, engaging explanations
- Format as: "ALEX: [speech]" and "JAMIE: [speech]" alternating throughout
- No stage directions or formatting - just the dialogue
- Make it feel like two friends having an animated discussion about the topic

Create the complete dialogue ready for text-to-speech synthesis.`;

  } else if (format === "custom_single") {
    prompt = `You are an expert podcast host creating content according to custom instructions.

Source material:
${sourceText}

Custom instructions: ${instructions || 'Create an engaging single-host podcast summary'}

Create a single-host podcast script that follows the custom instructions while maintaining:
- Natural, engaging speech patterns
- Clear explanations of complex topics
- A conversational tone throughout

Format as a complete podcast script ready for text-to-speech synthesis. Do not include any formatting, headers, or technical instructions - just the spoken content.`;

  } else { // custom_dialogue
    prompt = `You are creating a conversational dialogue between two podcast hosts according to custom instructions.

Source material:
${sourceText}

Custom instructions: ${instructions || 'Create an engaging two-host podcast dialogue'}

Create a natural dialogue between:
- HOST ALEX: The main presenter who introduces topics and asks questions
- HOST JAMIE: The expert who provides detailed explanations and insights

Requirements:
- Follow the custom instructions while maintaining natural conversation flow
- Both hosts should feel like distinct personalities
- Include authentic reactions and follow-up questions
- Format as: "ALEX: [speech]" and "JAMIE: [speech]" alternating throughout
- No stage directions or formatting - just the dialogue
- Make it feel like a natural discussion following your custom instructions

Create the complete dialogue ready for text-to-speech synthesis.`;
  }

  try {
    console.log("Starting podcast generation with model:", model);
    console.log("Prompt length:", prompt.length);
    
    // Generate the podcast script using AI
    const script = await generateAIResponse(model, prompt, "");
    
    console.log("Generated script length:", script?.length);
    console.log("Script preview:", script?.substring(0, 200));
    
    if (!script || script.trim().length === 0) {
      throw new Error("Generated script is empty");
    }
    
    // Try to synthesize speech with OpenAI TTS
    let hasAudio = false;
    let audioPath: string | null = null;
    
    try {
      const audioResult = await synthesizeSpeech(script, podcastId);
      hasAudio = audioResult.hasAudio;
      audioPath = audioResult.audioPath;
      console.log("Audio synthesis result:", { hasAudio, audioPath });
    } catch (error) {
      console.log("Audio synthesis not available:", error);
      hasAudio = false;
      audioPath = null;
    }

    return {
      script,
      hasAudio,
      audioPath,
    };
  } catch (error) {
    console.error("Error generating podcast:", error);
    throw new Error("Failed to generate podcast script");
  }
}

export function cleanScriptForSpeech(script: string): string {
  // Remove markdown formatting for better speech synthesis
  return script
    .replace(/#{1,6}\s*/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/`(.*?)`/g, '$1') // Remove code backticks
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links, keep text
    .replace(/^[-*+]\s+/gm, '') // Remove bullet points
    .replace(/^\d+\.\s+/gm, '') // Remove numbered lists
    .replace(/\n{3,}/g, '\n\n') // Reduce excessive line breaks
    .trim();
}

export function generatePreviewScript(fullScript: string, wordLimit: number = 200): string {
  const words = fullScript.split(/\s+/);
  if (words.length <= wordLimit) {
    return fullScript;
  }
  
  const preview = words.slice(0, wordLimit).join(' ');
  return `${preview}... [PREVIEW - Register and purchase credits to access the complete podcast script and audio]`;
}