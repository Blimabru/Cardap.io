import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  // Injeta o "Repositório" (a ferramenta para falar com a tabela 'categories')
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  // Lógica para Criar Categoria (POST /categories)
  create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const newCategory = this.categoryRepository.create(createCategoryDto);
    return this.categoryRepository.save(newCategory);
  }

  // Lógica para Listar Categorias (GET /categories)
  findAll(): Promise<Category[]> {
    return this.categoryRepository.find();
  }

  // (O Nest gerou os outros métodos, podemos deixá-los por enquanto)

  findOne(id: string): Promise<Category | null> {
    return this.categoryRepository.findOneBy({ id });
  }

  update(id: string, updateCategoryDto: UpdateCategoryDto) {
    // Implementação do Update (podemos fazer depois)
    return `This action updates a #${id} category`;
  }

  remove(id: string) {
    // Implementação do Remove (podemos fazer depois)
    return `This action removes a #${id} category`;
  }
}