import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne,
  OneToMany,
  CreateDateColumn, 
  UpdateDateColumn 
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { ItemPedido } from './item-pedido.entity';

/**
 * Status possíveis de um pedido
 */
export enum StatusPedido {
  PENDENTE = 'pendente',
  CONFIRMADO = 'confirmado',
  EM_PREPARO = 'em_preparo',
  PRONTO = 'pronto',
  SAIU_ENTREGA = 'saiu_entrega',
  ENTREGUE = 'entregue',
  CANCELADO = 'cancelado'
}

/**
 * Tipo de pedido
 */
export enum TipoPedido {
  LOCAL = 'local',
  DELIVERY = 'delivery',
  RETIRADA = 'retirada'
}

/**
 * Entidade Pedido
 * 
 * Representa um pedido realizado por um cliente
 */
@Entity('pedidos')
export class Pedido {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', unique: true, generated: 'increment' })
  numero_pedido: number;

  @Column({
    type: 'enum',
    enum: StatusPedido,
    default: StatusPedido.PENDENTE
  })
  status: StatusPedido;

  @Column({
    type: 'enum',
    enum: TipoPedido,
    default: TipoPedido.LOCAL
  })
  tipo_pedido: TipoPedido;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  taxa_entrega: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  taxa_servico: number;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Column('text', { nullable: true })
  observacoes: string;

  @Column('text', { nullable: true })
  endereco_entrega: string;

  // Relacionamentos
  @ManyToOne(() => Usuario, (usuario) => usuario.pedidos, { eager: true })
  usuario: Usuario;

  @OneToMany(() => ItemPedido, (item) => item.pedido, { cascade: true, eager: true })
  itens: ItemPedido[];

  @CreateDateColumn()
  data_criacao: Date;

  @UpdateDateColumn()
  data_atualizacao: Date;
}


