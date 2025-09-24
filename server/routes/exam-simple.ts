// Simple exam generation endpoint - rebuilt from scratch
import express from 'express';
import { bookContent } from '../../shared/book-content.js';

const router = express.Router();

router.post('/generate-simple', async (req, res) => {
  try {
    const { weekNumber, examType, aiModel = 'deepseek' } = req.body;
    
    if (!weekNumber || !examType) {
      return res.status(400).json({
        success: false,
        error: 'weekNumber and examType are required'
      });
    }

    console.log(`Generating ${examType} for week ${weekNumber} using ${aiModel}`);

    // Simple exam prompt based on type
    let examTitle = '';
    let questionCount = 5;
    let points = 50;

    if (examType === 'midterm') {
      examTitle = 'Practice Midterm Exam';
      questionCount = 10;
      points = 100;
    } else if (examType === 'final') {
      examTitle = 'Practice Final Exam';
      questionCount = 15;
      points = 150;
    } else {
      examTitle = `Week ${weekNumber} Practice Quiz`;
      questionCount = 5;
      points = 50;
    }

    // Use the SPECIFIC course content provided by the user
    const actualCourseContent = `
WEEK 1-4 COURSE CONTENT (The ONLY content to test):

Discussion 1: Branches of Philosophy
- Epistemology: The study of knowledge (What is knowledge? How does one acquire knowledge? What is knowable? What cannot be known?)
- Metaphysics: The study of existence (What is the nature of reality? What kinds of things exist? What natural laws exist? What is identity?)
- Ethics: The study of moral good and how we ought to live (What is good? What is bad? Are there universal moral truths? What makes a person good? What should I do?)
- Assignment: Choose a branch, create an original philosophical question, explain why it belongs to that branch
- Example: "Do virtual reality experiences produce genuine knowledge?" (Epistemology)

Essay 1: The Allegory of the Cave (Plato)
- Cave allegory: Prisoners chained in cave, only see shadows on wall
- Fire behind prisoners casts shadows of objects carried by puppet-masters
- One prisoner escapes, sees real world, returns to tell others
- Other prisoners reject escapee's claims, threaten violence
- Key concepts: Relationship between shadows and reality, knowledge vs. belief, difficulty of enlightening others
- Assignment: Summarize cave allegory, analyze how captives form beliefs, evaluate if escapee gains knowledge, create method to convince captives aliens exist using shadows

Discussion 2: Truth-telling, Lying, Bullshit (Frankfurt)
Frankfurt's three speech types:
- Truth-telling: Saying "x", believing "x" is true, wanting others to believe "x" is true
- Lying: Saying "x", believing "x" is false, wanting others to believe "x" is true  
- Bullshit: Saying "x", wanting others to believe "y" or do "z", where y/z are unrelated to "x"
- Key distinction: Liars care about truth (want to hide it), bullshitters don't care about truth at all

Essay 2: Skepticism
- Skepticism: Questions whether we can truly know things
- Radical skepticism: Claims we cannot know anything with certainty
- Doubts everything: sensory information, existence of other people, basic logical truths
- Assignment: Define skepticism, describe living as a radical skeptic, present argument against radical skepticism
- Key concepts: Practical impossibility of living as radical skeptic, pragmatic responses to skepticism
`;
    
    let courseContent = actualCourseContent;

    const prompt = `Generate a ${examType} exam for Week ${weekNumber} Philosophy 101.

SPECIFIC COURSE CONTENT TO TEST (NOTHING ELSE):
"""
${courseContent}
"""

CRITICAL REQUIREMENTS:
- Create exactly ${questionCount} questions based ONLY on the specific content above
- Questions must test: Branches of Philosophy, Plato's Cave Allegory, Frankfurt's Truth/Lying/Bullshit categories, Radical Skepticism
- NO generic philosophy questions - ONLY about the specific readings and concepts provided
- NO questions about philosophers not mentioned (no Kant, Descartes, Aristotle, etc. unless specifically in the content)
- Mix of multiple choice and short answer questions  
- Total points: ${points}
- Return valid JSON format only

EXACT FORMAT REQUIRED:
{
  "title": "${examTitle}",
  "instructions": "${weekNumber === 6 ? 'Complete all questions thoughtfully. This final exam covers all course content.' : `Complete all questions thoughtfully. All questions are based on Week ${weekNumber} readings and content.`}",
  "totalPoints": ${points},
  "problems": [
    {
      "id": "problem_1",
      "title": "Multiple Choice Questions",
      "points": 40,
      "type": "multiple_choice",
      "questions": [
        {
          "id": "q1",
          "question": "Question text here based on course content?",
          "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
          "correct": 0,
          "explanation": "Explanation referring to specific course content"
        }
      ]
    },
    {
      "id": "problem_2", 
      "title": "Short Answer Questions",
      "points": ${points - 40},
      "type": "text_input",
      "questions": [
        {
          "id": "q${Math.ceil(questionCount/2) + 1}",
          "question": "Essay question about specific concepts from Week ${weekNumber} readings?",
          "explanation": "Strong answer includes key concepts from the course content"
        }
      ]
    }
  ]
}

Generate questions that test understanding ONLY of:
1. The three branches of philosophy (epistemology, metaphysics, ethics) and their definitions
2. Plato's Allegory of the Cave (prisoners, shadows, fire, escape, return)  
3. Frankfurt's categories (truth-telling, lying, bullshit) and their definitions
4. Radical skepticism and its practical problems

NO OTHER PHILOSOPHICAL CONTENT ALLOWED.`;

    // Use the existing AI service to handle different models
    let examContent = "";
    const timeoutMs = examType === 'final' ? 90000 : 45000; // 90 seconds for finals, 45 for others
    
    try {
      switch (aiModel) {
        case "deepseek":
          if (!process.env.DEEPSEEK_API_KEY) {
            throw new Error('DeepSeek API key not configured');
          }
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
          
          const deepseekResponse = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
              model: 'deepseek-chat',
              messages: [
                {
                  role: 'system',
                  content: 'You are a philosophy professor. Generate exam questions in valid JSON format only. No markdown, no code blocks, just pure JSON.'
                },
                {
                  role: 'user',
                  content: prompt
                }
              ],
              max_tokens: 2000,
              temperature: 0.7
            })
          });
          
          clearTimeout(timeoutId);
          
          if (!deepseekResponse.ok) {
            throw new Error(`DeepSeek API error: ${deepseekResponse.status}`);
          }
          
          const deepseekData = await deepseekResponse.json();
          examContent = deepseekData.choices?.[0]?.message?.content || "";
          break;
          
        case "openai":
        default:
          if (!process.env.OPENAI_API_KEY) {
            throw new Error('OpenAI API key not configured');
          }
          
          const openaiController = new AbortController();
          const openaiTimeoutMs = examType === 'final' ? 90000 : 45000;
          const openaiTimeoutId = setTimeout(() => openaiController.abort(), openaiTimeoutMs);
          
          const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            signal: openaiController.signal,
            headers: {
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'gpt-4o',
              messages: [
                {
                  role: 'system',
                  content: 'You are a philosophy professor. Generate exam questions in valid JSON format only. No markdown, no code blocks, just pure JSON.'
                },
                {
                  role: 'user',
                  content: prompt
                }
              ],
              temperature: 0.7,
              max_tokens: 2000
            })
          });
          
          clearTimeout(openaiTimeoutId);
          
          if (!openaiResponse.ok) {
            throw new Error(`OpenAI API error: ${openaiResponse.status}`);
          }
          
          const openaiData = await openaiResponse.json();
          examContent = openaiData.choices[0].message.content;
          break;
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Generation timeout after ${timeoutMs / 1000} seconds`);
      }
      throw error;
    }

    console.log('Raw OpenAI response:', examContent);

    // Parse JSON response
    let examData;
    try {
      examData = JSON.parse(examContent);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Invalid JSON response from AI');
    }

    // Always transform to expected format
    console.log('Transforming exam data to expected format...');
    const transformedProblems = examData.problems.map((problem: any, index: number) => {
      const isMultipleChoice = problem.type === 'multiple_choice';
      return {
        id: `problem_${index + 1}`,
        title: isMultipleChoice ? 'Multiple Choice Questions' : 'Short Answer Questions',
        points: isMultipleChoice ? Math.ceil(examData.totalPoints * 0.6) : Math.floor(examData.totalPoints * 0.4),
        type: problem.type === 'short_answer' ? 'text_input' : problem.type,
        questions: problem.questions.map((q: any) => ({
          id: q.id,
          question: q.question,
          options: q.options,
          correct: q.correctAnswer,
          explanation: q.explanation
        }))
      };
    });
    
    examData.problems = transformedProblems;
    console.log('Transformed exam data:', JSON.stringify(examData, null, 2));

    res.json({
      success: true,
      exam: examData
    });

  } catch (error) {
    console.error('Exam generation error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate exam'
    });
  }
});

export default router;