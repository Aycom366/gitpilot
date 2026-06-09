import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import morgan from 'morgan';
import { AppModule } from './app.module';

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
