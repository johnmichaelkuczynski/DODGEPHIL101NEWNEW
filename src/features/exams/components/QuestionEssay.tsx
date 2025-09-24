import { Question, Answer } from '../types';

interface Props {
  question: Question & { type: 'essay' };
  answer?: Answer;
  onAnswer: (answer: Answer) => void;
  isSubmitted: boolean;
  result?: {
    correct: boolean;
    feedback: string;
    expected?: string;
  };
}

export function QuestionEssay({ question, answer, onAnswer, isSubmitted, result }: Props) {
  const value = answer?.value as string || '';

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{question.prompt}</h3>
      
      {question.rubric && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">
            <strong>Rubric:</strong> {question.rubric}
          </p>
        </div>
      )}
      
      <div className="space-y-2">
        <textarea
          value={value}
          disabled={isSubmitted}
          onChange={(e) => onAnswer({ 
            questionId: question.id, 
            value: e.target.value 
          })}
          className={`
            w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[200px] resize-y
            ${isSubmitted ? 'bg-gray-50 cursor-default' : ''}
          `}
          placeholder="Write your essay response here..."
          rows={8}
        />
      </div>

      {isSubmitted && result && (
        <div className="p-3 rounded border border-blue-200 bg-blue-50">
          <p className="text-sm">
            <strong>Feedback:</strong> {result.feedback}
          </p>
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