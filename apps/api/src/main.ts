import './instrument';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import morgan from 'morgan';
import { AppModule } from './app.module';
import { config } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.use(morgan('dev'));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip unknown fields
      forbidNonWhitelisted: true,
      transform: true, // auto-cast types
    }),
  );

  app.enableCors({
    origin: '*',
    allowedHeaders: '*',
  });
  app.enableShutdownHooks();

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap()
  .then(() => {
    console.info(`Server is running on port ${config.port}`);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
