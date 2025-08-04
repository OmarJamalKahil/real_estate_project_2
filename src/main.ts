import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
// import * as express from 'express'
// import { json, urlencoded } from 'express'

 
 

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api'); // 👈 this will prefix all routes with /api
  app.enableCors({
    origin: '*'
})
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, transform: true
  })); // 👈 Enables DTO validation




  // Configure raw body for webhooks
  // app.use('/stripe/webhook', express.raw({ type: 'application/json' }));

  // // Configure JSON parsing for other routes
  // app.use(json({ limit: '50mb' }));
  // app.use(urlencoded({ extended: true, limit: '50mb' }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();


// Omar and Ahmad
// hello omar
// hello ahmad
