/**
 * ============================================================================
 * DATABASE.CONFIG.TS - CONFIGURAÇÃO DO BANCO DE DADOS
 * ============================================================================
 * 
 * Este arquivo configura a conexão com o PostgreSQL usando TypeORM.
 * 
 * SEGURANÇA:
 * - NUNCA commitar credenciais no código!
 * - Sempre usar variáveis de ambiente (.env)
 * - Valores default apenas para fallback
 * 
 * VARIÁVEIS DE AMBIENTE NECESSÁRIAS (.env):
 * - DB_HOST: Endereço do servidor PostgreSQL (ex: localhost, plataformatech.cloud)
 * - DB_PORT: Porta do PostgreSQL (padrão: 5432)
 * - DB_USERNAME: Usuário do banco
 * - DB_PASSWORD: Senha do banco
 * - DB_DATABASE: Nome do banco de dados (ex: cardapio)
 * - NODE_ENV: Ambiente (development, production)
 * 
 * IMPORTANTE: 
 * - synchronize: true em desenvolvimento cria/atualiza tabelas automaticamente
 * - synchronize: false em produção (evita perda de dados acidental)
 */

import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * Função que retorna a configuração do banco de dados
 * 
 * Usa variáveis de ambiente para segurança e flexibilidade.
 * Valores default são fornecidos apenas como fallback.
 * 
 * @returns {TypeOrmModuleOptions} Configuração do TypeORM para PostgreSQL
 * 
 * @example
 * // No app.module.ts:
 * TypeOrmModule.forRoot(configuracaoBancoDados())
 */
export const configuracaoBancoDados = (): TypeOrmModuleOptions => ({
  /**
   * ========================================================================
   * CONFIGURAÇÃO BÁSICA DO BANCO
   * ========================================================================
   */
  
  // Tipo de banco de dados (PostgreSQL)
  type: 'postgres',
  
  // Host do banco (lê do .env ou usa 'localhost')
  host: process.env.DB_HOST || 'localhost',
  
  // Porta do banco (lê do .env ou usa 5432)
  // parseInt converte string para número
  port: parseInt(process.env.DB_PORT || '5432', 10),
  
  // Usuário do banco
  username: process.env.DB_USERNAME || 'postgres',
  
  // Senha do banco
  password: process.env.DB_PASSWORD || 'postgres',
  
  // Nome do banco de dados
  database: process.env.DB_DATABASE || 'cardapio',
  
  /**
   * ========================================================================
   * CONFIGURAÇÃO DE ENTIDADES
   * ========================================================================
   */
  
  /**
   * autoLoadEntities: true
   * 
   * Carrega automaticamente todas as entidades (classes com @Entity())
   * registradas nos módulos da aplicação.
   * 
   * Evita precisar listar manualmente cada entidade aqui.
   * 
   * Entidades carregadas automaticamente:
   * - Perfil (tabela: perfis)
   * - Usuario (tabela: usuarios)
   * - Category (tabela: categories)
   * - Product (tabela: products)
   * - Pedido (tabela: pedidos)
   * - ItemPedido (tabela: itens_pedido)
   */
  autoLoadEntities: true,
  
  /**
   * ========================================================================
   * SINCRONIZAÇÃO DE SCHEMA
   * ========================================================================
   */
  
  /**
   * synchronize: boolean
   * 
   * DESENVOLVIMENTO (true):
   * - Cria tabelas automaticamente se não existirem
   * - Atualiza colunas se a entidade mudar
   * - Facilita desenvolvimento rápido
   * 
   * PRODUÇÃO (false):
   * - NUNCA use true em produção!
   * - Pode deletar tabelas ou perder dados
   * - Use migrations para mudanças em produção
   * 
   * Ativa apenas se NODE_ENV === 'development'
   */
  synchronize: process.env.NODE_ENV === 'development',
  
  /**
   * ========================================================================
   * LOGS E DEBUG
   * ========================================================================
   */
  
  /**
   * logging: boolean
   * 
   * Habilita logs de queries SQL no console.
   * 
   * DESENVOLVIMENTO (true):
   * - Mostra todas as queries executadas
   * - Útil para debug
   * 
   * PRODUÇÃO (false):
   * - Desativa logs para melhor performance
   * - Evita poluir logs de produção
   */
  logging: process.env.NODE_ENV === 'development',
  
  /**
   * ========================================================================
   * POOL DE CONEXÕES
   * ========================================================================
   */
  
  /**
   * extra: Configurações avançadas do driver PostgreSQL
   * 
   * Pool de conexões: Mantém conexões abertas para reutilização,
   * melhorando performance.
   * 
   * Configurações:
   * - max: 10 → Máximo de 10 conexões simultâneas
   *   (suficiente para aplicações pequenas/médias)
   * 
   * - idleTimeoutMillis: 30000 → Fecha conexões inativas após 30 segundos
   *   (libera recursos do servidor de banco)
   * 
   * - connectionTimeoutMillis: 2000 → Timeout de 2 segundos para conectar
   *   (falha rápido se banco estiver indisponível)
   */
  extra: {
    max: 10,                      // Máximo de conexões no pool
    idleTimeoutMillis: 30000,     // Tempo para fechar conexão inativa (30s)
    connectionTimeoutMillis: 2000,// Timeout para conectar (2s)
  },
});

/**
 * ============================================================================
 * EXEMPLO DE ARQUIVO .env
 * ============================================================================
 * 
 * # Banco de Dados PostgreSQL
 * DB_HOST=plataformatech.cloud
 * DB_PORT=5432
 * DB_USERNAME=seu_usuario
 * DB_PASSWORD=sua_senha_segura
 * DB_DATABASE=cardapio
 * 
 * # Ambiente
 * NODE_ENV=development
 * 
 * ============================================================================
 * TROUBLESHOOTING
 * ============================================================================
 * 
 * Erro: "password authentication failed"
 * Solução: Verifique DB_USERNAME e DB_PASSWORD no .env
 * 
 * Erro: "database does not exist"
 * Solução: Crie o banco no PostgreSQL: CREATE DATABASE cardapio;
 * 
 * Erro: "connect ECONNREFUSED"
 * Solução: Verifique se PostgreSQL está rodando e DB_HOST/DB_PORT estão corretos
 * 
 * Erro: Tabelas não são criadas
 * Solução: Verifique se NODE_ENV=development e synchronize=true
 */

