import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // Importe o TypeOrmModule
import { Category } from '../category.entity';
import { Product } from '../product.entity'; // Importe sua entidade
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Category]), // Registre a entidade aqui
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}