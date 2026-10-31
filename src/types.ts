export type MathMode = 'simple' | 'friends_of_5' | 'standard';

export interface GameSettings {
  playerName: string;
  mathMode: MathMode;
  digits1: number;
  digits2: number;
  numOperands: number;
  numQuestions: number;
  totalTimeMinutes: number;
  examMode: 1 | 2; // 1 = Single question with Abacus, 2 = Exam Sheet Grid
}

export interface QuestionItem {
  id: number;
  numbers: number[];
  answer: number;
  modeExplanation?: string;
}

export interface AnswerResult {
  question: QuestionItem;
  userAnswer: number | null;
  isCorrect: boolean;
}
