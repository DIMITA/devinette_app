export interface QuizQuestion {
  question: string;
  options?: string[];
  answer: string;
  explanation?: string;
  difficulty?: string;
}

export interface AudioUrls {
  question?: string;     // TTS URL for question text
  reveal?: string;       // TTS URL for answer reveal
  explanation?: string;  // TTS URL for explanation
}

export interface RenderProps {
  question: QuizQuestion;
  questionIndex: number;
  totalQuestions: number;
  showTimer: boolean;
  timerDuration: number;    // seconds for reflection
  revealDelay: number;      // seconds before reveal
  watermark?: string;
  audioUrls?: AudioUrls;    // Pre-generated TTS audio
  lang?: string;
  [key: string]: unknown;   // Index signature for Remotion compatibility
}

export interface MultiRenderProps {
  questions: QuizQuestion[];
  templateId: "Template1" | "Template2" | "Template3";
  watermark?: string;
  lang?: string;
  audioUrls?: AudioUrls[];  // one per question
  [key: string]: unknown;   // Index signature for Remotion compatibility
}

export const VIDEO_FPS = 30;
export const VIDEO_WIDTH = 1080;
export const VIDEO_HEIGHT = 1920;

// Timeline (in frames at 30fps)
export const INTRO_END = 30;          // 1s intro
export const QUESTION_END = 120;      // +3s question appear
export const OPTIONS_END = 240;       // +4s options stagger in
export const TIMER_END = 330;         // +3s timer countdown
export const REVEAL_END = 420;        // +3s reveal
export const EXPLANATION_END = 510;   // +3s explanation
export const OUTRO_END = 540;         // +1s outro fade
export const TOTAL_FRAMES = OUTRO_END;
