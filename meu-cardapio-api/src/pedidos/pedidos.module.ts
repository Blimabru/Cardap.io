import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedidosService } from './pedidos.service';
import { PedidosController } from './pedidos.controller';
import { Pedido } from './entities/pedido.entity';
import { ItemPedido } from './entities/item-pedido.entity';
import { Product } from '../product.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';

/**
 * Módulo de Pedidos
 * 
 * Gerencia todo o ciclo de vida dos pedidos
 */
@Module({
  imports: [TypeOrmModule.forFeature([Pedido, ItemPedido, Product, Usuario])],
  controllers: [PedidosController],
  providers: [PedidosService],
  exports: [PedidosService],
})
export class PedidosModule {}


