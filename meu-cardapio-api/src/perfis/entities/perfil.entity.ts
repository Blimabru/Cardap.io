import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';

/**
 * Entidade Perfil
 * 
 * Define os perfis/papéis de usuário no sistema:
 * - Administrador: Controle total do sistema
 * - Dono: Gerencia cardápio e pedidos
 * - Cliente: Faz pedidos
 */
@Entity('perfis')
export class Perfil {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  nome_perfil: string;

  @Column('text', { nullable: true })
  descricao: string;

  /**
   * Permissões armazenadas em formato JSON
   * 
   * Estrutura exemplo:
   * {
   *   "paginas": {
   *     "dashboard": { "acessar": true, "visualizar": true, "editar": false },
   *     "produtos": { "acessar": true, "visualizar": true, "editar": true, "deletar": true }
   *   },
   *   "funcionalidades": {
   *     "criar_produto": true,
   *     "deletar_produto": true,
   *     "cancelar_pedido": true
   *   }
   * }
   */
  @Column('jsonb', { default: {} })
  permissoes: Record<string, any>;

  @Column({ default: true })
  ativo: boolean;

  // Relacionamentos
  @OneToMany(() => Usuario, (usuario) => usuario.perfil)
  usuarios: Usuario[];

  @CreateDateColumn()
  data_criacao: Date;

  @UpdateDateColumn()
  data_atualizacao: Date;
}


