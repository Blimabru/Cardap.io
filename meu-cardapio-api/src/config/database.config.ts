import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * Configuração do banco de dados usando variáveis de ambiente
 * 
 * IMPORTANTE: Nunca commitar credenciais no código!
 * Use o arquivo .env para armazenar dados sensíveis
 */
export const configuracaoBancoDados = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'cardapio',
  
  // Carrega todas as entidades automaticamente
  autoLoadEntities: true,
  
  // NUNCA usar synchronize: true em produção!
  // Isso pode causar perda de dados
  synchronize: process.env.NODE_ENV === 'development',
  
  // Habilita logs apenas em desenvolvimento
  logging: process.env.NODE_ENV === 'development',
  
  // Configurações de conexão
  extra: {
    max: 10, // Máximo de conexões no pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
});

