import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Product } from './product.entity';

@Entity('categories') // Nome da tabela no banco
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  // Uma categoria pode ter vários produtos
  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}