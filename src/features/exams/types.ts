export type Exam = { 
  id: string; 
  title: string; 
  durationSec: number; 
  questions: Question[] 
};

export type Question =
  | { id: string; type: "mcq"; prompt: string; choices: string[]; answerKey: number; explanation?: string }
  | { id: string; type: "short"; prompt: string; answerKey: (string | { regex: string; flags?: string })[]; explanation?: string }
  | { id: string; type: "essay"; prompt: string; rubric?: string; explanation?: string };

export type Answer = { 
  questionId: string; 
  value: string | number 
};

export type ExamSubmissionResponse = {
  scorePct: number;
  perQuestion: {
    questionId: string;
    correct: boolean;
    feedback: string;
    expected?: string;
  }[];
};

export type ExamState = 'Idle' | 'InProgress' | 'Submitted';