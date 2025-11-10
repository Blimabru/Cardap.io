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
 * 
 * Gerencia CRUD de categorias
 * Leitura é pública, escrita apenas para Admin e Dono
 */
@Controller('categories')
@UseGuards(JwtAuthGuard, PerfisGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * POST /categories
   * Cria nova categoria (Admin e Dono)
   */
  @Post()
  @Perfis('Administrador', 'Dono')
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  /**
   * GET /categories
   * Lista todas as categorias (público)
   */
  @Public()
  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  /**
   * GET /categories/:id
   * Busca categoria por ID (público)
   */
  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  /**
   * PUT /categories/:id
   * Atualiza categoria (Admin e Dono)
   */
  @Put(':id')
  @Perfis('Administrador', 'Dono')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  /**
   * DELETE /categories/:id
   * Remove categoria (Admin e Dono)
   */
  @Delete(':id')
  @Perfis('Administrador', 'Dono')
  async remove(@Param('id') id: string) {
    await this.categoriesService.remove(id);
    return { mensagem: 'Categoria removida com sucesso' };
  }
}
