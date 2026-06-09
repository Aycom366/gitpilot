import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import morgan from 'morgan';
import { AppModule } from './app.module';
import { config } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  console.log('ENV CHECK:', {
    PORT: config.port,
    DATABASE_URL: config.databaseUrl ? '[set]' : '[missing]',
    REDIS_URL: config.redisUrl,
    JWT_SECRET: config.jwtSecret ? '[set]' : '[missing]',
    GOOGLE_GENERATIVE_AI_API_KEY: config.googleApiKey ? '[set]' : '[missing]',
    WEB_URL: config.webUrl,
  });

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap()
  .then(() => {
    console.info('Server is running');
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
