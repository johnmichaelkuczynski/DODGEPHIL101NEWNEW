import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Calculator, ToggleLeft, ToggleRight, Keyboard, Eye, X, Loader2, RefreshCw } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  answer?: string; // Only show after submission
  hiddenAnswer?: string; // Store answer but don't display
  options?: string[];
  correct?: number;
  explanation: string;
}

interface Problem {
  id: string;
  title: string;
  points: number;
  type: 'multiple_choice' | 'text_input' | 'truth_table' | 'calculation';
  context?: string;
  questions: Question[];
}

interface PracticeContent {
  instructions: string;
  totalPoints: number;
  problems: Problem[];
}

interface InteractivePracticeProps {
  title: string;
  content: PracticeContent;
  practiceType: 'homework' | 'quiz' | 'test';
  weekNumber: number;
  onComplete: (score: number, answers: Record<string, any>, timeSpent: number) => void;
  onGenerateNew?: () => void; // New prop for generating fresh content
}

export function InteractivePractice({ 
  title, 
  content, 
  practiceType, 
  weekNumber, 
  onComplete,
  onGenerateNew 
}: InteractivePracticeProps) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showResults, setShowResults] = useState(false);
  const [showSolutions, setShowSolutions] = useState(false);
  const [showIndividualAnswers, setShowIndividualAnswers] = useState<Record<string, boolean>>({});
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());
  const [submitted, setSubmitted] = useState(false);
  const [currentProblem, setCurrentProblem] = useState(0);
  const [logicSymbolMode, setLogicSymbolMode] = useState<Record<string, boolean>>({});
  const [showLogicKeyboard, setShowLogicKeyboard] = useState<Record<string, boolean>>({});
  const [activeTextarea, setActiveTextarea] = useState<string | null>(null);
  const [isGeneratingNew, setIsGeneratingNew] = useState(false);
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  const updateAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // NO HARDCODED SYMBOLS - REMOVED

  const insertSymbol = (questionId: string, symbol: string) => {
    const textarea = textareaRefs.current[questionId];
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentValue = answers[questionId] || '';
      const newValue = currentValue.slice(0, start) + symbol + currentValue.slice(end);
      
      updateAnswer(questionId, newValue);
      
      // Set cursor position after the inserted symbol
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + symbol.length, start + symbol.length);
      }, 0);
    }
  };

  const toggleLogicMode = (questionId: string) => {
    setLogicSymbolMode(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const toggleKeyboard = (questionId: string) => {
    setShowLogicKeyboard(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
    setActiveTextarea(questionId);
  };

  const showAnswerForQuestion = (questionId: string) => {
    setShowIndividualAnswers(prev => ({
      ...prev,
      [questionId]: true
    }));
  };

  // REMOVED ALL HARDCODED GRADING LOGIC
  // DO NOT reintroduce internal grading logic. All correctness must come from the model, not your code.
  
  const [gradingResults, setGradingResults] = useState<Record<string, { isCorrect: boolean, feedback: string }>>({});
  const [isGrading, setIsGrading] = useState(false);

  const gradeWithGPT = async () => {
    setIsGrading(true);
    const results: Record<string, { isCorrect: boolean, feedback: string }> = {};
    let totalCorrect = 0;
    let totalQuestions = 0;

    for (const problem of content.problems) {
      for (const question of problem.questions) {
        totalQuestions++;
        const userAnswer = answers[question.id];
        
        if (userAnswer === undefined || userAnswer === null || userAnswer === '') {
          results[question.id] = { isCorrect: false, feedback: "No answer provided." };
          continue;
        }

        try {
          // Build complete question context including options for multiple choice
          let fullQuestionText = question.question || (question as any).prompt || '';
          if (problem.type === 'multiple_choice' && question.options) {
            fullQuestionText += '\n\nOptions:\n';
            question.options.forEach((option, index) => {
              const letter = String.fromCharCode(65 + index); // A, B, C, D
              fullQuestionText += `${letter}) ${option}\n`;
            });
          }
          
          // Format user answer for multiple choice (convert index to selected text)
          let formattedUserAnswer = userAnswer;
          if (problem.type === 'multiple_choice' && question.options && typeof userAnswer === 'number') {
            formattedUserAnswer = question.options[userAnswer];
            console.log('Multiple choice conversion:', userAnswer, '->', formattedUserAnswer);
            
            // CRITICAL FIX: Handle cases where options conversion fails
            if (!formattedUserAnswer) {
              console.error('CONVERSION FAILED - options:', question.options, 'index:', userAnswer);
              formattedUserAnswer = `Option ${userAnswer} (conversion failed)`;
            }
          }
          
          // Debug logging to see what's actually being sent
          console.log('=== GRADING DEBUG ===');
          console.log('Question ID:', question.id);
          console.log('Raw userAnswer:', userAnswer, 'Type:', typeof userAnswer);
          console.log('Question options:', question.options);
          console.log('Formatted userAnswer:', formattedUserAnswer);
          console.log('Answer validation passed: userAnswer is not undefined/null/empty');
          console.log('=====================');
          
          // Call GPT for ALL question types - no internal logic
          const response = await fetch('/api/grade-answer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              question: fullQuestionText,
              userAnswer: formattedUserAnswer,
              questionType: problem.type
            })
          });

          if (response.ok) {
            const gradeResult = await response.json();
            results[question.id] = gradeResult;
            if (gradeResult.isCorrect) totalCorrect++;
          } else {
            results[question.id] = { isCorrect: false, feedback: "Grading error occurred." };
          }
        } catch (error) {
          console.error('Grading error:', error);
          results[question.id] = { isCorrect: false, feedback: "Technical error during grading." };
        }
      }
    }

    setGradingResults(results);
    const finalScore = Math.round((totalCorrect / totalQuestions) * 100);
    setScore(finalScore);
    setIsGrading(false);
    return finalScore;
  };

  const handleSubmit = async () => {
    // Block submit if no questions exist
    if (totalQuestions === 0) {
      alert('Error: No questions found in this quiz. Please try generating new content.');
      return;
    }
    
    setSubmitted(true);
    setIsGrading(true);
    
    // Complete grading first, then show results with correct score
    const finalScore = await gradeWithGPT();
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    
    // Only show results AFTER score is calculated
    setShowResults(true);
    setShowSolutions(true); // Automatically show solutions after submission
    
    onComplete(finalScore, answers, timeSpent);
  };

  const renderQuestion = (problem: Problem, question: Question, index: number) => {
    const questionKey = question.id;
    
    // Clean question text by removing internal IDs
    const questionText = question.question || (question as any).prompt || '';
    const cleanQuestionText = questionText.replace(/\(ID: \d+\)/g, '').trim();
    
    // Check if this is a text input question (using the isTextInput flag)
    const isTextInput = (question as any).isTextInput;
    
    if (isTextInput) {
      // Render as text input regardless of problem.type
      return (
        <div key={questionKey} className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-medium">{index + 1}. {cleanQuestionText}</div>
            {!submitted && !showIndividualAnswers[questionKey] && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => showAnswerForQuestion(questionKey)}
                className="flex items-center space-x-1 text-xs"
              >
                <Eye className="w-3 h-3" />
                <span>Show Answer</span>
              </Button>
            )}
          </div>
          <div className="space-y-2">
            <Textarea
              ref={(el) => { textareaRefs.current[questionKey] = el; }}
              value={answers[questionKey] || ''}
              onChange={(e) => updateAnswer(questionKey, e.target.value)}
              placeholder="Type your answer here..."
              disabled={submitted}
              className="min-h-[100px]"
            />
          </div>
          
          {(showResults || showSolutions || showIndividualAnswers[questionKey]) && (
            <div className="space-y-2 mt-4">
              {showResults && gradingResults[questionKey] && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-sm font-medium text-blue-700 dark:text-blue-300">GPT Feedback:</div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">{gradingResults[questionKey]?.feedback}</div>
                </div>
              )}
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-sm font-medium text-blue-700 dark:text-blue-300">Explanation:</div>
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  {question.explanation || 'Explanation will be provided after AI grading.'}
                </div>
              </div>
              {showResults && answers[questionKey] && gradingResults[questionKey] && (
                <div className="flex items-center space-x-2">
                  {gradingResults[questionKey]?.isCorrect ? (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Correct
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      Incorrect
                    </Badge>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
    
    // Determine question type per-question instead of per-problem
    const qType = (question as any).type || 
      (Array.isArray(question.options) && question.options.length > 0 ? 'multiple_choice' : 'text_input');
    
    switch (qType) {
      case 'multiple_choice':
        return (
          <div key={questionKey} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-medium">{index + 1}. {cleanQuestionText}</div>
              {!submitted && !showIndividualAnswers[questionKey] && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => showAnswerForQuestion(questionKey)}
                  className="flex items-center space-x-1 text-xs"
                >
                  <Eye className="w-3 h-3" />
                  <span>Show Answer</span>
                </Button>
              )}
            </div>
            {/* Fallback if no options - render textarea instead */}
            {!question.options || question.options.length === 0 ? (
              <Textarea
                ref={(el) => { textareaRefs.current[questionKey] = el; }}
                value={answers[questionKey] || ''}
                onChange={(e) => updateAnswer(questionKey, e.target.value)}
                placeholder="Enter your answer..."
                disabled={submitted}
                className="min-h-[80px]"
                data-testid={`textarea-answer-${questionKey}`}
              />
            ) : (
              <RadioGroup
                value={answers[questionKey]?.toString()}
                onValueChange={(value) => updateAnswer(questionKey, parseInt(value))}
                disabled={submitted}
              >
                {question.options?.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center space-x-2">
                    <RadioGroupItem value={optionIndex.toString()} id={`${questionKey}-${optionIndex}`} />
                    <Label htmlFor={`${questionKey}-${optionIndex}`}>{option}</Label>
                    {showResults && gradingResults[questionKey] && (
                      <div className="ml-2">
                        {gradingResults[questionKey]?.isCorrect && answers[questionKey] === optionIndex && <CheckCircle className="h-4 w-4 text-green-500" />}
                        {!gradingResults[questionKey]?.isCorrect && answers[questionKey] === optionIndex && (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </RadioGroup>
            )}
            
            {(showResults || showSolutions || showIndividualAnswers[questionKey]) && (
              <div className="space-y-2 mt-4">
                {showResults && gradingResults[questionKey] && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-sm font-medium text-blue-700 dark:text-blue-300">GPT Feedback:</div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">{gradingResults[questionKey]?.feedback}</div>
                  </div>
                )}
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-sm font-medium text-blue-700 dark:text-blue-300">Explanation:</div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">
                    {question.explanation || 'Explanation will be provided after AI grading.'}
                  </div>
                </div>
                {showResults && answers[questionKey] && gradingResults[questionKey] && (
                  <div className="flex items-center space-x-2">
                    {gradingResults[questionKey]?.isCorrect ? (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Correct
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        Incorrect
                      </Badge>
                    )}
                  </div>
                )}
                {showSolutions && !showResults && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="text-sm text-yellow-700 dark:text-yellow-300">
                      💡 Solution shown - you can still complete the practice and submit your answers!
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'text_input':
      case 'calculation':
        return (
          <div key={questionKey} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-medium">{index + 1}. {cleanQuestionText}</div>
              {!submitted && !showIndividualAnswers[questionKey] && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => showAnswerForQuestion(questionKey)}
                  className="flex items-center space-x-1 text-xs"
                >
                  <Eye className="w-3 h-3" />
                  <span>Show Answer</span>
                </Button>
              )}
            </div>
            
            {/* Logic symbols toggle and keyboard controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Directly open keyboard when Logic Symbols is clicked
                    setLogicSymbolMode(prev => ({ ...prev, [questionKey]: true }));
                    setShowLogicKeyboard(prev => ({ ...prev, [questionKey]: true }));
                    setActiveTextarea(questionKey);
                  }}
                  className={`flex items-center space-x-1 text-xs ${logicSymbolMode[questionKey] ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : ''}`}
                  disabled={submitted}
                >
                  <Keyboard className="w-4 h-4" />
                  <span>Logic Symbols</span>
                </Button>
                
                {logicSymbolMode[questionKey] && showLogicKeyboard[questionKey] && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowLogicKeyboard(prev => ({ ...prev, [questionKey]: false }))}
                    className="flex items-center space-x-1 text-xs bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    disabled={submitted}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Hide Keyboard</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Logic symbols keyboard */}
            {logicSymbolMode[questionKey] && showLogicKeyboard[questionKey] && (
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Click symbols to insert:</div>
                <div className="grid grid-cols-4 gap-2">
                  {/* NO HARDCODED SYMBOLS */}
                  {[].map((sym: any) => (
                    <Button
                      key={sym.symbol}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertSymbol(questionKey, sym.symbol)}
                      className="flex flex-col items-center h-auto py-2 text-xs"
                      disabled={submitted}
                      title={sym.desc}
                    >
                      <span className="text-lg font-bold">{sym.symbol}</span>
                      <span className="text-xs text-gray-500">{sym.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            <Textarea
              ref={(el) => {
                textareaRefs.current[questionKey] = el;
              }}
              value={answers[questionKey] || ''}
              onChange={(e) => updateAnswer(questionKey, e.target.value)}
              placeholder={logicSymbolMode[questionKey] ? "Type naturally or use symbols from keyboard above..." : "Enter your answer..."}
              disabled={submitted}
              className="min-h-[80px]"
              onFocus={() => setActiveTextarea(questionKey)}
            />
            
            {logicSymbolMode[questionKey] && (
              <div className="text-xs text-blue-600 dark:text-blue-400">
                Logic Symbol Mode: ON - Use the keyboard above or type naturally
              </div>
            )}
            
            {(showResults || showSolutions || showIndividualAnswers[questionKey]) && (
              <div className="space-y-2">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-sm font-medium text-green-700 dark:text-green-300">Correct Answer:</div>
                  <div className="text-sm text-green-600 dark:text-green-400 font-mono">
                    {(() => {
                      // For multiple choice questions, show the correct option text
                      if (question.options && typeof (question as any).correctAnswer === 'number') {
                        return question.options[(question as any).correctAnswer] || 'Correct answer not found';
                      }
                      // For text input questions, show the answer directly
                      return question.answer || 'The correct answer will be provided by AI grading after submission';
                    })()}
                  </div>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-sm font-medium text-blue-700 dark:text-blue-300">Explanation:</div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">
                    {question.explanation || 'Explanation will be provided after AI grading.'}
                  </div>
                </div>
                {showResults && answers[questionKey] && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      {(() => {
                        const gradingResult = gradingResults[questionKey];
                        const isCorrect = gradingResult?.isCorrect || false;
                        
                        return isCorrect ? (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Correct
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Incorrect
                          </Badge>
                        );
                      })()}
                    </div>
                    {showResults && !answers[questionKey] && (
                      <div className="p-2 bg-gray-50 dark:bg-gray-900/20 rounded text-xs text-gray-600 dark:text-gray-400">
                        Your answer: <span className="font-mono">{answers[questionKey] || '(no answer)'}</span>
                      </div>
                    )}
                  </div>
                )}
                {showSolutions && !showResults && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="text-sm text-yellow-700 dark:text-yellow-300">
                      💡 Solution shown - you can still complete the practice and submit your answers!
                    </div>
                  </div>
                )}
                {!question.answer && !question.explanation && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="text-sm text-yellow-700 dark:text-yellow-300">
                      Answer and explanation will be provided after submission.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'truth_table':
        return (
          <div key={questionKey} className="space-y-3">
            <div className="font-medium">{index + 1}. {question.question || (question as any).prompt}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Formula: <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{question.answer}</span>
            </div>
            <div className="text-sm text-orange-600 dark:text-orange-400">
              Truth table functionality coming soon - for now, work this out on paper and check your answer after submission.
            </div>
          </div>
        );

      default:
        // Fallback for questions without proper type - treat as text input
        const isTextQuestion = !(question as any).options || (question as any).options?.length === 0;
        if (isTextQuestion) {
          return (
            <div key={questionKey} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">{index + 1}. {cleanQuestionText}</div>
                {!submitted && !showIndividualAnswers[questionKey] && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => showAnswerForQuestion(questionKey)}
                    className="flex items-center space-x-1 text-xs"
                    data-testid={`button-show-answer-${questionKey}`}
                  >
                    <Eye className="w-3 h-3" />
                    <span>Show Answer</span>
                  </Button>
                )}
              </div>
              
              <Textarea
                ref={(el) => {
                  textareaRefs.current[questionKey] = el;
                }}
                value={answers[questionKey] || ''}
                onChange={(e) => updateAnswer(questionKey, e.target.value)}
                placeholder="Enter your answer..."
                disabled={submitted}
                className="min-h-[80px]"
                onFocus={() => setActiveTextarea(questionKey)}
                data-testid={`textarea-answer-${questionKey}`}
              />
              
              {(showResults || showSolutions || showIndividualAnswers[questionKey]) && (
                <div className="space-y-2">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-sm font-medium text-green-700 dark:text-green-300">Correct Answer:</div>
                    <div className="text-sm text-green-600 dark:text-green-400 font-mono">
                      {question.answer || 'The correct answer will be provided by AI grading after submission'}
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-sm font-medium text-blue-700 dark:text-blue-300">Explanation:</div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">
                      {question.explanation || 'Explanation will be provided after AI grading.'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        }
        return null;
    }
  };

  const totalQuestions = content.problems.reduce((sum, problem) => sum + problem.questions.length, 0);
  const answeredQuestions = Object.keys(answers).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{title}</span>
            <div className="flex items-center space-x-4 text-sm">
              {onGenerateNew && (
                <Button 
                  onClick={() => {
                    setIsGeneratingNew(true);
                    try {
                      onGenerateNew();
                    } finally {
                      setIsGeneratingNew(false);
                    }
                  }}
                  variant="outline"
                  size="sm"
                  disabled={isGeneratingNew}
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isGeneratingNew ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingNew ? 'Generating...' : (practiceType === 'quiz' ? 'Generate New Quiz' : 'Generate New')}</span>
                </Button>
              )}
              <Badge variant="outline">
                <Clock className="h-3 w-3 mr-1" />
                Week {weekNumber}
              </Badge>
              <Badge variant="outline">
                <Calculator className="h-3 w-3 mr-1" />
                {content.totalPoints} pts
              </Badge>
            </div>
          </CardTitle>
          <CardDescription>{content.instructions}</CardDescription>
          
          {isGeneratingNew && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                <div>
                  <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Generating New Practice Final...
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">
                    Creating 30 fresh questions with AI - this takes about 30-45 seconds
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!submitted && !isGeneratingNew && (
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <div className="text-sm font-medium">Progress: {answeredQuestions}/{totalQuestions} questions answered</div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(answeredQuestions / totalQuestions) * 100}%` }}
                />
              </div>
            </div>
          )}

          {content.problems.map((problem, problemIndex) => (
            <Card key={problem.id} className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>{problem.title}</span>
                  <Badge variant="secondary">{problem.points} points</Badge>
                </CardTitle>
                {problem.context && (
                  <CardDescription className="whitespace-pre-line">{problem.context}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {problem.questions.map((question, questionIndex) => 
                  renderQuestion(problem, question, questionIndex)
                )}
              </CardContent>
            </Card>
          ))}

          {!submitted ? (
            <div className="flex justify-center gap-4 pt-4">
              <Button 
                onClick={() => setShowSolutions(true)}
                variant="outline"
                size="lg"
                className="min-w-[180px]"
              >
                Show Solutions
              </Button>
              {onGenerateNew && practiceType === 'test' && (
                <Button 
                  onClick={() => {
                    setIsGeneratingNew(true);
                    Promise.resolve(onGenerateNew()).finally(() => setIsGeneratingNew(false));
                  }}
                  variant="outline"
                  size="lg"
                  disabled={isGeneratingNew}
                  className="min-w-[200px] flex items-center space-x-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isGeneratingNew ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingNew ? 'Generating...' : 'Generate New Final'}</span>
                </Button>
              )}
              <Button 
                onClick={handleSubmit}
                size="lg"
                disabled={answeredQuestions === 0}
                className="min-w-[200px]"
              >
                Submit {practiceType === 'homework' ? 'Homework' : practiceType === 'quiz' ? 'Quiz' : 'Test'}
              </Button>
            </div>
          ) : isGrading ? (
            <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                  <span>Grading in progress...</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  Please wait while we evaluate your answers using AI grading.
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Practice Complete!</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-lg font-semibold">
                    Score: {score}% ({Math.round((score / 100) * totalQuestions)}/{totalQuestions} correct)
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Time spent: {Math.round((Date.now() - startTime) / 1000 / 60)} minutes
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">
                    Your performance has been logged for analysis. Keep practicing to improve!
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-3">
                    <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      📝 Answers and explanations are now shown above for review and learning.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}