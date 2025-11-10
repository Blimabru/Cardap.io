/**
 * ============================================================================
 * APP.MODULE.TS - MÓDULO PRINCIPAL DA APLICAÇÃO
 * ============================================================================
 * 
 * Este é o módulo raiz da aplicação NestJS.
 * 
 * RESPONSABILIDADES:
 * 1. Importar e configurar todos os módulos da aplicação
 * 2. Configurar TypeORM para conexão com PostgreSQL
 * 3. Configurar variáveis de ambiente (.env)
 * 4. Definir Guards globais (autenticação e autorização)
 * 
 * GUARDS GLOBAIS CONFIGURADOS:
 * - JwtAuthGuard: Protege TODAS as rotas por padrão (requer token JWT)
 *   Para criar rota pública, use: @Public()
 * 
 * - PerfisGuard: Valida permissões por perfil de usuário
 *   Para restringir rota, use: @Perfis('Administrador', 'Dono')
 * 
 * MÓDULOS IMPORTADOS:
 * - AuthModule: Login, registro, JWT
 * - PerfisModule: Perfis de usuário (Admin, Dono, Cliente)
 * - UsuariosModule: CRUD de usuários
 * - ProductsModule: CRUD de produtos
 * - CategoriesModule: CRUD de categorias
 * - PedidosModule: Gestão de pedidos
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================
import { configuracaoBancoDados } from './config/database.config';

// ============================================================================
// MÓDULOS DA APLICAÇÃO
// ============================================================================
import { AuthModule } from './auth/auth.module';           // Autenticação (login, registro)
import { PerfisModule } from './perfis/perfis.module';     // Perfis de usuário
import { UsuariosModule } from './usuarios/usuarios.module'; // Gestão de usuários
import { ProductsModule } from './products/products.module'; // Produtos do cardápio
import { CategoriesModule } from './categories/categories.module'; // Categorias
import { PedidosModule } from './pedidos/pedidos.module';   // Pedidos

// ============================================================================
// GUARDS (SEGURANÇA)
// ============================================================================
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard'; // Autenticação JWT
import { PerfisGuard } from './auth/guards/perfis.guard';    // Autorização por perfil

/**
 * Módulo principal da aplicação
 * 
 * Usa o decorator @Module para definir a estrutura do módulo:
 * - imports: Outros módulos que este módulo precisa
 * - controllers: Controllers deste módulo (vazio aqui, cada módulo tem seus próprios)
 * - providers: Services e Guards deste módulo
 */
@Module({
  imports: [
    /**
     * ========================================================================
     * CONFIGURAÇÃO DE VARIÁVEIS DE AMBIENTE
     * ========================================================================
     * 
     * Carrega variáveis do arquivo .env na raiz do projeto.
     * 
     * isGlobal: true = Disponível em todos os módulos sem precisar reimportar
     * 
     * Variáveis carregadas:
     * - DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE
     * - JWT_SECRET, JWT_EXPIRES_IN
     * - PORT, NODE_ENV, CORS_ORIGIN
     */
    ConfigModule.forRoot({
      isGlobal: true,      // Torna o módulo disponível globalmente
      envFilePath: '.env', // Caminho do arquivo de variáveis de ambiente
    }),

    /**
     * ========================================================================
     * CONFIGURAÇÃO DO BANCO DE DADOS
     * ========================================================================
     * 
     * Configura TypeORM para se conectar ao PostgreSQL.
     * 
     * configuracaoBancoDados() retorna:
     * - Tipo: postgres
     * - Host, porta, usuário, senha (do .env)
     * - autoLoadEntities: true (carrega entidades automaticamente)
     * - synchronize: apenas em desenvolvimento (cria/atualiza tabelas)
     * 
     * IMPORTANTE: synchronize: false em produção! (pode perder dados)
     */
    TypeOrmModule.forRoot(configuracaoBancoDados()),

    /**
     * ========================================================================
     * MÓDULOS DA APLICAÇÃO
     * ========================================================================
     * 
     * Cada módulo encapsula uma funcionalidade específica:
     * - Controllers: Recebem requisições HTTP
     * - Services: Contêm lógica de negócio
     * - Entities: Representam tabelas do banco de dados
     * - DTOs: Validam dados de entrada
     */
    AuthModule,        // Sistema de autenticação (login, registro, JWT)
    PerfisModule,      // Perfis de usuário (Admin, Dono, Cliente)
    UsuariosModule,    // Gestão de usuários (CRUD, ativação, desativação)
    ProductsModule,    // Gestão de produtos (CRUD, imagens, preços)
    CategoriesModule,  // Gestão de categorias (CRUD, relação com produtos)
    PedidosModule,     // Gestão de pedidos (criar, listar, atualizar status)
  ],
  
  // Nenhum controller no módulo raiz (cada módulo tem seus próprios)
  controllers: [],
  
  /**
   * ========================================================================
   * PROVIDERS (GUARDS GLOBAIS)
   * ========================================================================
   * 
   * Guards globais são aplicados automaticamente em TODAS as rotas.
   * 
   * ORDEM DE EXECUÇÃO:
   * 1. JwtAuthGuard: Verifica se o token JWT é válido
   * 2. PerfisGuard: Verifica se o usuário tem o perfil necessário
   * 
   * Para criar rota pública (sem autenticação):
   * @Public()
   * 
   * Para restringir por perfil:
   * @Perfis('Administrador', 'Dono')
   */
  providers: [
    /**
     * JwtAuthGuard Global
     * 
     * Protege TODAS as rotas automaticamente.
     * Requisições sem token JWT válido retornam 401 Unauthorized.
     * 
     * Exceções (rotas públicas):
     * - POST /auth/login (usa @Public())
     * - POST /auth/registrar (usa @Public())
     */
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    
    /**
     * PerfisGuard Global
     * 
     * Valida se o usuário tem o perfil necessário para acessar a rota.
     * 
     * Exemplo de uso no controller:
     * @Perfis('Administrador')
     * @Get('usuarios')
     * listarUsuarios() { ... }
     * 
     * Resultado: Apenas Admin pode acessar GET /usuarios
     */
    {
      provide: APP_GUARD,
      useClass: PerfisGuard,
    },
  ],
})
export class AppModule {}

/**
 * ============================================================================
 * FLUXO DE UMA REQUISIÇÃO
 * ============================================================================
 * 
 * 1. Requisição chega no main.ts (servidor HTTP)
 * 2. CORS valida origem da requisição
 * 3. ValidationPipe valida dados do body
 * 4. JwtAuthGuard valida token JWT
 * 5. PerfisGuard valida perfil do usuário
 * 6. Rota do controller é executada
 * 7. Service processa a lógica de negócio
 * 8. Repository acessa o banco de dados
 * 9. Resposta é retornada ao cliente
 * 
 * Se qualquer etapa falhar, retorna erro (400, 401, 403, etc.)
 */
