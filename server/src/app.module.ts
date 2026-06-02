import { Module } from "@nestjs/common";
import { SurveysModule } from "./surveys/surveys.module.js";

@Module({
  imports: [SurveysModule]
})
export class AppModule {}
