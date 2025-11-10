import { IsNotEmpty, IsArray, ValidateNested, IsOptional, IsString, IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TipoPedido } from '../entities/pedido.entity';

/**
 * DTO para item de pedido
 */
export class ItemPedidoDto {
  @IsNotEmpty({ message: 'ID do produto é obrigatório' })
  @IsString()
  id_produto: string;

  @IsNotEmpty({ message: 'Quantidade é obrigatória' })
  @IsNumber({}, { message: 'Quantidade deve ser um número' })
  @Min(1, { message: 'Quantidade mínima é 1' })
  quantidade: number;

  @IsOptional()
  @IsString()
  observacoes?: string;
}

/**
 * DTO para criação de pedido
 */
export class CriarPedidoDto {
  @IsNotEmpty({ message: 'Itens são obrigatórios' })
  @IsArray({ message: 'Itens devem ser um array' })
  @ValidateNested({ each: true })
  @Type(() => ItemPedidoDto)
  itens: ItemPedidoDto[];

  @IsNotEmpty({ message: 'Tipo de pedido é obrigatório' })
  @IsEnum(TipoPedido, { message: 'Tipo de pedido inválido' })
  tipo_pedido: TipoPedido;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsOptional()
  @IsString()
  endereco_entrega?: string;

  @IsOptional()
  @IsNumber()
  taxa_entrega?: number;
}


