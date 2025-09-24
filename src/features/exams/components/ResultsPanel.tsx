import { ExamSubmissionResponse } from '../types';
import { Button } from '@/components/ui/button';

interface Props {
  results: ExamSubmissionResponse;
  onRetake: () => void;
  onReview: () => void;
}

export function ResultsPanel({ results, onRetake, onReview }: Props) {
  const { scorePct, perQuestion } = results;
  const correctCount = perQuestion.filter(q => q.correct).length;
  const totalCount = perQuestion.length;

  return (
    <div className="space-y-6">
      <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-4xl font-bold text-blue-600 mb-2">
          {Math.round(scorePct)}%
        </div>
        <div className="text-lg text-gray-600">
          {correctCount} out of {totalCount} questions correct
        </div>
        <div className="mt-4 text-sm text-gray-500">
          {scorePct >= 90 ? '🎉 Excellent work!' :
           scorePct >= 80 ? '👍 Good job!' :
           scorePct >= 70 ? '👌 Not bad!' :
           scorePct >= 60 ? '📚 Keep studying!' :
           '💪 Practice makes perfect!'}
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        <Button onClick={onRetake} variant="outline" size="lg">
          Retake Exam
        </Button>
        <Button onClick={onReview} size="lg">
          Review Answers
        </Button>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Question Summary</h3>
        {perQuestion.map((result, index) => (
          <div 
            key={result.questionId}
            className={`
              p-3 rounded border
              ${result.correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}
            `}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">Question {index + 1}</span>
              <span className={`
                text-sm font-medium
                ${result.correct ? 'text-green-600' : 'text-red-600'}
              `}>
                {result.correct ? '✓ Correct' : '✗ Incorrect'}
              </span>
            </div>
            {result.feedback && (
              <p className="text-sm text-gray-600 mt-1">{result.feedback}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}