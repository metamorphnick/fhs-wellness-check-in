import { Injectable, NotFoundException } from "@nestjs/common";
import { surveys } from "./survey.registry.js";
import { SavedSurvey, SaveSurveyRequest, ScoreRequest, ScoreResult, SurveyDefinition } from "./survey.types.js";

@Injectable()
export class SurveysService {
  private readonly savedSurveys: SavedSurvey[] = [];

  findAll(): SurveyDefinition[] {
    return surveys;
  }

  findOne(id: string): SurveyDefinition {
    const survey = surveys.find((item) => item.id === id);
    if (!survey) {
      throw new NotFoundException(`Survey ${id} was not found.`);
    }
    return survey;
  }

  score(request: ScoreRequest): ScoreResult {
    const survey = this.findOne(request.surveyId);
    if (survey.scoring === "manual" || !survey.scoreBands || !survey.maxScore) {
      throw new NotFoundException(`Survey ${request.surveyId} does not support scoring.`);
    }
    const score = survey.questions.reduce((total, question) => {
      const value = request.responses[question.id] ?? 0;
      return total + Number(value);
    }, 0);
    const band = survey.scoreBands.find((item) => score >= item.min && score <= item.max) ?? survey.scoreBands[survey.scoreBands.length - 1];

    return {
      surveyId: survey.id,
      score,
      maxScore: survey.maxScore,
      band
    };
  }

  save(request: SaveSurveyRequest): SavedSurvey {
    const survey = this.findOne(request.surveyId);
    const responses = survey.questions.reduce<Record<string, number>>((payload, question) => {
      payload[question.id] = Number(request.responses[question.id] ?? 0);
      return payload;
    }, {});
    const savedSurvey = {
      surveyId: survey.id,
      responses,
      ...(request.surveyScore !== undefined ? { surveyScore: Number(request.surveyScore) } : {}),
      ...(request.symptomSeverity ? { symptomSeverity: request.symptomSeverity } : {}),
      savedAt: new Date().toISOString()
    };

    this.savedSurveys.push(savedSurvey);
    return savedSurvey;
  }

  findSaved(): SavedSurvey[] {
    return this.savedSurveys;
  }
}
