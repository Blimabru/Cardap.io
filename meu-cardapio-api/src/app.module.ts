import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

// Configuração
import { configuracaoBancoDados } from './config/database.config';

// Módulos
import { AuthModule } from './auth/auth.module';
import { PerfisModule } from './perfis/perfis.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { PedidosModule } from './pedidos/pedidos.module';

// Guards
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { PerfisGuard } from './auth/guards/perfis.guard';

/**
 * Módulo principal da aplicação
 * 
 * Configura banco de dados, variáveis de ambiente e todos os módulos
 */
@Module({
  imports: [
    // Carrega variáveis de ambiente do arquivo .env
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Configura TypeORM com PostgreSQL
    TypeOrmModule.forRoot(configuracaoBancoDados()),

    // Módulos da aplicação
    AuthModule,
    PerfisModule,
    UsuariosModule,
    ProductsModule,
    CategoriesModule,
    PedidosModule,
  ],
  controllers: [],
  providers: [
    // Define JwtAuthGuard como guard global
    // Todas as rotas requerem autenticação por padrão
    // Use @Public() para rotas públicas
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Guard de perfis (autorização)
    {
      provide: APP_GUARD,
      useClass: PerfisGuard,
    },
  ],
})
export class AppModule {}
