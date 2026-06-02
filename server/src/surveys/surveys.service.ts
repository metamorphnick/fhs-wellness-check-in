import { Injectable, NotFoundException } from "@nestjs/common";
import { surveys } from "./survey.registry.js";
import { ScoreRequest, ScoreResult, SurveyDefinition } from "./survey.types.js";

@Injectable()
export class SurveysService {
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
}
