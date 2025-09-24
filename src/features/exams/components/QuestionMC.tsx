import { Question, Answer } from '../types';

interface Props {
  question: Question & { type: 'mcq' };
  answer?: Answer;
  onAnswer: (answer: Answer) => void;
  isSubmitted: boolean;
  result?: {
    correct: boolean;
    feedback: string;
    expected?: string;
  };
}

export function QuestionMC({ question, answer, onAnswer, isSubmitted, result }: Props) {
  const selectedChoice = answer?.value as number;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{question.prompt}</h3>
      
      <div className="space-y-2">
        {question.choices.map((choice, index) => {
          const isSelected = selectedChoice === index;
          const isCorrect = result?.correct && isSelected;
          const isIncorrect = result && !result.correct && isSelected;
          const isCorrectAnswer = isSubmitted && question.answerKey === index;
          
          return (
            <label
              key={index}
              className={`
                flex items-center space-x-3 p-3 border rounded cursor-pointer transition-colors
                ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}
                ${isCorrect ? 'border-green-500 bg-green-50' : ''}
                ${isIncorrect ? 'border-red-500 bg-red-50' : ''}
                ${isCorrectAnswer && !isSelected ? 'border-green-300 bg-green-25' : ''}
                ${isSubmitted ? 'cursor-default' : ''}
              `}
            >
              <input
                type="radio"
                name={question.id}
                value={index}
                checked={isSelected}
                disabled={isSubmitted}
                onChange={(e) => onAnswer({ 
                  questionId: question.id, 
                  value: parseInt(e.target.value) 
                })}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="flex-1">
                {String.fromCharCode(65 + index)}. {choice}
              </span>
              {isSubmitted && (
                <span className="text-sm">
                  {isCorrectAnswer && (
                    <span className="text-green-600 font-medium">✓ Correct</span>
                  )}
                  {isIncorrect && (
                    <span className="text-red-600 font-medium">✗ Your answer</span>
                  )}
                </span>
              )}
            </label>
          );
        })}
      </div>

      {isSubmitted && result && (
        <div className={`p-3 rounded border ${result.correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <p className="text-sm">
            <strong>{result.correct ? 'Correct!' : 'Incorrect.'}</strong>
            {result.feedback && ` ${result.feedback}`}
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