import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Category } from './category.entity';

@Entity('products') // Nome da tabela no banco
export class Product {
  // ... (id, name, description, price, imageUrl) ...
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  imageUrl: string;

  // --- ADICIONE ESTE BLOCO ---
  @Column('decimal', {
    precision: 3, // Permite números como 10.0 ou 9.5
    scale: 1,     // Uma casa decimal
    default: 0.0  // Se um produto for criado sem rating, ele será 0.0
  })
  rating: number;
  // --- FIM DO BLOCO ---

  @ManyToOne(() => Category, (category) => category.products)
  category: Category;
}