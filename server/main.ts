import "reflect-metadata";
import { BadRequestException, Body, Controller, Module, Post } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { ZodError } from "zod";
import {
  type CheckInPayload,
  validate_check_in_payload
} from "../shared/check_in.schema";

@Controller("api/check-ins")
class CheckInsController {
  @Post()
  create(@Body() payload: CheckInPayload) {
    let validated_payload: CheckInPayload;

    try {
      validated_payload = validate_check_in_payload(payload);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          message: "Invalid check-in payload.",
          errors: error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message
          }))
        });
      }

      throw error;
    }

    return {
      ok: true,
      id: "WC-15909",
      recorded_at: new Date().toISOString(),
      payload: validated_payload
    };
  }
}

@Module({
  controllers: [CheckInsController]
})
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true });
  await app.listen(3000, "127.0.0.1");
}

bootstrap();
