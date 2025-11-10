import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards 
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CriarUsuarioDto } from './dto/criar-usuario.dto';
import { AtualizarUsuarioDto } from './dto/atualizar-usuario.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PerfisGuard } from '../auth/guards/perfis.guard';
import { Perfis } from '../auth/decorators/perfis.decorator';

/**
 * Controller de Usuários
 * 
 * Gerencia CRUD de usuários
 * Apenas Administradores têm acesso total
 */
@Controller('usuarios')
@UseGuards(JwtAuthGuard, PerfisGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  /**
   * POST /usuarios
   * Cria novo usuário (apenas Admin)
   */
  @Post()
  @Perfis('Administrador')
  async criar(@Body() criarUsuarioDto: CriarUsuarioDto) {
    return this.usuariosService.criar(criarUsuarioDto);
  }

  /**
   * GET /usuarios
   * Lista todos os usuários (Admin e Dono)
   */
  @Get()
  @Perfis('Administrador', 'Dono')
  async listarTodos() {
    return this.usuariosService.listarTodos();
  }

  /**
   * GET /usuarios/perfil/:nome_perfil
   * Lista usuários por perfil (Admin e Dono)
   */
  @Get('perfil/:nome_perfil')
  @Perfis('Administrador', 'Dono')
  async listarPorPerfil(@Param('nome_perfil') nome_perfil: string) {
    return this.usuariosService.listarPorPerfil(nome_perfil);
  }

  /**
   * GET /usuarios/:id
   * Busca usuário por ID (Admin e Dono)
   */
  @Get(':id')
  @Perfis('Administrador', 'Dono')
  async buscarPorId(@Param('id') id: string) {
    return this.usuariosService.buscarPorId(id);
  }

  /**
   * PUT /usuarios/:id
   * Atualiza usuário (apenas Admin)
   */
  @Put(':id')
  @Perfis('Administrador')
  async atualizar(
    @Param('id') id: string,
    @Body() atualizarUsuarioDto: AtualizarUsuarioDto
  ) {
    return this.usuariosService.atualizar(id, atualizarUsuarioDto);
  }

  /**
   * PUT /usuarios/:id/desativar
   * Desativa usuário (apenas Admin)
   */
  @Put(':id/desativar')
  @Perfis('Administrador')
  async desativar(@Param('id') id: string) {
    await this.usuariosService.desativar(id);
    return { mensagem: 'Usuário desativado com sucesso' };
  }

  /**
   * PUT /usuarios/:id/reativar
   * Reativa usuário (apenas Admin)
   */
  @Put(':id/reativar')
  @Perfis('Administrador')
  async reativar(@Param('id') id: string) {
    await this.usuariosService.reativar(id);
    return { mensagem: 'Usuário reativado com sucesso' };
  }

  /**
   * DELETE /usuarios/:id
   * Deleta usuário permanentemente (apenas Admin)
   */
  @Delete(':id')
  @Perfis('Administrador')
  async deletar(@Param('id') id: string) {
    await this.usuariosService.deletar(id);
    return { mensagem: 'Usuário deletado com sucesso' };
  }
}


