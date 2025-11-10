import { IsNotEmpty, IsEnum } from 'class-validator';
import { StatusPedido } from '../entities/pedido.entity';

/**
 * DTO para atualização de status do pedido
 */
export class AtualizarStatusPedidoDto {
  @IsNotEmpty({ message: 'Status é obrigatório' })
  @IsEnum(StatusPedido, { message: 'Status inválido' })
  status: StatusPedido;
}


