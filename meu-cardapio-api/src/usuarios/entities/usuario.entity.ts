import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  OneToMany,
  CreateDateColumn, 
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Perfil } from '../../perfis/entities/perfil.entity';
import { Pedido } from '../../pedidos/entities/pedido.entity';

/**
 * Entidade Usuario
 * 
 * Representa todos os usuários do sistema (Admin, Dono, Cliente)
 * A diferenciação é feita através do perfil associado
 */
@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  nome_completo: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 255, select: false })
  senha_hash: string;

  @Column({ length: 20, nullable: true })
  telefone: string;

  @Column({ length: 500, nullable: true })
  foto_perfil_url: string;

  @Column({ default: true })
  ativo: boolean;

  @Column({ default: false })
  email_verificado: boolean;

  // Relacionamentos
  @ManyToOne(() => Perfil, (perfil) => perfil.usuarios, { eager: true })
  perfil: Perfil;

  @OneToMany(() => Pedido, (pedido) => pedido.usuario)
  pedidos: Pedido[];

  @CreateDateColumn()
  data_criacao: Date;

  @UpdateDateColumn()
  data_atualizacao: Date;

  /**
   * Criptografa a senha antes de inserir no banco
   */
  @BeforeInsert()
  @BeforeUpdate()
  async criptografarSenha() {
    if (this.senha_hash && !this.senha_hash.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(10);
      this.senha_hash = await bcrypt.hash(this.senha_hash, salt);
    }
  }

  /**
   * Valida se a senha fornecida está correta
   * 
   * @param senha Senha em texto plano para validar
   * @returns true se a senha está correta
   */
  async validarSenha(senha: string): Promise<boolean> {
    return bcrypt.compare(senha, this.senha_hash);
  }
}


