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
 * Gerencia CRUD de produtos
 * Leitura é pública, escrita apenas para Admin e Dono
 */
@Controller('products')
@UseGuards(JwtAuthGuard, PerfisGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * POST /products
   * Cria novo produto (Admin e Dono)
   */
  @Post()
  @Perfis('Administrador', 'Dono')
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  /**
   * GET /products
   * Lista todos os produtos (público)
   * Pode filtrar por nome usando query param ?search=
   */
  @Public()
  @Get()
  findAll(@Query('search') search?: string) {
    // TODO: Implementar busca se o parâmetro for fornecido
    return this.productsService.findAll();
  }

  /**
   * GET /products/:id
   * Busca produto por ID (público)
   */
  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  /**
   * PUT /products/:id
   * Atualiza produto (Admin e Dono)
   */
  @Put(':id')
  @Perfis('Administrador', 'Dono')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  /**
   * DELETE /products/:id
   * Remove produto (Admin e Dono)
   */
  @Delete(':id')
  @Perfis('Administrador', 'Dono')
  async remove(@Param('id') id: string) {
    await this.productsService.remove(id);
    return { mensagem: 'Produto removido com sucesso' };
  }
}
