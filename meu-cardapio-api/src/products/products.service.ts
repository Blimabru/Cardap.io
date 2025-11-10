import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../product.entity';
import { Category } from '../category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    // Injeta o repositório do Produto
    @InjectRepository(Product)
    private productRepository: Repository<Product>,

    // Injeta o repositório da Categoria (precisamos dele para criar um produto)
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  // Lógica para Criar Produto (POST /products)
  async create(createProductDto: CreateProductDto): Promise<Product> {
    // 1. Separa o ID da categoria do resto dos dados
    const { categoryId, ...productData } = createProductDto;

    // 2. Busca a categoria no banco pelo ID recebido
    const category = await this.categoryRepository.findOneBy({ id: categoryId });

    // 3. Se a categoria não existir, lança um erro
    if (!category) {
      throw new NotFoundException(`Categoria com ID ${categoryId} não encontrada.`);
    }

    // 4. Se encontrou, cria a instância do produto
    const newProduct = this.productRepository.create({
      ...productData, // name, description, price, imageUrl
      category: category, // Associa a categoria que encontramos
    });

    // 5. Salva o novo produto no banco
    return this.productRepository.save(newProduct);
  }

  // Lógica para Listar Produtos (GET /products)
  findAll(): Promise<Product[]> {
    // Usamos 'relations: ['category']' para que o TypeORM
    // traga os dados da categoria junto (um "JOIN")
    return this.productRepository.find({
      relations: ['category'],
    });
  }

  // Lógica para Buscar Um Produto (GET /products/:id)
  async findOne(id: string): Promise<Product | null> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!product) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado.`);
    }
    return product;
  }

  /**
   * Atualiza produto existente
   * 
   * @param id ID do produto
   * @param updateProductDto Dados para atualizar
   * @returns Produto atualizado
   */
  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    if (!product) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado.`);
    }

    // Se está alterando a categoria
    if (updateProductDto.categoryId) {
      const category = await this.categoryRepository.findOneBy({ 
        id: updateProductDto.categoryId 
      });

      if (!category) {
        throw new NotFoundException(`Categoria com ID ${updateProductDto.categoryId} não encontrada.`);
      }

      product.category = category;
    }

    // Atualiza os campos do produto
    if (updateProductDto.name) product.name = updateProductDto.name;
    if (updateProductDto.description !== undefined) product.description = updateProductDto.description;
    if (updateProductDto.price !== undefined) product.price = updateProductDto.price;
    if (updateProductDto.imageUrl) product.imageUrl = updateProductDto.imageUrl;
    if (updateProductDto.rating !== undefined) product.rating = updateProductDto.rating;

    return this.productRepository.save(product);
  }

  /**
   * Remove produto
   * 
   * @param id ID do produto
   */
  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    
    if (!product) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado.`);
    }
    
    await this.productRepository.remove(product);
  }
}