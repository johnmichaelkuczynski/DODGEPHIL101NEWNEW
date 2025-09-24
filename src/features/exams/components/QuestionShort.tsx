import { Question, Answer } from '../types';

interface Props {
  question: Question & { type: 'short' };
  answer?: Answer;
  onAnswer: (answer: Answer) => void;
  isSubmitted: boolean;
  result?: {
    correct: boolean;
    feedback: string;
    expected?: string;
  };
}

export function QuestionShort({ question, answer, onAnswer, isSubmitted, result }: Props) {
  const value = answer?.value as string || '';

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{question.prompt}</h3>
      
      <div className="space-y-2">
        <input
          type="text"
          value={value}
          disabled={isSubmitted}
          onChange={(e) => onAnswer({ 
            questionId: question.id, 
            value: e.target.value 
          })}
          className={`
            w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${isSubmitted ? 'bg-gray-50 cursor-default' : ''}
            ${result?.correct ? 'border-green-500' : ''}
            ${result && !result.correct ? 'border-red-500' : ''}
          `}
          placeholder="Enter your answer..."
        />
      </div>

      {isSubmitted && result && (
        <div className={`p-3 rounded border ${result.correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <p className="text-sm">
            <strong>{result.correct ? 'Correct!' : 'Incorrect.'}</strong>
            {result.feedback && ` ${result.feedback}`}
          </p>
          {result.expected && (
            <p className="text-sm mt-2 text-gray-600">
              <strong>Expected:</strong> {result.expected}
            </p>
          )}
          {question.explanation && (
            <p className="text-sm mt-2 text-gray-600">
              <strong>Explanation:</strong> {question.explanation}
            </p>
          )}
        </div>
      )}
    </div>
  );
}