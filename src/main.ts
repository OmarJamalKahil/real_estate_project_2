import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';
// import * as express from 'express'
// import { json, urlencoded } from 'express'




async function bootstrap() {
  const app = await NestFactory.create(AppModule);
    console.log("klfds lkj kl slkd slkd lkds lkjds",__dirname)

  app.setGlobalPrefix('api'); // 👈 this will prefix all routes with /api
  app.enableCors("*")
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, transform: true
  })); // 👈 Enables DTO validation



  // app.useGlobalPipes(new I18nValidationPipe({ transform: true, whitelist: true }));
  // app.useGlobalFilters(new I18nValidationExceptionFilter({ detailedErrors: false }));



  // // Configure JSON parsing for other routes
  // app.use(json({ limit: '50mb' }));
  // app.use(urlencoded({ extended: true, limit: '50mb' }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
