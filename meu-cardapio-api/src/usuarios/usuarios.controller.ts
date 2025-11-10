/**
 * ============================================================================
 * USUARIOS.CONTROLLER.TS - CONTROLLER DE USUÁRIOS
 * ============================================================================
 * 
 * Gerencia CRUD completo de usuários do sistema.
 * 
 * PERMISSÕES:
 * - Criar/Atualizar/Deletar: Apenas Administrador
 * - Listar: Administrador e Dono
 * 
 * FUNCIONALIDADES:
 * - Criar usuário com qualquer perfil (Admin, Dono, Cliente)
 * - Listar todos os usuários
 * - Listar por perfil
 * - Atualizar dados do usuário
 * - Desativar/Reativar usuário (soft delete)
 * - Deletar permanentemente
 */

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
 * Todas as rotas requerem autenticação JWT
 */
@Controller('usuarios')
@UseGuards(JwtAuthGuard, PerfisGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  /**
   * POST /usuarios
   * Cria novo usuário no sistema
   * 
   * PERMISSÕES: Apenas Administrador
   * 
   * DIFERENÇA DE /auth/registro:
   * - /auth/registro: Qualquer pessoa cria conta Cliente (público)
   * - /usuarios (esta rota): Admin cria usuário com qualquer perfil (protegido)
   * 
   * REQUEST:
   * {
   *   "nome_completo": "João Silva",
   *   "email": "joao@email.com",
   *   "senha": "senha123",
   *   "telefone": "(11) 98765-4321",
   *   "id_perfil": "uuid-do-perfil" // Admin, Dono ou Cliente
   * }
   */
  @Post()
  @Perfis('Administrador')
  async criar(@Body() criarUsuarioDto: CriarUsuarioDto) {
    return this.usuariosService.criar(criarUsuarioDto);
  }

  /**
   * GET /usuarios
   * Lista todos os usuários do sistema
   * 
   * PERMISSÕES: Administrador e Dono
   * 
   * RESPONSE:
   * [
   *   {
   *     "id": "uuid",
   *     "nome_completo": "João Silva",
   *     "email": "joao@email.com",
   *     "telefone": "(11) 98765-4321",
   *     "ativo": true,
   *     "perfil": { "id": "uuid", "nome_perfil": "Cliente" },
   *     "criado_em": "2025-11-10T...",
   *     "atualizado_em": "2025-11-10T..."
   *   },
   *   ...
   * ]
   * 
   * NOTA: Senha NUNCA é retornada
   */
  @Get()
  @Perfis('Administrador', 'Dono')
  async listarTodos() {
    return this.usuariosService.listarTodos();
  }

  /**
   * GET /usuarios/perfil/:nome_perfil
   * Lista usuários por perfil específico
   * 
   * PERMISSÕES: Administrador e Dono
   * 
   * EXEMPLOS:
   * - GET /usuarios/perfil/Administrador
   * - GET /usuarios/perfil/Dono
   * - GET /usuarios/perfil/Cliente
   */
  @Get('perfil/:nome_perfil')
  @Perfis('Administrador', 'Dono')
  async listarPorPerfil(@Param('nome_perfil') nome_perfil: string) {
    return this.usuariosService.listarPorPerfil(nome_perfil);
  }

  /**
   * GET /usuarios/:id
   * Busca usuário específico por ID
   * 
   * PERMISSÕES: Administrador e Dono
   */
  @Get(':id')
  @Perfis('Administrador', 'Dono')
  async buscarPorId(@Param('id') id: string) {
    return this.usuariosService.buscarPorId(id);
  }

  /**
   * PUT /usuarios/:id
   * Atualiza dados do usuário
   * 
   * PERMISSÕES: Apenas Administrador
   * 
   * REQUEST (todos campos opcionais):
   * {
   *   "nome_completo": "João Silva Junior",
   *   "email": "novoemail@email.com",
   *   "telefone": "(11) 99999-9999",
   *   "senha": "novasenha123",
   *   "id_perfil": "uuid-novo-perfil"
   * }
   * 
   * COMPORTAMENTO:
   * - Atualiza apenas campos fornecidos
   * - Se senha fornecida, é hashada automaticamente
   * - Se email alterado, valida se não está em uso
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
   * Desativa usuário (soft delete)
   * 
   * PERMISSÕES: Apenas Administrador
   * 
   * COMPORTAMENTO:
   * - Define campo ativo = false
   * - Usuário NÃO é deletado do banco
   * - Não consegue mais fazer login
   * - Pode ser reativado com /reativar
   * - Dados são preservados
   */
  @Put(':id/desativar')
  @Perfis('Administrador')
  async desativar(@Param('id') id: string) {
    await this.usuariosService.desativar(id);
    return { mensagem: 'Usuário desativado com sucesso' };
  }

  /**
   * PUT /usuarios/:id/reativar
   * Reativa usuário previamente desativado
   * 
   * PERMISSÕES: Apenas Administrador
   * 
   * COMPORTAMENTO:
   * - Define campo ativo = true
   * - Usuário volta a conseguir fazer login
   */
  @Put(':id/reativar')
  @Perfis('Administrador')
  async reativar(@Param('id') id: string) {
    await this.usuariosService.reativar(id);
    return { mensagem: 'Usuário reativado com sucesso' };
  }

  /**
   * DELETE /usuarios/:id
   * Deleta usuário permanentemente do banco
   * 
   * PERMISSÕES: Apenas Administrador
   * 
   * COMPORTAMENTO:
   * - Remove registro do banco de dados
   * - AÇÃO IRREVERSÍVEL!
   * - Pedidos do usuário são mantidos (integridade referencial)
   * - Use com CUIDADO!
   * 
   * RECOMENDAÇÃO:
   * - Prefira usar /desativar ao invés de deletar
   * - Deletar apenas em casos excepcionais
   */
  @Delete(':id')
  @Perfis('Administrador')
  async deletar(@Param('id') id: string) {
    await this.usuariosService.deletar(id);
    return { mensagem: 'Usuário deletado com sucesso' };
  }
}

/**
 * ============================================================================
 * DIFERENÇAS: DESATIVAR vs DELETAR
 * ============================================================================
 * 
 * DESATIVAR (/usuarios/:id/desativar):
 * ✅ Usuário não consegue fazer login
 * ✅ Dados são preservados
 * ✅ Pode ser revertido (/reativar)
 * ✅ Histórico mantido
 * ✅ RECOMENDADO para maioria dos casos
 * 
 * DELETAR (/usuarios/:id):
 * ❌ Usuário é removido permanentemente
 * ❌ Dados são perdidos
 * ❌ NÃO pode ser revertido
 * ❌ Histórico parcialmente mantido (pedidos permanecem)
 * ⚠️  Usar apenas em casos excepcionais
 */
