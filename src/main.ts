import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api'); // 👈 this will prefix all routes with /api
  app.enableCors("*")
  app.useGlobalPipes(new ValidationPipe()); // 👈 Enables DTO validation

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
