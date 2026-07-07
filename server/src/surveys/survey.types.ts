export type Audience = "student" | "faculty";

export interface SurveyOption {
  label: string;
  value: number;
}

export interface SurveyQuestion {
  id: string;
  text: string;
}

export interface DifficultyQuestion {
  id: string;
  prompt: string;
  options: string[];
}

export interface ScoreBand {
  min: number;
  max: number;
  label: string;
  tone: "blue" | "green" | "yellow" | "orange" | "red";
}

export interface SurveyDefinition {
  id: string;
  shortName: string;
  title: string;
  subtitle: string;
  timeframe: string;
  scoring: "scored" | "manual";
  options: SurveyOption[];
  questions: SurveyQuestion[];
  difficulty?: DifficultyQuestion;
  scoreBands?: ScoreBand[];
  maxScore?: number;
}

export interface ScoreRequest {
  surveyId: string;
  responses: Record<string, number>;
}

export interface ScoreResult {
  surveyId: string;
  score: number;
  maxScore: number;
  band: ScoreBand;
}

export interface SaveSurveyRequest {
  surveyId: string;
  responses: Record<string, number>;
  surveyScore?: number;
  symptomSeverity?: string;
}

export interface SavedSurvey extends SaveSurveyRequest {
  savedAt: string;
}
