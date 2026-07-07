import { Body, Controller, Get, Inject, Param, Post } from "@nestjs/common";
import { SaveSurveyRequest, ScoreRequest } from "./survey.types.js";
import { SurveysService } from "./surveys.service.js";

@Controller("surveys")
export class SurveysController {
  constructor(@Inject(SurveysService) private readonly surveysService: SurveysService) {}

  @Get()
  findAll() {
    return this.surveysService.findAll();
  }

  @Get("saved/submissions")
  findSaved() {
    return this.surveysService.findSaved();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.surveysService.findOne(id);
  }

  @Post("score")
  score(@Body() body: ScoreRequest) {
    return this.surveysService.score(body);
  }

  @Post("save")
  save(@Body() body: SaveSurveyRequest) {
    return this.surveysService.save(body);
  }
}
