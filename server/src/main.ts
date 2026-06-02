import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ["http://127.0.0.1:5173", "http://localhost:5173"]
  });
  app.setGlobalPrefix("api");
  await app.listen(3000, "127.0.0.1");
}

void bootstrap();
