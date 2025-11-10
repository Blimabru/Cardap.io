/**
 * ============================================================================
 * MAIN.TS - ARQUIVO DE INICIALIZAÇÃO DA API
 * ============================================================================
 * 
 * Este é o ponto de entrada da aplicação NestJS.
 * Aqui são configurados:
 * - CORS (Cross-Origin Resource Sharing) para permitir requisições do frontend
 * - Validação global de dados usando class-validator
 * - Porta do servidor
 * 
 * Executado com: npm run start ou npm run start:dev
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

/**
 * Função principal que inicializa a aplicação NestJS
 * 
 * Fluxo de execução:
 * 1. Cria a instância da aplicação
 * 2. Configura CORS para permitir requisições do frontend
 * 3. Habilita validação automática de DTOs
 * 4. Inicia o servidor na porta especificada
 * 
 * @returns {Promise<void>}
 */
async function bootstrap() {
  // Cria a instância da aplicação NestJS usando o módulo principal
  const app = await NestFactory.create(AppModule);

  /**
   * ========================================================================
   * CONFIGURAÇÃO DE CORS
   * ========================================================================
   * 
   * CORS permite que o frontend (rodando em localhost:8081) faça requisições
   * para o backend (rodando em localhost:3000).
   * 
   * Sem CORS, o navegador bloqueia as requisições por segurança.
   * 
   * Origens permitidas:
   * - http://localhost:8081 (Expo Web)
   * - http://localhost:19000 (Expo DevTools)
   * - exp://192.168.0.1:8081 (Expo Mobile - substitua pelo seu IP)
   */
  app.enableCors({
    // Origens permitidas (quem pode fazer requisições)
    origin: process.env.CORS_ORIGIN?.split(',') || [
      'http://localhost:8081',      // Expo Web
      'http://localhost:19000',     // Expo DevTools
      'exp://192.168.0.1:8081',     // Expo Mobile (ajustar IP conforme sua rede)
    ],
    // Permite envio de cookies e headers de autenticação
    credentials: true,
    // Métodos HTTP permitidos
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    // Headers permitidos nas requisições
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  /**
   * ========================================================================
   * VALIDAÇÃO GLOBAL DE DADOS
   * ========================================================================
   * 
   * Usa class-validator para validar automaticamente todos os DTOs.
   * 
   * Exemplo: Se um DTO define que 'email' é obrigatório, uma requisição
   * sem 'email' retornará erro 400 automaticamente.
   * 
   * Opções:
   * - whitelist: Remove propriedades não definidas no DTO (segurança)
   * - forbidNonWhitelisted: Retorna erro se propriedade extra for enviada
   * - transform: Converte strings para números, datas, etc. automaticamente
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,              // Remove propriedades não definidas no DTO
      forbidNonWhitelisted: true,   // Retorna erro se propriedade não definida for enviada
      transform: true,              // Transforma tipos automaticamente (ex: '10' → 10)
    }),
  );

  /**
   * ========================================================================
   * INICIALIZAÇÃO DO SERVIDOR
   * ========================================================================
   * 
   * Inicia o servidor HTTP na porta especificada.
   * Porta padrão: 3000 (ou valor definido na variável PORT do .env)
   */
  const port = process.env.PORT || 3000;
  await app.listen(port);

  // Logs informativos no console
  console.log(`\n🚀 Servidor rodando em: http://localhost:${port}`);
  console.log(`📚 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Banco de dados: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}\n`);
}

// Executa a função de inicialização
bootstrap();
