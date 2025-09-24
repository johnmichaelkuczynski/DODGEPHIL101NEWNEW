import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Exam, Answer, ExamState, ExamSubmissionResponse } from './types';
import { QuestionMC } from './components/QuestionMC';
import { QuestionShort } from './components/QuestionShort';
import { QuestionEssay } from './components/QuestionEssay';
import { Timer } from './components/Timer';
import { ResultsPanel } from './components/ResultsPanel';

interface Props {
  exam: Exam;
}

export function ExamRunner({ exam }: Props) {
  const [state, setState] = useState<ExamState>('Idle');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [results, setResults] = useState<ExamSubmissionResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = exam.questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestion?.id];

  const handleAnswer = useCallback((answer: Answer) => {
    setAnswers(prev => ({
      ...prev,
      [answer.questionId]: answer
    }));
  }, []);

  const allRequiredAnswered = exam.questions.every(q => 
    answers[q.id] && (
      typeof answers[q.id].value === 'number' || 
      (typeof answers[q.id].value === 'string' && (answers[q.id].value as string).trim().length > 0)
    )
  );

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const answersArray = Object.values(answers);
      
      const response = await fetch(`/api/exams/${exam.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers: answersArray }),
      });

      if (!response.ok) {
        throw new Error(`Submission failed: ${response.status}`);
      }

      const submissionResults = await response.json();
      setResults(submissionResults);
      setState('Submitted');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTimeUp = useCallback(() => {
    if (state === 'InProgress') {
      handleSubmit();
    }
  }, [state]);

  const handleRetake = () => {
    setState('Idle');
    setCurrentQuestionIndex(0);
    setAnswers({});
    setResults(null);
    setError(null);
  };

  const handleReview = () => {
    // Stay in submitted state but allow navigation through questions
    setCurrentQuestionIndex(0);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  if (state === 'Idle') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">{exam.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-gray-600">
            <p><strong>Questions:</strong> {exam.questions.length}</p>
            <p><strong>Time Limit:</strong> {Math.floor(exam.durationSec / 60)} minutes</p>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">Instructions</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Answer all questions before submitting</li>
              <li>• Timer will auto-submit when time expires</li>
              <li>• You can navigate between questions freely</li>
              <li>• Your answers are saved as you type</li>
            </ul>
          </div>

          <Button 
            onClick={() => setState('InProgress')}
            size="lg"
            className="w-full"
          >
            Start Exam
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (state === 'Submitted' && results) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{exam.title} - Results</CardTitle>
          </CardHeader>
          <CardContent>
            <ResultsPanel 
              results={results}
              onRetake={handleRetake}
              onReview={handleReview}
            />
          </CardContent>
        </Card>

        {/* Show question review if user clicked review */}
        <Card>
          <CardHeader>
            <CardTitle>Question {currentQuestionIndex + 1} of {exam.questions.length}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Question navigation */}
            <div className="flex flex-wrap gap-2">
              {exam.questions.map((_, index) => {
                const questionResult = results.perQuestion.find(r => r.questionId === exam.questions[index].id);
                return (
                  <Button
                    key={index}
                    variant={index === currentQuestionIndex ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToQuestion(index)}
                    className={questionResult?.correct ? 'border-green-500' : 'border-red-500'}
                  >
                    {index + 1}
                  </Button>
                );
              })}
            </div>

            {/* Current question with results */}
            {currentQuestion && (() => {
              const questionResult = results.perQuestion.find(r => r.questionId === currentQuestion.id);
              
              switch (currentQuestion.type) {
                case 'mcq':
                  return (
                    <QuestionMC
                      question={currentQuestion}
                      answer={currentAnswer}
                      onAnswer={handleAnswer}
                      isSubmitted={true}
                      result={questionResult}
                    />
                  );
                case 'short':
                  return (
                    <QuestionShort
                      question={currentQuestion}
                      answer={currentAnswer}
                      onAnswer={handleAnswer}
                      isSubmitted={true}
                      result={questionResult}
                    />
                  );
                case 'essay':
                  return (
                    <QuestionEssay
                      question={currentQuestion}
                      answer={currentAnswer}
                      onAnswer={handleAnswer}
                      isSubmitted={true}
                      result={questionResult}
                    />
                  );
                default:
                  return null;
              }
            })()}

            {/* Navigation */}
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={prevQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                onClick={nextQuestion}
                disabled={currentQuestionIndex === exam.questions.length - 1}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // InProgress state
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with timer */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{exam.title}</h1>
        <Timer 
          durationSec={exam.durationSec}
          onTimeUp={handleTimeUp}
          isActive={state === 'InProgress'}
        />
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Question {currentQuestionIndex + 1} of {exam.questions.length}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question navigation */}
          <div className="flex flex-wrap gap-2">
            {exam.questions.map((q, index) => {
              const hasAnswer = answers[q.id] && (
                typeof answers[q.id].value === 'number' || 
                (typeof answers[q.id].value === 'string' && (answers[q.id].value as string).trim().length > 0)
              );
              
              return (
                <Button
                  key={index}
                  variant={index === currentQuestionIndex ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToQuestion(index)}
                  className={hasAnswer ? 'border-green-500' : ''}
                >
                  {index + 1}
                </Button>
              );
            })}
          </div>

          {/* Current question */}
          {currentQuestion && (() => {
            switch (currentQuestion.type) {
              case 'mcq':
                return (
                  <QuestionMC
                    question={currentQuestion}
                    answer={currentAnswer}
                    onAnswer={handleAnswer}
                    isSubmitted={false}
                  />
                );
              case 'short':
                return (
                  <QuestionShort
                    question={currentQuestion}
                    answer={currentAnswer}
                    onAnswer={handleAnswer}
                    isSubmitted={false}
                  />
                );
              case 'essay':
                return (
                  <QuestionEssay
                    question={currentQuestion}
                    answer={currentAnswer}
                    onAnswer={handleAnswer}
                    isSubmitted={false}
                  />
                );
              default:
                return null;
            }
          })()}

          {/* Navigation and submit */}
          <div className="flex justify-between items-center">
            <Button 
              variant="outline" 
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>

            <div className="flex gap-4">
              <Button 
                onClick={handleSubmit}
                disabled={!allRequiredAnswered || isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Exam'}
              </Button>
            </div>

            <Button 
              variant="outline" 
              onClick={nextQuestion}
              disabled={currentQuestionIndex === exam.questions.length - 1}
            >
              Next
            </Button>
          </div>

          {/* Progress indicator */}
          <div className="text-center text-sm text-gray-500">
            Answered: {Object.keys(answers).filter(qId => {
              const answer = answers[qId];
              return answer && (
                typeof answer.value === 'number' || 
                (typeof answer.value === 'string' && (answer.value as string).trim().length > 0)
              );
            }).length} / {exam.questions.length}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}