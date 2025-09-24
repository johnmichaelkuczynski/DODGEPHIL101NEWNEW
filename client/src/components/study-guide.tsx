import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// import { Textarea } from '@/components/ui/textarea';
import { BookOpen, TestTube, RefreshCw, Clock, CheckCircle } from 'lucide-react';
import { finalExamStudyGuide } from '@shared/study-guide-content';
import { midtermStudyGuide } from '@shared/midterm-study-guide-content';

export function StudyGuideComponent() {
  const [activeTab, setActiveTab] = useState<'final' | 'midterm'>('final');
  const [essayAnswers, setEssayAnswers] = useState<Record<string, string>>({});
  const [weeklyTests, setWeeklyTests] = useState<Record<string, any>>({});
  const [generatingTest, setGeneratingTest] = useState<string | null>(null);
  const [evaluatingEssay, setEvaluatingEssay] = useState<string | null>(null);
  const [essayFeedback, setEssayFeedback] = useState<Record<string, any>>({});
  const [testAnswers, setTestAnswers] = useState<Record<string, string>>({});
  const [testSubmitted, setTestSubmitted] = useState<Record<string, boolean>>({});
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  const generateWeeklyTest = async (weekNumber: number, examType: 'final' | 'midterm' = activeTab) => {
    const testKey = `${examType}-${weekNumber}`;
    setGeneratingTest(testKey);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'weekly-test',
          content: examType === 'final' ? 
            `Generate a 5-question practice test for Week ${weekNumber}: ${finalExamStudyGuide.weeklyContent[weekNumber - 1].title}. 
            
            Focus on these learning objectives:
            ${finalExamStudyGuide.weeklyContent[weekNumber - 1].objectives.join('\n')}
            
            Include a mix of multiple choice and short answer questions that test understanding of key concepts for the final exam.` :
            `Generate a 5-question practice test for Week ${weekNumber}: ${midtermStudyGuide.weeks[weekNumber - 1].title}. 
            
            Focus on these learning objectives:
            ${midtermStudyGuide.weeks[weekNumber - 1].learningObjectives.join('\n')}
            
            Key Topics:
            ${midtermStudyGuide.weeks[weekNumber - 1].keyTopics.join('\n')}
            
            Include a mix of multiple choice and short answer questions that test understanding of key concepts for the midterm exam.`
          + `
          
          Format as JSON with this structure:
          {
            "title": "Week ${weekNumber} Practice Test",
            "instructions": "Complete all questions to test your understanding of this week's material.",
            "questions": [
              {
                "id": "q1",
                "type": "multiple_choice",
                "question": "Question text",
                "choices": ["A", "B", "C", "D"],
                "correct": 0,
                "explanation": "Why this is correct"
              }
            ]
          }`,
          model: 'openai'
        })
      });

      const data = await response.json();
      if (data.success) {
        try {
          // Try to parse JSON if the content is JSON
          const parsedContent = JSON.parse(data.content.replace(/```json\n?/, '').replace(/```\n?$/, ''));
          setWeeklyTests(prev => ({ ...prev, [testKey]: parsedContent }));
        } catch (error) {
          // If not JSON, store as text
          setWeeklyTests(prev => ({ ...prev, [testKey]: data.content }));
        }
      }
    } catch (error) {
      console.error('Error generating weekly test:', error);
    } finally {
      setGeneratingTest(null);
    }
  };

  const evaluateEssayAnswer = async (questionIndex: number) => {
    const essayKey = `${activeTab}-${questionIndex}`;
    if (!essayAnswers[essayKey]?.trim()) return;
    
    setEvaluatingEssay(essayKey);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'essay-evaluation',
          content: `Evaluate this student's practice essay answer for Philosophy 101:

          Question: ${activeTab === 'final' ? finalExamStudyGuide.essayQuestions[questionIndex] : midtermStudyGuide.essayQuestions[questionIndex]}
          
          Student Answer: ${essayAnswers[essayKey]}
          
          Provide constructive feedback in this JSON format:
          {
            "onTrack": true/false,
            "score": "percentage out of 100",
            "strengths": ["strength 1", "strength 2"],
            "improvements": ["improvement 1", "improvement 2"],
            "suggestions": "Specific suggestions for improvement",
            "keyPointsMissed": ["missing point 1", "missing point 2"]
          }`,
          model: 'openai'
        })
      });

      const data = await response.json();
      if (data.success) {
        try {
          const parsedFeedback = JSON.parse(data.content.replace(/```json\n?/, '').replace(/```\n?$/, ''));
          setEssayFeedback(prev => ({ ...prev, [essayKey]: parsedFeedback }));
        } catch (error) {
          setEssayFeedback(prev => ({ ...prev, [essayKey]: { 
            onTrack: false, 
            score: "Unable to parse feedback",
            feedback: data.content 
          } }));
        }
      }
    } catch (error) {
      console.error('Error evaluating essay:', error);
    } finally {
      setEvaluatingEssay(null);
    }
  };

  const handleAnswerSelect = (weekNumber: number, questionId: string, answer: string) => {
    const answerKey = `${activeTab}-${weekNumber}_${questionId}`;
    setTestAnswers(prev => ({ ...prev, [answerKey]: answer }));
  };

  const submitTest = async (weekNumber: number) => {
    const testKey = `${activeTab}-${weekNumber}`;
    const test = weeklyTests[testKey];
    if (!test || !test.questions) return;

    setGeneratingTest(testKey); // Use this to show loading state

    try {
      // Prepare grading request for AI
      const gradingData = {
        testTitle: test.title,
        questions: test.questions.map((q: any) => ({
          question: q.question,
          type: q.type,
          choices: q.choices,
          userAnswer: testAnswers[`${weekNumber}_${q.id}`] || 'No answer',
          explanation: q.explanation
        }))
      };

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'test-grading',
          content: `You are grading a philosophy practice test. You must respond ONLY with valid JSON, no additional text.

Test: ${test.title}

Questions and Student Answers:
${gradingData.questions.map((q, i) => `
Question ${i + 1}: ${q.question}
${q.type === 'multiple_choice' ? `Options: ${q.choices?.map((choice: string, idx: number) => `${String.fromCharCode(65 + idx)}. ${choice}`).join(', ')}` : ''}
Student Answer: ${q.userAnswer}
Expected/Explanation: ${q.explanation || 'Use your philosophical knowledge'}
`).join('\n')}

CRITICAL: Respond ONLY with this exact JSON format, no extra text:
{
  "results": [
    {
      "questionNumber": 1,
      "isCorrect": true,
      "correctAnswer": "A. The correct option text",
      "feedback": "Brief explanation why this is right/wrong",
      "userAnswer": "Student's actual answer"
    }
  ],
  "totalScore": 85
}`,
          model: 'openai'
        })
      });

      const data = await response.json();
      if (data.success) {
        try {
          // Clean up the response content more thoroughly
          let cleanContent = data.content;
          
          // Remove code blocks
          cleanContent = cleanContent.replace(/```json\s*/g, '').replace(/```\s*/g, '');
          
          // Remove any leading/trailing text that isn't JSON
          const jsonStart = cleanContent.indexOf('{');
          const jsonEnd = cleanContent.lastIndexOf('}') + 1;
          
          if (jsonStart >= 0 && jsonEnd > jsonStart) {
            cleanContent = cleanContent.substring(jsonStart, jsonEnd);
          }
          
          console.log('Attempting to parse:', cleanContent);
          const gradingResult = JSON.parse(cleanContent);
          
          if (!gradingResult.results || !Array.isArray(gradingResult.results)) {
            throw new Error('Invalid response format - missing results array');
          }
          
          const correctCount = gradingResult.results.filter((r: any) => r.isCorrect).length;
          const score = gradingResult.totalScore || Math.round((correctCount / test.questions.length) * 100);
          
          setTestResults(prev => ({ 
            ...prev, 
            [weekNumber]: {
              score,
              correctCount,
              totalQuestions: test.questions.length,
              results: gradingResult.results.map((result: any, index: number) => ({
                question: test.questions[index].question,
                userAnswer: result.userAnswer,
                correctAnswer: result.correctAnswer,
                isCorrect: result.isCorrect,
                explanation: result.feedback
              }))
            }
          }));
          
          setTestSubmitted(prev => ({ ...prev, [weekNumber]: true }));
        } catch (error) {
          console.error('Error parsing grading results:', error, 'Raw content:', data.content);
          
          // Fallback: Create manual results if AI response fails
          const fallbackResults = test.questions.map((question: any, index: number) => ({
            question: question.question,
            userAnswer: testAnswers[`${weekNumber}_${question.id}`] || 'No answer',
            correctAnswer: 'Unable to determine - AI grading failed',
            isCorrect: false,
            explanation: 'The AI grading system encountered an error. Please try again or contact support.'
          }));
          
          setTestResults(prev => ({ 
            ...prev, 
            [weekNumber]: {
              score: 0,
              correctCount: 0,
              totalQuestions: test.questions.length,
              results: fallbackResults
            }
          }));
          
          setTestSubmitted(prev => ({ ...prev, [weekNumber]: true }));
          alert('AI grading failed. Results show as incorrect, but please try submitting again.');
        }
      } else {
        alert('Error grading test. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting test for grading:', error);
      alert('Error grading test. Please try again.');
    } finally {
      setGeneratingTest(null);
    }
  };

  const retakeTest = (weekNumber: number) => {
    // Clear answers and results for this test
    const keysToRemove = Object.keys(testAnswers).filter(key => key.startsWith(`${weekNumber}_`));
    const newAnswers = { ...testAnswers };
    keysToRemove.forEach(key => delete newAnswers[key]);
    
    setTestAnswers(newAnswers);
    setTestSubmitted(prev => ({ ...prev, [weekNumber]: false }));
    setTestResults(prev => ({ ...prev, [weekNumber]: null }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5" />
            <span>{finalExamStudyGuide.title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Exam Format</h3>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• {finalExamStudyGuide.examFormat.multipleChoice}</li>
                <li>• {finalExamStudyGuide.examFormat.essays}</li>
                <li>• {finalExamStudyGuide.examFormat.coverage}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Content Sections */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Weekly Learning Objectives</h2>
        {finalExamStudyGuide.weeklyContent.map((week) => (
          <Card key={week.week}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>WEEK {week.week} – {week.title}</span>
                <Button
                  onClick={() => generateWeeklyTest(week.week)}
                  disabled={generatingTest === week.week}
                  className="flex items-center space-x-2"
                >
                  {generatingTest === week.week ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <TestTube className="w-4 h-4" />
                      <span>Test Me</span>
                    </>
                  )}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="font-medium text-sm">You must be able to:</p>
                <ul className="space-y-2 text-sm">
                  {week.objectives.map((objective, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
                
                {/* Show generated test if available */}
                {weeklyTests[week.week] && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">Practice Test - Week {week.week}</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generateWeeklyTest(week.week)}
                        disabled={generatingTest === week.week}
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Generate New
                      </Button>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-4 rounded border">
                      {typeof weeklyTests[week.week] === 'object' && weeklyTests[week.week].questions ? (
                        <div className="space-y-4">
                          <div className="mb-4">
                            <h5 className="font-medium text-lg">{weeklyTests[week.week].title}</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{weeklyTests[week.week].instructions}</p>
                          </div>
                          
                          {!testSubmitted[week.week] ? (
                            // Test taking interface
                            <>
                              {weeklyTests[week.week].questions.map((question: any, index: number) => (
                                <div key={question.id || index} className="border-l-4 border-blue-500 pl-4 mb-6">
                                  <p className="font-medium mb-3">{index + 1}. {question.question}</p>
                                  {question.type === 'multiple_choice' && question.choices && (
                                    <div className="space-y-2">
                                      {question.choices.map((choice: string, choiceIndex: number) => {
                                        const optionLetter = String.fromCharCode(65 + choiceIndex);
                                        const isSelected = testAnswers[`${week.week}_${question.id}`] === optionLetter;
                                        return (
                                          <button
                                            key={choiceIndex}
                                            onClick={() => handleAnswerSelect(week.week, question.id, optionLetter)}
                                            className={`w-full text-left p-3 rounded border transition-colors ${
                                              isSelected 
                                                ? 'bg-blue-100 border-blue-500 text-blue-800' 
                                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                            }`}
                                          >
                                            <span className="font-medium mr-2">{optionLetter}.</span>
                                            {choice}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}
                                  {question.type === 'short_answer' && (
                                    <textarea
                                      value={testAnswers[`${week.week}_${question.id}`] || ''}
                                      onChange={(e) => handleAnswerSelect(week.week, question.id, e.target.value)}
                                      className="w-full p-3 border rounded-lg min-h-[80px]"
                                      placeholder="Type your answer here..."
                                    />
                                  )}
                                </div>
                              ))}
                              
                              <div className="flex space-x-2 pt-4 border-t">
                                <Button
                                  onClick={() => submitTest(week.week)}
                                  className="flex items-center space-x-2"
                                  disabled={weeklyTests[week.week].questions.some((q: any) => 
                                    !testAnswers[`${week.week}_${q.id}`]
                                  ) || generatingTest === week.week}
                                >
                                  {generatingTest === week.week ? (
                                    <>
                                      <Clock className="w-4 h-4 animate-spin" />
                                      <span>Grading...</span>
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="w-4 h-4" />
                                      <span>Submit Test</span>
                                    </>
                                  )}
                                </Button>
                              </div>
                            </>
                          ) : (
                            // Test results interface
                            <div className="space-y-4">
                              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                                  Test Complete! Score: {testResults[week.week]?.score}%
                                </h4>
                                <p className="text-sm text-green-700 dark:text-green-300">
                                  You got {testResults[week.week]?.correctCount} out of {testResults[week.week]?.totalQuestions} questions correct.
                                </p>
                              </div>
                              
                              {testResults[week.week]?.results.map((result: any, index: number) => (
                                <div key={index} className="border rounded-lg p-4">
                                  <p className="font-medium mb-2">{index + 1}. {result.question}</p>
                                  <div className="space-y-1 text-sm">
                                    <div className={`p-2 rounded ${result.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                      <strong>Your answer:</strong> {result.userAnswer}
                                      {result.isCorrect ? ' ✓' : ' ✗'}
                                    </div>
                                    {!result.isCorrect && (
                                      <div className="p-2 bg-blue-100 text-blue-800 rounded">
                                        <strong>Correct answer:</strong> {result.correctAnswer}
                                      </div>
                                    )}
                                    {result.explanation && (
                                      <div className="p-2 bg-gray-100 text-gray-700 rounded">
                                        <strong>Explanation:</strong> {result.explanation}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                              
                              <div className="flex space-x-2 pt-4 border-t">
                                <Button
                                  onClick={() => retakeTest(week.week)}
                                  variant="outline"
                                  className="flex items-center space-x-2"
                                >
                                  <RefreshCw className="w-4 h-4" />
                                  <span>Retake Test</span>
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <pre className="whitespace-pre-wrap text-sm">
                          {typeof weeklyTests[week.week] === 'string' 
                            ? weeklyTests[week.week] 
                            : JSON.stringify(weeklyTests[week.week], null, 2)
                          }
                        </pre>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Essay Questions Section */}
      <Card>
        <CardHeader>
          <CardTitle>Possible Final Exam Essay Questions</CardTitle>
          <p className="text-sm text-muted-foreground">
            Two or three will appear; you will write on one or two. Practice writing answers below and get AI feedback.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {finalExamStudyGuide.essayQuestions.map((question, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="mb-3">
                  <Badge variant="outline" className="mb-2">Question {index + 1}</Badge>
                  <p className="text-sm font-medium">{question}</p>
                </div>
                
                <div className="space-y-3">
                  <textarea
                    placeholder="Write your practice essay answer here..."
                    value={essayAnswers[index] || ''}
                    onChange={(e) => setEssayAnswers(prev => ({ ...prev, [index]: e.target.value }))}
                    className="min-h-[120px] w-full p-3 border rounded-lg"
                  />
                  
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => evaluateEssayAnswer(index)}
                      disabled={!essayAnswers[index]?.trim() || evaluatingEssay === index}
                      className="flex items-center space-x-2"
                    >
                      {evaluatingEssay === index ? (
                        <>
                          <Clock className="w-4 h-4 animate-spin" />
                          <span>Evaluating...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>Check Answer</span>
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {/* Show feedback if available */}
                  {essayFeedback[index] && (
                    <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant={essayFeedback[index].onTrack ? "default" : "destructive"}>
                          {essayFeedback[index].onTrack ? "On Track" : "Needs Work"}
                        </Badge>
                        <span className="text-sm font-medium">Score: {essayFeedback[index].score}</span>
                      </div>
                      
                      <div className="text-sm space-y-2">
                        {essayFeedback[index].strengths?.length > 0 && (
                          <div>
                            <p className="font-medium text-green-700 dark:text-green-300">Strengths:</p>
                            <ul className="list-disc list-inside text-green-600 dark:text-green-400">
                              {essayFeedback[index].strengths.map((strength: string, i: number) => (
                                <li key={i}>{strength}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {essayFeedback[index].improvements?.length > 0 && (
                          <div>
                            <p className="font-medium text-orange-700 dark:text-orange-300">Areas for Improvement:</p>
                            <ul className="list-disc list-inside text-orange-600 dark:text-orange-400">
                              {essayFeedback[index].improvements.map((improvement: string, i: number) => (
                                <li key={i}>{improvement}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {essayFeedback[index].suggestions && (
                          <div>
                            <p className="font-medium text-blue-700 dark:text-blue-300">Suggestions:</p>
                            <p className="text-blue-600 dark:text-blue-400">{essayFeedback[index].suggestions}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}