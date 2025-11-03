import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module'; // Importe o módulo que criamos
import { Category } from './category.entity'; // Importe as entidades
import { Product } from './product.entity';
import { CategoriesModule } from './categories/categories.module';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'plataformatech.cloud',
      port: 5432,
      username: 'cardapio',
      password: 'nndXSiW6Wtjc664S', // <-- NÃO ESQUEÇA DE MUDAR!
      database: 'cardapio', // <-- A informação que você me deu!
      
      // Carrega as entidades que criamos
      // Você pode usar autoLoadEntities: true, mas assim é mais explícito
      entities: [Category, Product], 
      
      // MUITO IMPORTANTE:
      // Em desenvolvimento, "synchronize: true" faz o TypeORM
      // criar/atualizar as tabelas no banco automaticamente.
      // Em produção, isso deve ser "false".
      synchronize: true, 
    }),
    ProductsModule,
    CategoriesModule, // Carrega o módulo de Produtos (com o CRUD)
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}