import express from 'express';
import { storage } from '../storage';

const router = express.Router();

// Submit and grade final exam
router.post('/submit', async (req, res) => {
  try {
    const { examId, userId, answers, selectedEssays, exam, model } = req.body;

    if (!examId || !userId || !answers || !exam) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    // Calculate scores for each section
    let mcScore = 0;
    let mcTotal = 0;
    const mcFeedback: string[] = [];

    // Grade multiple choice automatically
    for (const question of exam.mcQuestions) {
      mcTotal += question.points;
      const userAnswer = answers.mc[question.id];
      if (userAnswer === question.correctAnswer) {
        mcScore += question.points;
        mcFeedback.push(`Q${question.id}: Correct`);
      } else {
        mcFeedback.push(`Q${question.id}: Incorrect (Correct: ${question.correctAnswer})`);
      }
    }

    // Grade short answers using LLM
    let saScore = 0;
    let saTotal = 0;
    const saFeedback: string[] = [];

    for (const question of exam.saQuestions) {
      saTotal += question.points;
      const userAnswer = answers.sa[question.id];
      
      if (userAnswer && userAnswer.trim()) {
        try {
          const gradingPrompt = `Grade this short answer response for a Philosophy 101 final exam.

QUESTION: ${question.question}

MODEL ANSWER: ${question.modelAnswer}

STUDENT ANSWER: ${userAnswer}

Provide a score out of ${question.points} points and brief feedback. Consider:
- Accuracy of content
- Understanding of concepts
- Completeness of response

Respond in this exact format:
SCORE: X/${question.points}
FEEDBACK: [Brief explanation of why this score was given]`;

          const response = await fetch(`${process.env.REPLIT_DOMAIN || 'http://localhost:5000'}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: gradingPrompt,
              model: model || 'deepseek',
              context: 'Short Answer Grading'
            })
          });

          const gradingResult = await response.json();
          
          if (gradingResult.success) {
            const scoreMatch = gradingResult.content.match(/SCORE:\s*(\d+(?:\.\d+)?)/);
            const feedbackMatch = gradingResult.content.match(/FEEDBACK:\s*(.+)/);
            
            if (scoreMatch) {
              const points = parseFloat(scoreMatch[1]);
              saScore += Math.min(points, question.points);
              saFeedback.push(`Q${question.id}: ${points}/${question.points} - ${feedbackMatch?.[1] || 'Good work'}`);
            } else {
              saScore += question.points * 0.7; // Default partial credit
              saFeedback.push(`Q${question.id}: ${(question.points * 0.7).toFixed(1)}/${question.points} - Unable to parse grading, partial credit given`);
            }
          } else {
            saScore += question.points * 0.7; // Default partial credit
            saFeedback.push(`Q${question.id}: ${(question.points * 0.7).toFixed(1)}/${question.points} - Grading error, partial credit given`);
          }
        } catch (error) {
          console.error('Error grading short answer:', error);
          saScore += question.points * 0.5; // Minimal credit for effort
          saFeedback.push(`Q${question.id}: ${(question.points * 0.5).toFixed(1)}/${question.points} - Answer provided, minimal credit`);
        }
      } else {
        saFeedback.push(`Q${question.id}: 0/${question.points} - No answer provided`);
      }
    }

    // Grade essays using LLM
    let essayScore = 0;
    let essayTotal = 0;
    const essayFeedback: string[] = [];

    for (const essayId of selectedEssays) {
      const question = exam.essayQuestions.find((q: any) => q.id === essayId);
      if (question) {
        essayTotal += question.points;
        const userAnswer = answers.essay[question.id];
        
        if (userAnswer && userAnswer.trim()) {
          try {
            const gradingPrompt = `Grade this essay response for a Philosophy 101 final exam.

ESSAY PROMPT: ${question.question}

STUDENT ESSAY: ${userAnswer}

This is worth ${question.points} points. Evaluate based on:
- Clarity of thesis and argument structure
- Understanding of philosophical concepts
- Use of course material and examples
- Critical thinking and analysis
- Writing quality and organization

Provide detailed feedback and a score. Respond in this format:
SCORE: X/${question.points}
FEEDBACK: [Detailed feedback explaining the grade, what was done well, and areas for improvement]`;

            const response = await fetch(`${process.env.REPLIT_DOMAIN || 'http://localhost:5000'}/api/generate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                prompt: gradingPrompt,
                model: model || 'deepseek',
                context: 'Essay Grading'
              })
            });

            const gradingResult = await response.json();
            
            if (gradingResult.success) {
              const scoreMatch = gradingResult.content.match(/SCORE:\s*(\d+(?:\.\d+)?)/);
              const feedbackMatch = gradingResult.content.match(/FEEDBACK:\s*([\s\S]+)/);
              
              if (scoreMatch) {
                const points = parseFloat(scoreMatch[1]);
                essayScore += Math.min(points, question.points);
                essayFeedback.push(`Essay ${question.id}: ${points}/${question.points} - ${feedbackMatch?.[1] || 'Good work'}`);
              } else {
                essayScore += question.points * 0.75; // Default partial credit
                essayFeedback.push(`Essay ${question.id}: ${(question.points * 0.75).toFixed(1)}/${question.points} - Unable to parse grading, partial credit given`);
              }
            } else {
              essayScore += question.points * 0.75; // Default partial credit
              essayFeedback.push(`Essay ${question.id}: ${(question.points * 0.75).toFixed(1)}/${question.points} - Grading error, partial credit given`);
            }
          } catch (error) {
            console.error('Error grading essay:', error);
            essayScore += question.points * 0.6; // Minimal credit for effort
            essayFeedback.push(`Essay ${question.id}: ${(question.points * 0.6).toFixed(1)}/${question.points} - Answer provided, minimal credit`);
          }
        } else {
          essayFeedback.push(`Essay ${question.id}: 0/${question.points} - No answer provided`);
        }
      }
    }

    // Calculate final score
    const totalEarned = mcScore + saScore + essayScore;
    const totalPossible = mcTotal + saTotal + essayTotal;
    const finalPercentage = totalPossible > 0 ? (totalEarned / totalPossible) * 100 : 0;

    // Store exam result
    const examResult = {
      examId,
      userId,
      mcScore,
      saScore,
      essayScore,
      totalScore: totalEarned,
      totalPossible,
      percentage: finalPercentage,
      submittedAt: new Date(),
      answers,
      selectedEssays,
      feedback: {
        mc: mcFeedback,
        sa: saFeedback,
        essay: essayFeedback
      }
    };

    // Save to storage (you may want to implement this in your storage interface)
    // await storage.saveExamResult(examResult);

    res.json({
      success: true,
      score: finalPercentage,
      feedback: {
        'Multiple Choice': `${mcScore}/${mcTotal} points - ${mcFeedback.join(', ')}`,
        'Short Answer': `${saScore.toFixed(1)}/${saTotal} points - ${saFeedback.join(', ')}`,
        'Essays': `${essayScore.toFixed(1)}/${essayTotal} points - ${essayFeedback.join(', ')}`
      },
      details: examResult
    });

  } catch (error) {
    console.error('Error processing exam submission:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process exam submission'
    });
  }
});

export default router;