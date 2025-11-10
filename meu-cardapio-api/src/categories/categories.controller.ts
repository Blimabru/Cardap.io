/**
 * ============================================================================
 * CATEGORIES.CONTROLLER.TS - CONTROLLER DE CATEGORIAS
 * ============================================================================
 * 
 * Gerencia CRUD de categorias de produtos.
 * 
 * PERMISSÕES:
 * - GET: Público (qualquer pessoa)
 * - POST/PUT/DELETE: Apenas Administrador e Dono
 * 
 * REGRA IMPORTANTE:
 * - Não é possível deletar categoria se houver produtos associados
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
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PerfisGuard } from '../auth/guards/perfis.guard';
import { Perfis } from '../auth/decorators/perfis.decorator';
import { Public } from '../auth/decorators/public.decorator';

/**
 * Controller de Categorias
 * Gerencia CRUD de categorias de produtos
 */
@Controller('categories')
@UseGuards(JwtAuthGuard, PerfisGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * POST /categories
   * Cria nova categoria
   * 
   * PERMISSÕES: Admin e Dono
   * 
   * REQUEST: { "name": "Pizzas" }
   * RESPONSE: { "id": "uuid", "name": "Pizzas", ... }
   */
  @Post()
  @Perfis('Administrador', 'Dono')
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  /**
   * GET /categories
   * Lista todas as categorias
   * 
   * PERMISSÕES: Público
   * RESPONSE: [{ "id": "uuid", "name": "Pizzas" }, ...]
   */
  @Public()
  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  /**
   * GET /categories/:id
   * Busca categoria por ID
   * 
   * PERMISSÕES: Público
   */
  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  /**
   * PUT /categories/:id
   * Atualiza categoria
   * 
   * PERMISSÕES: Admin e Dono
   * REQUEST: { "name": "Pizzas Artesanais" }
   */
  @Put(':id')
  @Perfis('Administrador', 'Dono')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  /**
   * DELETE /categories/:id
   * Remove categoria
   * 
   * PERMISSÕES: Admin e Dono
   * 
   * REGRA: Não pode deletar se houver produtos associados
   * Erro 400: "Não é possível deletar categoria com produtos associados"
   */
  @Delete(':id')
  @Perfis('Administrador', 'Dono')
  async remove(@Param('id') id: string) {
    await this.categoriesService.remove(id);
    return { mensagem: 'Categoria removida com sucesso' };
  }
}
