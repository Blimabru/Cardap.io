import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

/**
 * Inicializa a aplicação NestJS
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuração de CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || [
      'http://localhost:8081',
      'http://localhost:19000',
      'exp://192.168.0.1:8081', // Expo
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Habilita validação global com class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove propriedades não definidas no DTO
      forbidNonWhitelisted: true, // Retorna erro se propriedade não definida for enviada
      transform: true, // Transforma tipos automaticamente
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`\n🚀 Servidor rodando em: http://localhost:${port}`);
  console.log(`📚 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Banco de dados: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}\n`);
}

bootstrap();
