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

  update(id: string, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: string) {
    return `This action removes a #${id} product`;
  }
}