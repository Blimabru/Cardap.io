import { ValidationPipe } from '@nestjs/common'; // 1. Importe o ValidationPipe
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 2. Adicione esta linha:
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Remove campos que não estão no DTO
    forbidNonWhitelisted: true, // Lança erro se campos extras forem enviados
  }));

  app.enableCors();

  await app.listen(3000);
}
bootstrap();