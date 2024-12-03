export interface Question {
  id: string;
  text: string;
  column: number;
}

export interface Answer {
  id: string;
  questionId: string;
  horseId: number;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
}

export interface Horse {
  id: number;
  emoji: string;
  position: number;
  name: string;
  modelValue: string;
  isProcessing?: boolean;
}

export interface GameState {
  questions: Question[];
  answers: Answer[];
  horses: Horse[];
  currentColumn: number;
}

export interface ModelOption {
  name: string;
  value: string;
}

export const MODEL_OPTIONS: ModelOption[] = [
  { name: "Gemini 1.5 Flash", value: "gemini-1.5-flash" },
  { name: "Gemini 1.5 Flash 8B", value: "gemini-1.5-flash-8b" },
  { name: "Gemma 2 9B", value: "gemma-2-9b" },
  { name: "Gemma 7B", value: "gemma-7b" },
  { name: "GPT-4o", value: "gpt-4o" },
  { name: "GPT-4 Turbo", value: "gpt-4-turbo" },
  { name: "Claude 3 Opus", value: "claude-3-opus-latest" },
  { name: "Claude 3 Haiku", value: "claude-3-haiku-20240307" },
  { name: "Claude 3.5 Sonnet", value: "claude-3-5-sonnet-latest" },
  { name: "Mixtral 8x7B", value: "mixtral-8x7b" },
]; 