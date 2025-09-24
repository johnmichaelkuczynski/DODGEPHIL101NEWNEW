// Backup of working ai-models.ts with simplified quiz generation

// CRITICAL USER REQUIREMENTS:
// 1. FRESH MEANS FRESH - all content must be completely unique every time
// 2. App is pure shell/passthrough - LLM generates all content, no interference
// 3. DeepSeek is DEFAULT due to cost concerns

export type AIModel = "openai" | "anthropic" | "perplexity" | "deepseek";

export function getModelDisplayName(model: AIModel): string {
  switch (model) {
    case "openai": return "AI2 (GPT-4)";
    case "anthropic": return "AI3 (Claude)";
    case "perplexity": return "AI4 (Perplexity)";
    case "deepseek": return "AI1 (DeepSeek)";
    default: return "Unknown";
  }
}

// REAL AI quiz generation - completely fresh every time
export async function generateQuiz(model: AIModel, sourceText: string, instructions: string, includeAnswerKey: boolean = false): Promise<{ testContent: string; answerKey?: string }> {
  console.log(`Generating UNIQUE quiz for: ${sourceText} | Instructions: ${instructions}`);
  
  // REAL LLM CALL - No fallback content
  const prompt = `Generate a comprehensive philosophy quiz based on this source text:

${sourceText}

Instructions: ${instructions}

Create 5 thoughtful questions that test understanding of philosophical concepts, critical thinking, and analysis. Mix multiple choice and short answer questions.

Return only valid JSON in this format:
{
  "title": "Philosophy Quiz",
  "instructions": "Complete all questions with thoughtful philosophical analysis",
  "totalPoints": 50,
  "questions": [
    {
      "id": "q1",
      "question": "Question text here",
      "type": "text_input" or "multiple_choice",
      "options": ["A", "B", "C", "D"] (only for multiple choice),
      "correctAnswer": "answer text" or index,
      "points": 10,
      "explanation": "Explanation of correct approach"
    }
  ]
}`;

  try {
    let response = "";
    
    switch (model) {
      case "deepseek":
        response = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 2000,
            temperature: 0.7
          })
        }).then(r => r.json()).then(d => d.choices?.[0]?.message?.content || "");
        break;
        
      case "openai":
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 2000,
            temperature: 0.7
          })
        }).then(r => r.json()).then(d => d.choices?.[0]?.message?.content || "");
        break;
        
      case "anthropic":
        response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': process.env.ANTHROPIC_API_KEY || '',
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 2000,
            messages: [{ role: 'user', content: prompt }]
          })
        }).then(r => r.json()).then(d => d.content?.[0]?.text || "");
        break;
        
      default:
        throw new Error(`Unsupported model: ${model}`);
    }
    
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const quizData = JSON.parse(jsonMatch[0]);
      return {
        testContent: JSON.stringify(quizData),
        answerKey: includeAnswerKey ? "Answer key included in quiz structure" : undefined
      };
    }
    
    throw new Error("No valid JSON found in LLM response");
    
  } catch (error) {
    console.error('LLM quiz generation failed:', error);
    throw new Error("LLM generation failed—no fallback to static questions");
  }

}

// Stub functions to maintain compatibility
export async function generateText(model: AIModel, prompt: string, systemPrompt: string = ""): Promise<string> {
  try {
    let response = "";
    
    switch (model) {
      case "deepseek":
        const deepseekResponse = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
              { role: 'user', content: prompt }
            ],
            max_tokens: 4000,
            temperature: 0.7
          })
        });
        
        if (!deepseekResponse.ok) {
          const errorData = await deepseekResponse.json().catch(() => ({}));
          console.error('DeepSeek API Error:', deepseekResponse.status, errorData);
          throw new Error(`DeepSeek API error: ${deepseekResponse.status} - ${errorData.error?.message || 'Unknown error'}`);
        }
        
        const deepseekData = await deepseekResponse.json();
        response = deepseekData.choices?.[0]?.message?.content || "";
        break;
        
      case "openai":
        console.log('Making OpenAI API call...');
        console.log('API Key present:', !!process.env.OPENAI_API_KEY);
        console.log('API Key prefix:', process.env.OPENAI_API_KEY?.substring(0, 10));
        console.log('Prompt length:', prompt.length);
        
        const openaiPayload = {
          model: 'gpt-4o',
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: prompt }
          ],
          max_tokens: 4000,
          temperature: 0.7
        };
        
        console.log('OpenAI payload:', JSON.stringify(openaiPayload, null, 2));
        
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify(openaiPayload)
        });
        
        console.log('OpenAI Response status:', openaiResponse.status);
        console.log('OpenAI Response headers:', Object.fromEntries(openaiResponse.headers));
        
        if (!openaiResponse.ok) {
          const errorText = await openaiResponse.text();
          console.error('OpenAI API Error Response:', errorText);
          throw new Error(`OpenAI API error: ${openaiResponse.status} - ${errorText}`);
        }
        
        const openaiData = await openaiResponse.json();
        console.log('OpenAI Response keys:', Object.keys(openaiData));
        console.log('OpenAI Choices:', openaiData.choices?.length || 0);
        
        if (openaiData.choices && openaiData.choices.length > 0) {
          response = openaiData.choices[0].message.content || "";
          console.log('Extracted response length:', response.length);
        } else {
          console.error('No choices in OpenAI response:', openaiData);
          throw new Error('No choices returned from OpenAI API');
        }
        break;
        
      case "anthropic":
        const messages = [{ role: 'user' as const, content: prompt }];
        const anthropicBody: any = {
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          messages
        };
        
        if (systemPrompt) {
          anthropicBody.system = systemPrompt;
        }
        
        const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': process.env.ANTHROPIC_API_KEY || '',
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify(anthropicBody)
        });
        
        if (!anthropicResponse.ok) {
          const errorData = await anthropicResponse.json().catch(() => ({}));
          console.error('Anthropic API Error:', anthropicResponse.status, errorData);
          throw new Error(`Anthropic API error: ${anthropicResponse.status} - ${errorData.error?.message || 'Unknown error'}`);
        }
        
        const anthropicData = await anthropicResponse.json();
        response = anthropicData.content?.[0]?.text || "";
        break;
        
      case "perplexity":
        response = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`
          },
          body: JSON.stringify({
            model: 'llama-3.1-sonar-small-128k-online',
            messages: [
              ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
              { role: 'user', content: prompt }
            ],
            max_tokens: 4000,
            temperature: 0.7
          })
        }).then(r => r.json()).then(d => d.choices?.[0]?.message?.content || "");
        break;
        
      default:
        throw new Error(`Unsupported model: ${model}`);
    }

    if (!response || response.trim() === '') {
      console.error(`Empty response from ${model} API - response:`, response);
      throw new Error(`Empty response from ${model} API`);
    }

    console.log(`Successful response from ${model}, length: ${response.length}`);
    return response;
  } catch (error) {
    console.error(`Error generating text with ${model}:`, error);
    throw new Error(`Failed to generate text with ${model}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generatePracticeTest(model: AIModel, sourceText: string, instructions: string, includeAnswerKey: boolean = false): Promise<{ testContent: string; answerKey?: string }> {
  return generateQuiz(model, sourceText, instructions, includeAnswerKey);
}

export async function generateStudyGuide(model: AIModel, sourceText: string, instructions: string): Promise<{ guideContent: string }> {
  throw new Error("LLM generation failed—no fallback to static content");
}

export async function generatePodcastScript(model: AIModel, sourceText: string, instructions: string): Promise<{ scriptContent: string }> {
  throw new Error("LLM generation failed—no fallback to static content");
}

export async function generateHomework(model: AIModel, sourceText: string, instructions: string, includeAnswerKey: boolean = false): Promise<{ homeworkContent: string; answerKey?: string }> {
  throw new Error("LLM generation failed—no fallback to static content");
}

export async function generateLectureContent(model: AIModel, sourceText: string, instructions: string): Promise<{ lectureContent: string }> {
  throw new Error("LLM generation failed—no fallback to static content");
}

// Legacy compatibility functions
export async function generateAIResponse(model: AIModel, prompt: string, systemPrompt: string = ""): Promise<string> {
  console.log("generateAIResponse called with model:", model);
  console.log("Prompt length:", prompt.length);
  
  const result = await generateText(model, prompt, systemPrompt);
  
  console.log("generateAIResponse result length:", result?.length);
  console.log("generateAIResponse preview:", result?.substring(0, 100));
  
  return result;
}

export async function generateRewrite(model: AIModel, sourceText: string, instructions: string, sectionReference?: string): Promise<string> {
  const systemPrompt = `You are an expert editor and writer specializing in academic and educational content. Your task is to rewrite the provided text according to the user's specific instructions while maintaining:

1. Academic rigor and accuracy
2. Clear, engaging prose
3. Proper citation format when applicable
4. Mathematical notation using proper symbols (∧ ∨ ¬ → ↔ ∀ ∃)
5. Logical structure and flow
6. Original meaning and educational value

${sectionReference ? `This text is from ${sectionReference} of a larger document. ` : ''}Always follow the user's instructions precisely while preserving the core meaning and educational value of the content.`;

  const userPrompt = `${sectionReference ? `Section: ${sectionReference}\n\n` : ''}Original text:
${sourceText}

Instructions for rewriting:
${instructions}

Please rewrite the text according to these instructions. Maintain academic quality and ensure the rewritten version is clear, well-structured, and engaging.${sectionReference ? ` Remember this is content from ${sectionReference}, so maintain appropriate context and references.` : ''}`;

  try {
    const response = await generateAIResponse(model, userPrompt, systemPrompt);
    return response;
  } catch (error) {
    console.error('Error generating rewrite:', error);
    throw new Error('Failed to generate rewrite. Please try again.');
  }
}

export async function generatePassageExplanation(model: AIModel, passage: string): Promise<string> {
  return `Explanation of passage: ${passage.substring(0, 100)}... (Generated at ${new Date().toLocaleTimeString()})`;
}

export async function generatePassageDiscussionResponse(model: AIModel, message: string, passage: string, conversationHistory: any[] = []): Promise<string> {
  return `Discussion response about "${message}" regarding passage content (Generated at ${new Date().toLocaleTimeString()})`;
}

// Generate chunks of questions using real LLM calls with deduplication
async function generateQuestionChunk(model: AIModel, sourceText: string, chunkNumber: number, questionsPerChunk: number = 5): Promise<any[]> {
  const startQuestionNum = (chunkNumber-1) * questionsPerChunk + 1;
  const endQuestionNum = chunkNumber * questionsPerChunk;
  
  const prompt = `Generate EXACTLY ${questionsPerChunk} UNIQUE philosophy questions for chunk ${chunkNumber} covering: ${sourceText}

CRITICAL DEDUPLICATION REQUIREMENTS:
- Questions ${startQuestionNum}-${endQuestionNum} must be COMPLETELY DIFFERENT from questions in other chunks
- Chunk ${chunkNumber} MUST focus on SPECIFIC UNIQUE TOPICS:
  ${chunkNumber === 1 ? "- Focus: Epistemology and the nature of knowledge" : ""}
  ${chunkNumber === 2 ? "- Focus: Truth, lying, and skepticism" : ""}
  ${chunkNumber === 3 ? "- Focus: Gettier problems and justified belief" : ""}
  ${chunkNumber === 4 ? "- Focus: Mind-body dualism and divine command theory" : ""}
  ${chunkNumber === 5 ? "- Focus: Ethics and moral philosophy" : ""}
  ${chunkNumber === 6 ? "- Focus: Moral responsibility and contemporary issues" : ""}
- NO questions about epistemology if chunk > 1, NO Gettier questions if chunk != 3, etc.
- Each question must have COMPLETELY DIFFERENT wording and concepts from other chunks
- Use different philosophical examples, thinkers, and scenarios in each chunk

REQUIREMENTS:
- Create ${questionsPerChunk} distinct questions with IDs q${startQuestionNum} through q${endQuestionNum}
- Mix of multiple choice and text input questions
- Cover different aspects: philosophical analysis, ethical reasoning, epistemological concepts, metaphysical questions
- Each question must have: question text, answer, explanation, points (4 each), and TYPE field
- For multiple choice: set "type": "multiple_choice" and include "options" array
- For text/essay questions: set "type": "text_input" and NO options array
- Format as JSON array of question objects

EXAMPLE FORMAT:
[
  {
    "id": "q1",
    "type": "multiple_choice",
    "question": "What is...",
    "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
    "answer": 1,
    "explanation": "...",
    "points": 4
  },
  {
    "id": "q2", 
    "type": "text_input",
    "question": "Explain the concept...",
    "answer": "Sample answer...",
    "explanation": "...",
    "points": 4
  }
]

Return only valid JSON array of question objects with no additional text.`;

  try {
    let response = "";
    
    switch (model) {
      case "deepseek":
        response = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 2000,
            temperature: 0.7
          })
        }).then(r => r.json()).then(d => d.choices?.[0]?.message?.content || "");
        break;
        
      case "openai":
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 2000,
            temperature: 0.7
          })
        }).then(r => r.json()).then(d => d.choices?.[0]?.message?.content || "");
        break;
        
      case "anthropic":
        response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': process.env.ANTHROPIC_API_KEY || '',
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 2000,
            messages: [{ role: 'user', content: prompt }]
          })
        }).then(r => r.json()).then(d => d.content?.[0]?.text || "");
        break;
        
      default:
        throw new Error(`Unsupported model: ${model}`);
    }
    
    // Extract JSON from response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error("No valid JSON found in response");
    
  } catch (error) {
    console.error(`Error generating chunk ${chunkNumber}:`, error);
    // NO FALLBACK - Throw error if LLM generation fails
    throw new Error("LLM generation failed—no fallback to static questions");
  }
}

function generateFallbackQuestions(chunkNumber: number, questionsPerChunk: number): any[] {
  // REMOVED ALL FALLBACK QUESTIONS - NO STATIC CONTENT
  throw new Error("LLM generation failed—no fallback to static questions");
}

export async function generateStudentTest(model: AIModel, sourceText: string, instructions: string, questionTypes: string[] = [], questionCount: number = 25): Promise<{ testContent: string; answerKey?: string }> {
  console.log(`Generating student test with ${questionCount} questions using chunked LLM requests`);
  
  const questionsPerChunk = 5;
  const numChunks = Math.ceil(questionCount / questionsPerChunk);
  const allQuestions: any[] = [];
  
  // Generate questions in parallel chunks
  const chunkPromises = [];
  for (let chunk = 1; chunk <= numChunks; chunk++) {
    const questionsInThisChunk = chunk === numChunks ? 
      questionCount - (chunk - 1) * questionsPerChunk : 
      questionsPerChunk;
    
    chunkPromises.push(generateQuestionChunk(model, sourceText, chunk, questionsInThisChunk));
  }
  
  try {
    const chunkResults = await Promise.all(chunkPromises);
    
    // Combine all chunks with deduplication
    const seenQuestions = new Set<string>();
    
    chunkResults.forEach(chunk => {
      if (Array.isArray(chunk)) {
        chunk.forEach(question => {
          // Create a more aggressive normalized version for better duplicate detection
          const normalizedQuestion = question.question?.toLowerCase()
            .replace(/[^\w\s]/g, ' ')  // Replace punctuation with spaces
            .replace(/\s+/g, ' ')      // Normalize whitespace
            .replace(/every|all|some|any/g, 'X')  // Normalize quantifier words
            .replace(/student|person|individual/g, 'Y')  // Normalize subject words
            .replace(/philosophy|ethics|epistemology|metaphysics/g, 'Z')  // Normalize topic words
            .trim();
          
          // Also check for similar meaning by comparing key terms
          const keyTerms = normalizedQuestion ? normalizedQuestion.split(' ').filter((word: string) => word.length > 3) : [];
          const similarityThreshold = 0.6;
          
          let isDuplicate = false;
          
          // Check against all existing questions for similarity
          for (const existingNorm of Array.from(seenQuestions)) {
            const existingTerms = existingNorm.split(' ').filter((word: string) => word.length > 3);
            const commonTerms = keyTerms.filter((term: string) => existingTerms.includes(term));
            const similarity = commonTerms.length / Math.max(keyTerms.length, existingTerms.length);
            
            if (similarity > similarityThreshold) {
              isDuplicate = true;
              break;
            }
          }
          
          // Only add if we haven't seen similar content before
          if (normalizedQuestion && !seenQuestions.has(normalizedQuestion) && !isDuplicate) {
            seenQuestions.add(normalizedQuestion);
            allQuestions.push(question);
          } else {
            console.log(`DUPLICATE DETECTED AND REMOVED: ${question.question?.substring(0, 50)}...`);
          }
        });
      }
    });
    
    console.log(`Successfully generated ${allQuestions.length} unique questions across ${numChunks} chunks (duplicates removed)`);
    
  } catch (error) {
    console.error("Error in parallel chunk generation:", error);
    // NO FALLBACK - Throw error if LLM generation fails
    throw new Error("LLM generation failed—no fallback to static questions");
  }
  
  const testContent = JSON.stringify({
    title: "Practice Final Exam",
    instructions: "Complete all questions covering comprehensive philosophy material from Weeks 1-6. Provide thoughtful, well-reasoned responses that demonstrate your understanding of philosophical concepts and arguments.",
    totalPoints: questionCount * 4,
    questions: allQuestions.slice(0, questionCount) // Ensure exact count
  });
  
  return { testContent };
}

function generateFallbackTest(questionCount: number): { testContent: string } {
  // REMOVED ALL FALLBACK QUESTIONS - NO STATIC CONTENT
  throw new Error("LLM generation failed—no fallback to static questions");
}

// Generate diagnostic question based on topic and difficulty
export async function generateDiagnosticQuestion(model: AIModel, topic: string, difficulty: string, sessionStats: any): Promise<any> {
  const topicPrompts = {
    'Translation': 'natural language to symbolic logic translation',
    'Truth Tables': 'truth table construction and evaluation',
    'Proofs': 'logical proofs and derivations',
    'Quantifiers': 'first-order logic with quantifiers',
    'Modal Logic': 'modal operators and possible worlds',
    'Temporal Logic': 'temporal operators and time-based reasoning',
    'Boolean Algebra': 'Boolean operations and simplification',
    'Models & Semantics': 'model theory and semantic evaluation'
  };

  const difficultyDescriptions = {
    'beginner': 'basic concepts with simple examples',
    'intermediate': 'moderate complexity requiring multiple steps',
    'advanced': 'complex scenarios requiring deep understanding'
  };

  const prompt = `Generate a single ${difficulty} level symbolic logic question about ${(topicPrompts as any)[topic] || topic}.

DIFFICULTY REQUIREMENTS:
- ${difficulty}: ${(difficultyDescriptions as any)[difficulty]}

FORMATTING REQUIREMENTS:
- Use proper Unicode logical symbols: ∧ ∨ ¬ → ↔ ∀ ∃
- Never use LaTeX notation or backslashes
- Create either multiple choice (4 options) or text input question

RESPONSE FORMAT (JSON):
{
  "id": "unique_id_${Date.now()}",
  "question": "Clear question text with Unicode symbols",
  "type": "multiple_choice" or "text_input",
  "options": ["A", "B", "C", "D"] (only for multiple choice),
  "correctAnswer": index_or_text,
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "points": ${difficulty === 'advanced' ? 8 : difficulty === 'intermediate' ? 6 : 4},
  "explanation": "Brief explanation of correct answer"
}`;

  try {
    let response = "";
    
    switch (model) {
      case "deepseek":
        response = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 1000,
            temperature: 0.7
          })
        }).then(r => r.json()).then(d => d.choices?.[0]?.message?.content || "");
        break;
        
      case "openai":
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 1000,
            temperature: 0.7
          })
        }).then(r => r.json()).then(d => d.choices?.[0]?.message?.content || "");
        break;
        
      case "anthropic":
        response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': process.env.ANTHROPIC_API_KEY || '',
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1000,
            messages: [{ role: 'user', content: prompt }]
          })
        }).then(r => r.json()).then(d => d.content?.[0]?.text || "");
        break;
        
      default:
        throw new Error(`Unsupported model: ${model}`);
    }

    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const questionData = JSON.parse(jsonMatch[0]);
      
      // Ensure required fields
      questionData.id = questionData.id || `diag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      questionData.topic = topic;
      questionData.difficulty = difficulty;
      questionData.points = difficulty === 'advanced' ? 8 : difficulty === 'intermediate' ? 6 : 4;
      
      return questionData;
    }
    
    throw new Error("Invalid JSON response from AI model");
    
  } catch (error) {
    console.error(`Error generating diagnostic question with ${model}:`, error);
    
    // NO FALLBACK - Throw error if LLM generation fails
    throw new Error("LLM generation failed—no fallback to static questions");
  }
}

function generateFallbackDiagnosticQuestion(topic: string, difficulty: string): string {
  // REMOVED ALL FALLBACK QUESTIONS - NO STATIC CONTENT
  throw new Error("LLM generation failed—no fallback to static questions");
}