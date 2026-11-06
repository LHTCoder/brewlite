import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService);

  app.use(helmet());
  app.enableCors({
    origin: config.get<string[]>('corsOrigins'),
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
  });
  // Validate + strip field lạ (NFR-02) ở mọi endpoint
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableShutdownHooks();

  if (config.get('nodeEnv') !== 'production' || process.env.SWAGGER_ENABLED === 'true') {
    const doc = new DocumentBuilder()
      .setTitle('BrewLite API')
      .setDescription('API đặt đồ uống BrewLite – Assignment 2, Công nghệ phần mềm')
      .setVersion(process.env.APP_VERSION ?? '1.0.0')
      .addBearerAuth()
      .build();
    SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, doc));
  }

  const port = config.get<number>('port')!;
  await app.listen(port, '0.0.0.0');
  Logger.log(
    `🚀 BrewLite API listening on http://0.0.0.0:${port} (${config.get('nodeEnv')})`,
    'Bootstrap',
  );
}

bootstrap();
