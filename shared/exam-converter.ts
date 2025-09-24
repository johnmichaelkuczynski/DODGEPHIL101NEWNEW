// Convert JSON exam format to InteractivePractice format
export function convertExamFromJSON(examData: any[], examTitle: string, totalPoints: number = 100) {
  const problems = examData.map((item, index) => {
    const questionId = `q${index + 1}`;
    
    if (item.type === 'mc') {
      return {
        id: `q-${index + 1}`,
        title: `Question ${index + 1}`,
        points: item.points,
        type: 'multiple_choice' as const,
        questions: [{
          id: questionId,
          question: item.prompt || item.question || '',
          options: item.choices || item.options || [],
          answer: item.answer || item.correctAnswer || '',
          explanation: `Multiple choice question worth ${item.points} points.`
        }]
      };
    } else if (item.type === 'sa' || item.type === 'essay') {
      return {
        id: `q-${index + 1}`,
        title: `Question ${index + 1}${item.type === 'essay' ? ' - Essay' : ' - Short Answer'}`,
        points: item.points,
        type: 'text_input' as const,
        questions: [{
          id: questionId,
          question: item.prompt || item.question || '',
          options: [],
          answer: '',
          explanation: `${item.type === 'essay' ? 'Essay' : 'Short answer'} question worth ${item.points} points.`
        }]
      };
    }
    
    return {
      id: `q-${index + 1}`,
      title: `Question ${index + 1}`,
      points: item.points,
      type: 'text_input' as const,
      questions: [{
        id: questionId,
        question: item.prompt || item.question || '',
        options: [],
        answer: '',
        explanation: `Question worth ${item.points} points.`
      }]
    };
  });

  return {
    title: examTitle,
    content: {
      instructions: `Complete all ${examData.length} questions. Total points: ${totalPoints}.`,
      totalPoints: totalPoints,
      problems: problems
    }
  };
}