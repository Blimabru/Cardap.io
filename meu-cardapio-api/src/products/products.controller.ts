/**
 * ============================================================================
 * PRODUCTS.CONTROLLER.TS - CONTROLLER DE PRODUTOS
 * ============================================================================
 * 
 * Gerencia o CRUD completo de produtos do cardápio.
 * 
 * PERMISSÕES:
 * - GET (listar/buscar): Público (qualquer pessoa)
 * - POST/PUT/DELETE: Apenas Administrador e Dono
 * 
 * ROTAS:
 * - GET    /products        → Lista todos os produtos (público)
 * - GET    /products/:id    → Busca produto por ID (público)
 * - POST   /products        → Cria produto (Admin/Dono)
 * - PUT    /products/:id    → Atualiza produto (Admin/Dono)
 * - DELETE /products/:id    → Remove produto (Admin/Dono)
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PerfisGuard } from '../auth/guards/perfis.guard';
import { Perfis } from '../auth/decorators/perfis.decorator';
import { Public } from '../auth/decorators/public.decorator';

/**
 * Controller de Produtos
 * 
 * @Controller('products') - Define prefixo /products
 * @UseGuards - Aplica guards em todas as rotas deste controller
 */
@Controller('products')
@UseGuards(JwtAuthGuard, PerfisGuard)
export class ProductsController {
  /**
   * Injeta ProductsService que contém a lógica de negócio
   */
  constructor(private readonly productsService: ProductsService) {}

  /**
   * ========================================================================
   * POST /products
   * ========================================================================
   * 
   * CRIA NOVO PRODUTO
   * 
   * PERMISSÕES: Apenas Administrador e Dono
   * 
   * REQUEST BODY:
   * {
   *   "name": "Pizza Margherita",
   *   "description": "Molho de tomate, mussarela e manjericão",
   *   "price": 45.90,
   *   "image_url": "https://...",
   *   "category_id": "uuid-da-categoria",
   *   "rating": 4.8
   * }
   * 
   * RESPONSE (201):
   * {
   *   "id": "uuid",
   *   "name": "Pizza Margherita",
   *   "description": "...",
   *   "price": 45.90,
   *   "image_url": "https://...",
   *   "rating": 4.8,
   *   "category": { "id": "uuid", "name": "Pizzas" },
   *   "created_at": "2025-11-10T...",
   *   "updated_at": "2025-11-10T..."
   * }
   */
  @Post()
  @Perfis('Administrador', 'Dono')
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  /**
   * ========================================================================
   * GET /products
   * ========================================================================
   * 
   * LISTA TODOS OS PRODUTOS
   * 
   * PERMISSÕES: Pública (qualquer pessoa)
   * 
   * QUERY PARAMS (opcional):
   * - search: Filtra por nome (ex: ?search=pizza)
   * 
   * RESPONSE (200):
   * [
   *   {
   *     "id": "uuid",
   *     "name": "Pizza Margherita",
   *     "description": "...",
   *     "price": 45.90,
   *     "image_url": "https://...",
   *     "rating": 4.8,
   *     "category": { "id": "uuid", "name": "Pizzas" }
   *   },
   *   { ... }
   * ]
   * 
   * COMPORTAMENTO:
   * - Retorna todos os produtos com suas categorias
   * - Ordenados por created_at DESC (mais recente primeiro)
   * - Se search fornecido, filtra por nome (implementar no service)
   */
  @Public()
  @Get()
  findAll(@Query('search') search?: string) {
    // TODO: Implementar busca por nome se search fornecido
    // Atualmente retorna todos independente de search
    return this.productsService.findAll();
  }

  /**
   * ========================================================================
   * GET /products/:id
   * ========================================================================
   * 
   * BUSCA PRODUTO POR ID
   * 
   * PERMISSÕES: Pública
   * 
   * PARAMS:
   * - id: UUID do produto
   * 
   * RESPONSE (200):
   * {
   *   "id": "uuid",
   *   "name": "Pizza Margherita",
   *   "description": "...",
   *   "price": 45.90,
   *   "image_url": "https://...",
   *   "rating": 4.8,
   *   "category": { "id": "uuid", "name": "Pizzas" }
   * }
   * 
   * RESPONSE (404):
   * {
   *   "statusCode": 404,
   *   "message": "Produto não encontrado"
   * }
   */
  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  /**
   * ========================================================================
   * PUT /products/:id
   * ========================================================================
   * 
   * ATUALIZA PRODUTO EXISTENTE
   * 
   * PERMISSÕES: Apenas Administrador e Dono
   * 
   * PARAMS:
   * - id: UUID do produto
   * 
   * REQUEST BODY (todos os campos opcionais):
   * {
   *   "name": "Pizza Margherita Premium",
   *   "price": 49.90,
   *   "rating": 4.9
   * }
   * 
   * RESPONSE (200):
   * {
   *   "id": "uuid",
   *   "name": "Pizza Margherita Premium",
   *   "price": 49.90,
   *   "rating": 4.9,
   *   ...
   * }
   * 
   * COMPORTAMENTO:
   * - Atualiza apenas campos fornecidos (partial update)
   * - Mantém outros campos inalterados
   * - updated_at é atualizado automaticamente
   */
  @Put(':id')
  @Perfis('Administrador', 'Dono')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  /**
   * ========================================================================
   * DELETE /products/:id
   * ========================================================================
   * 
   * REMOVE PRODUTO DO SISTEMA
   * 
   * PERMISSÕES: Apenas Administrador e Dono
   * 
   * PARAMS:
   * - id: UUID do produto
   * 
   * RESPONSE (200):
   * {
   *   "mensagem": "Produto removido com sucesso"
   * }
   * 
   * RESPONSE (404):
   * {
   *   "statusCode": 404,
   *   "message": "Produto não encontrado"
   * }
   * 
   * COMPORTAMENTO:
   * - Remove produto permanentemente do banco
   * - Itens de pedidos existentes mantêm referência ao produto removido
   * - CUIDADO: Ação irreversível!
   */
  @Delete(':id')
  @Perfis('Administrador', 'Dono')
  async remove(@Param('id') id: string) {
    await this.productsService.remove(id);
    return { mensagem: 'Produto removido com sucesso' };
  }
}

/**
 * ============================================================================
 * VALIDAÇÕES (CreateProductDto e UpdateProductDto)
 * ============================================================================
 * 
 * CREATE (todos obrigatórios exceto rating e description):
 * - name: string (não vazio)
 * - price: number (positivo)
 * - image_url: string (URL válida)
 * - category_id: string (UUID válido, categoria deve existir)
 * - description: string (opcional)
 * - rating: number (0-10, opcional, padrão 0)
 * 
 * UPDATE (todos opcionais):
 * - Mesmas validações quando fornecidos
 * - Permite atualização parcial
 */
