import { Body, Controller, Get, Inject, Param, Post } from "@nestjs/common";
import { ScoreRequest } from "./survey.types.js";
import { SurveysService } from "./surveys.service.js";

@Controller("surveys")
export class SurveysController {
  constructor(@Inject(SurveysService) private readonly surveysService: SurveysService) {}

  @Get()
  findAll() {
    return this.surveysService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.surveysService.findOne(id);
  }

  @Post("score")
  score(@Body() body: ScoreRequest) {
    return this.surveysService.score(body);
  }
}
