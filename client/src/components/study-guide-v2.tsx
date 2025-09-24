import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

  const currentGuide = activeTab === 'final' ? finalExamStudyGuide : midtermStudyGuide;

  const generateWeeklyTest = async (weekNumber: number) => {
    const testKey = `${activeTab}-${weekNumber}`;
    setGeneratingTest(testKey);
    
    try {
      const weekData = activeTab === 'final' 
        ? finalExamStudyGuide.weeklyContent[weekNumber - 1]
        : midtermStudyGuide.weeks[weekNumber - 1];

      const objectives = activeTab === 'final' 
        ? weekData.objectives
        : (weekData as any).learningObjectives;

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'weekly-test',
          content: `Generate a 5-question practice test for Week ${weekNumber}: ${weekData.title}. 
          
          Focus on these learning objectives:
          ${objectives.join('\n')}
          
          Include a mix of multiple choice and short answer questions that test understanding of key concepts for the ${activeTab} exam.
          
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
          const parsedContent = JSON.parse(data.content.replace(/```json\n?/, '').replace(/```\n?$/, ''));
          setWeeklyTests(prev => ({ ...prev, [testKey]: parsedContent }));
        } catch (error) {
          setWeeklyTests(prev => ({ ...prev, [testKey]: data.content }));
        }
      }
    } catch (error) {
      console.error('Error generating weekly test:', error);
    } finally {
      setGeneratingTest(null);
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

    setGeneratingTest(testKey);

    try {
      const gradingData = {
        testTitle: test.title,
        questions: test.questions.map((q: any) => ({
          question: q.question,
          type: q.type,
          choices: q.choices,
          userAnswer: testAnswers[`${activeTab}-${weekNumber}_${q.id}`] || 'No answer',
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
          let cleanContent = data.content;
          cleanContent = cleanContent.replace(/```json\s*/g, '').replace(/```\s*/g, '');
          const jsonStart = cleanContent.indexOf('{');
          const jsonEnd = cleanContent.lastIndexOf('}') + 1;
          
          if (jsonStart >= 0 && jsonEnd > jsonStart) {
            cleanContent = cleanContent.substring(jsonStart, jsonEnd);
          }
          
          const gradingResult = JSON.parse(cleanContent);
          const correctCount = gradingResult.results.filter((r: any) => r.isCorrect).length;
          const score = gradingResult.totalScore || Math.round((correctCount / test.questions.length) * 100);
          
          setTestResults(prev => ({ 
            ...prev, 
            [testKey]: {
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
          
          setTestSubmitted(prev => ({ ...prev, [testKey]: true }));
        } catch (error) {
          console.error('Error parsing grading results:', error);
          alert('AI grading failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error submitting test for grading:', error);
      alert('Error grading test. Please try again.');
    } finally {
      setGeneratingTest(null);
    }
  };

  const retakeTest = (weekNumber: number) => {
    const testKey = `${activeTab}-${weekNumber}`;
    const keysToRemove = Object.keys(testAnswers).filter(key => key.startsWith(`${activeTab}-${weekNumber}_`));
    const newAnswers = { ...testAnswers };
    keysToRemove.forEach(key => delete newAnswers[key]);
    
    setTestAnswers(newAnswers);
    setTestSubmitted(prev => ({ ...prev, [testKey]: false }));
    setTestResults(prev => ({ ...prev, [testKey]: null }));
  };

  const weeklyContent = activeTab === 'final' 
    ? finalExamStudyGuide.weeklyContent 
    : midtermStudyGuide.weeks;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Living Study Guide</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Interactive study materials for Philosophy 101. Practice with AI-generated tests 
          and get feedback on essay questions to prepare effectively.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center">
        <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('final')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'final'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Final Exam Study Guide
          </button>
          <button
            onClick={() => setActiveTab('midterm')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'midterm'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Midterm Study Guide
          </button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5" />
            <span>{currentGuide.title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeTab === 'midterm' && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {midtermStudyGuide.description}
              </p>
            )}
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Exam Format</h3>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                {activeTab === 'final' ? (
                  <>
                    <li>• {finalExamStudyGuide.examFormat.multipleChoice}</li>
                    <li>• {finalExamStudyGuide.examFormat.essays}</li>
                    <li>• {finalExamStudyGuide.examFormat.coverage}</li>
                  </>
                ) : (
                  midtermStudyGuide.examFormat.map((format, index) => (
                    <li key={index}>• {format}</li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Content Sections */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Weekly Learning Objectives</h2>
        {weeklyContent.map((week) => {
          const testKey = `${activeTab}-${week.week}`;
          const objectives = activeTab === 'final' 
            ? (week as any).objectives 
            : (week as any).learningObjectives;

          return (
            <Card key={week.week}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>WEEK {week.week} – {week.title}</span>
                  <Button
                    onClick={() => generateWeeklyTest(week.week)}
                    disabled={generatingTest === testKey}
                    className="flex items-center space-x-2"
                  >
                    {generatingTest === testKey ? (
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
                    {objectives.map((objective: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Show generated test if available */}
                {weeklyTests[testKey] && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">Practice Test - Week {week.week}</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generateWeeklyTest(week.week)}
                        disabled={generatingTest === testKey}
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Generate New
                      </Button>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-4 rounded border">
                      {typeof weeklyTests[testKey] === 'object' && weeklyTests[testKey].questions ? (
                        <div className="space-y-4">
                          <div className="mb-4">
                            <h5 className="font-medium text-lg">{weeklyTests[testKey].title}</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{weeklyTests[testKey].instructions}</p>
                          </div>
                          
                          {!testSubmitted[testKey] ? (
                            // Test taking interface
                            <>
                              {weeklyTests[testKey].questions.map((question: any, index: number) => (
                                <div key={question.id || index} className="border-l-4 border-blue-500 pl-4 mb-6">
                                  <p className="font-medium mb-3">{index + 1}. {question.question}</p>
                                  {question.type === 'multiple_choice' && question.choices && (
                                    <div className="space-y-2">
                                      {question.choices.map((choice: string, choiceIndex: number) => {
                                        const optionLetter = String.fromCharCode(65 + choiceIndex);
                                        const isSelected = testAnswers[`${activeTab}-${week.week}_${question.id}`] === optionLetter;
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
                                      value={testAnswers[`${activeTab}-${week.week}_${question.id}`] || ''}
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
                                  disabled={weeklyTests[testKey].questions.some((q: any) => 
                                    !testAnswers[`${activeTab}-${week.week}_${q.id}`]
                                  ) || generatingTest === testKey}
                                >
                                  {generatingTest === testKey ? (
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
                                  Test Complete! Score: {testResults[testKey]?.score}%
                                </h4>
                                <p className="text-sm text-green-700 dark:text-green-300">
                                  You got {testResults[testKey]?.correctCount} out of {testResults[testKey]?.totalQuestions} questions correct.
                                </p>
                              </div>
                              
                              {testResults[testKey]?.results.map((result: any, index: number) => (
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
                          {typeof weeklyTests[testKey] === 'string' 
                            ? weeklyTests[testKey] 
                            : JSON.stringify(weeklyTests[testKey], null, 2)
                          }
                        </pre>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Essay Questions Section */}
      <Card>
        <CardHeader>
          <CardTitle>Essay Practice Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Practice with possible essay questions. Get AI feedback on your responses.
          </p>
          <div className="space-y-6">
            {currentGuide.essayQuestions.map((question, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">{index + 1}. {question}</h4>
                <textarea
                  value={essayAnswers[`${activeTab}-${index}`] || ''}
                  onChange={(e) => setEssayAnswers(prev => ({ ...prev, [`${activeTab}-${index}`]: e.target.value }))}
                  className="w-full min-h-[120px] p-3 border rounded-lg mb-3"
                  placeholder="Write your essay response here..."
                />
                <Button
                  onClick={() => {/* evaluateEssayAnswer(index) */}}
                  disabled={!essayAnswers[`${activeTab}-${index}`]?.trim() || evaluatingEssay === `${activeTab}-${index}`}
                  className="flex items-center space-x-2"
                >
                  {evaluatingEssay === `${activeTab}-${index}` ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      <span>Evaluating...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Get Feedback</span>
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}