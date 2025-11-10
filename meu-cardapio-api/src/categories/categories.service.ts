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

  /**
   * Atualiza categoria existente
   * 
   * @param id ID da categoria
   * @param updateCategoryDto Dados para atualizar
   * @returns Categoria atualizada
   */
  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);
    
    if (!category) {
      throw new Error(`Categoria com ID ${id} não encontrada`);
    }

    // Atualiza os campos
    Object.assign(category, updateCategoryDto);
    
    return this.categoryRepository.save(category);
  }

  /**
   * Remove categoria
   * Apenas se não tiver produtos associados
   * 
   * @param id ID da categoria
   */
  async remove(id: string): Promise<void> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['products'],
    });
    
    if (!category) {
      throw new Error(`Categoria com ID ${id} não encontrada`);
    }

    // Verifica se tem produtos associados
    if (category.products && category.products.length > 0) {
      throw new Error(`Não é possível deletar categoria que possui produtos associados. Remova ou mova os produtos primeiro.`);
    }

    await this.categoryRepository.remove(category);
  }
}