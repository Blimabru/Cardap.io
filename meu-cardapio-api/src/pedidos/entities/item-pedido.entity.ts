import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne
} from 'typeorm';
import { Pedido } from './pedido.entity';
import { Product } from '../../product.entity';

/**
 * Entidade ItemPedido
 * 
 * Representa cada item individual de um pedido
 * Armazena o preço no momento do pedido para manter histórico correto
 */
@Entity('itens_pedido')
export class ItemPedido {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', default: 1 })
  quantidade: number;

  @Column('decimal', { precision: 10, scale: 2 })
  preco_unitario: number;

  @Column('decimal', { precision: 10, scale: 2 })
  subtotal: number;

  @Column('text', { nullable: true })
  observacoes: string;

  // Relacionamentos
  @ManyToOne(() => Pedido, (pedido) => pedido.itens, { onDelete: 'CASCADE' })
  pedido: Pedido;

  @ManyToOne(() => Product, { eager: true })
  produto: Product;
}


